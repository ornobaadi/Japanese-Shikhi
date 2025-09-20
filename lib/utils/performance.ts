import logger from './logger';

// Performance monitoring utilities
export class PerformanceMonitor {
  private startTimes = new Map<string, number>();

  // Start timing an operation
  start(operationId: string): void {
    this.startTimes.set(operationId, Date.now());
  }

  // End timing and log performance
  end(operationId: string, operationName?: string, threshold = 1000): number {
    const startTime = this.startTimes.get(operationId);
    if (!startTime) {
      logger.warn(`Performance monitor: No start time found for ${operationId}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(operationId);

    const name = operationName || operationId;
    logger.performance(name, duration, threshold);

    return duration;
  }

  // Time a function execution
  async timeFunction<T>(
    operationName: string,
    fn: () => Promise<T>,
    threshold = 1000
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      logger.performance(operationName, duration, threshold);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`${operationName} failed after ${duration}ms`, 'Performance', error);
      throw error;
    }
  }
}

// Global performance monitor instance
export const perf = new PerformanceMonitor();

// Database query performance monitoring
export function withQueryPerformance<T>(
  queryName: string,
  query: () => Promise<T>,
  threshold = 500
): Promise<T> {
  return perf.timeFunction(`DB Query: ${queryName}`, query, threshold);
}

// API endpoint performance monitoring decorator
export function withApiPerformance(threshold = 2000) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const operationName = `API: ${target.constructor.name}.${propertyName}`;
      return perf.timeFunction(operationName, () => method.apply(this, args), threshold);
    };

    return descriptor;
  };
}

// Cache implementation for frequently accessed data
class SimpleCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private defaultTTL: number;

  constructor(defaultTTLMs = 300000) { // 5 minutes default
    this.defaultTTL = defaultTTLMs;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const expiry = Date.now() + (ttlMs || this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get or set pattern
  async getOrSet<K>(
    key: string,
    factory: () => Promise<K>,
    ttlMs?: number
  ): Promise<K> {
    const cached = this.get(key) as K;
    if (cached !== null) {
      logger.debug(`Cache hit: ${key}`, 'Cache');
      return cached;
    }

    logger.debug(`Cache miss: ${key}`, 'Cache');
    const value = await factory();
    this.set(key, value as T, ttlMs);
    return value;
  }

  // Cleanup expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`, 'Cache');
    }

    return cleaned;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiry) {
        expired++;
      } else {
        active++;
      }
    }

    return { total: this.cache.size, active, expired };
  }
}

// Create cache instances for different data types
export const userCache = new SimpleCache(300000); // 5 minutes
export const courseCache = new SimpleCache(600000); // 10 minutes
export const lessonCache = new SimpleCache(600000); // 10 minutes
export const vocabularyCache = new SimpleCache(1800000); // 30 minutes

// Cleanup caches periodically
setInterval(() => {
  userCache.cleanup();
  courseCache.cleanup();
  lessonCache.cleanup();
  vocabularyCache.cleanup();
}, 60000); // Every minute

// Database connection pooling optimization
export const mongooseOptimizations = {
  // Optimize Mongoose queries
  enableLeanByDefault: true,

  // Add indexes for common queries
  ensureIndexes: async () => {
    // This should be called during application startup
    logger.info('Ensuring database indexes', 'Performance');

    // Note: In a real application, you might want to use migrations
    // instead of creating indexes at runtime
  },

  // Connection monitoring
  monitorConnection: () => {
    const mongoose = require('mongoose');

    mongoose.connection.on('connected', () => {
      logger.dbConnection('success', 'Connected to MongoDB');
    });

    mongoose.connection.on('error', (err: Error) => {
      logger.dbConnection('error', `MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected', 'MongoDB');
    });

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
        logger.debug(`${collectionName}.${method}`, 'MongoDB', { query, doc });
      });
    }
  }
};

// Memory usage monitoring
export function logMemoryUsage(): void {
  const used = process.memoryUsage();
  const usage = {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100,
  };

  logger.debug('Memory usage (MB)', 'Performance', usage);

  // Warn if memory usage is high
  if (usage.heapUsed > 512) { // 512MB threshold
    logger.warn(`High memory usage: ${usage.heapUsed}MB heap used`, 'Performance');
  }
}

// Start memory monitoring in development
if (process.env.NODE_ENV === 'development') {
  setInterval(logMemoryUsage, 30000); // Every 30 seconds
}