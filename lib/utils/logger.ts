// Simple logging utility for the application
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, context, message } = entry;
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case 'error':
        console.error(formattedMessage, error || data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, data || '');
        }
        break;
      case 'info':
      default:
        console.log(formattedMessage, data || '');
        break;
    }

    // In production, you might want to send logs to a service like:
    // - Winston with file transport
    // - DataDog
    // - LogRocket
    // - Sentry for errors
  }

  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, error?: Error | any) {
    this.log('error', message, context, undefined, error);
  }

  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data);
  }

  // Database specific logging methods
  dbConnection(status: 'success' | 'error', details?: string) {
    const message = `Database connection ${status}`;
    if (status === 'success') {
      this.info(message, 'MongoDB', details);
    } else {
      this.error(message, 'MongoDB', details);
    }
  }

  dbQuery(operation: string, collection: string, duration?: number, error?: Error) {
    const context = `MongoDB:${collection}`;
    const durationStr = duration ? ` (${duration}ms)` : '';

    if (error) {
      this.error(`${operation} failed${durationStr}`, context, error);
    } else {
      this.debug(`${operation} completed${durationStr}`, context);
    }
  }

  // API specific logging methods
  apiRequest(method: string, path: string, userId?: string, duration?: number) {
    const context = 'API';
    const userStr = userId ? ` [User: ${userId}]` : '';
    const durationStr = duration ? ` (${duration}ms)` : '';
    this.info(`${method} ${path}${userStr}${durationStr}`, context);
  }

  apiError(method: string, path: string, error: Error, userId?: string) {
    const context = 'API';
    const userStr = userId ? ` [User: ${userId}]` : '';
    this.error(`${method} ${path}${userStr}`, context, error);
  }

  // Authentication specific logging
  authSuccess(userId: string, action: string) {
    this.info(`${action} successful`, 'Auth', { userId });
  }

  authFailure(action: string, reason: string, attempt?: any) {
    this.warn(`${action} failed: ${reason}`, 'Auth', attempt);
  }

  // User activity logging
  userActivity(userId: string, action: string, details?: any) {
    this.info(`User ${action}`, 'Activity', { userId, ...details });
  }

  // Performance monitoring
  performance(operation: string, duration: number, threshold = 1000) {
    const context = 'Performance';
    if (duration > threshold) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`, context);
    } else {
      this.debug(`${operation} completed in ${duration}ms`, context);
    }
  }
}

export const logger = new Logger();
export default logger;