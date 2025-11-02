/**
 * Activity Tracker Utility
 * Tracks user activities like quiz completions, lesson progress, enrollments
 * for display in the dashboard Recent Activity section
 */

export interface ActivityData {
    userId: string;
    courseName?: string;
    lessonName?: string;
    quizTitle?: string;
    score?: number;
    enrolledAt?: string;
    completedAt?: string;
}

/**
 * Log quiz completion activity
 */
export function logQuizActivity(data: ActivityData & { quizTitle: string; score: number }) {
    if (typeof window === 'undefined') return;

    const quizKey = `quiz_${data.courseName?.replace(/\s+/g, '_').toLowerCase() || 'course'}_${data.userId}_${data.quizTitle.replace(/\s+/g, '_').toLowerCase()}`;
    
    const activityData = {
        userId: data.userId,
        quizTitle: data.quizTitle,
        courseName: data.courseName || 'Course',
        score: data.score,
        completedAt: data.completedAt || new Date().toISOString()
    };

    localStorage.setItem(quizKey, JSON.stringify(activityData));
    
    // Trigger storage event for same-tab updates
    window.dispatchEvent(new Event('storage'));
    
    console.log('Quiz activity logged:', quizKey);
}

/**
 * Log lesson completion activity
 */
export function logLessonActivity(data: ActivityData & { lessonName: string }) {
    if (typeof window === 'undefined') return;

    const lessonKey = `lesson_${data.courseName?.replace(/\s+/g, '_').toLowerCase() || 'course'}_${data.userId}_${data.lessonName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    
    const activityData = {
        userId: data.userId,
        lessonName: data.lessonName,
        courseName: data.courseName || 'Course',
        completedAt: data.completedAt || new Date().toISOString()
    };

    localStorage.setItem(lessonKey, JSON.stringify(activityData));
    
    // Trigger storage event for same-tab updates
    window.dispatchEvent(new Event('storage'));
    
    console.log('Lesson activity logged:', lessonKey);
}

/**
 * Log course enrollment activity
 */
export function logEnrollmentActivity(data: ActivityData & { courseName: string }) {
    if (typeof window === 'undefined') return;

    const enrollmentKey = `enrollment_${data.userId}_${data.courseName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    
    const activityData = {
        userId: data.userId,
        courseName: data.courseName,
        enrolledAt: data.enrolledAt || new Date().toISOString()
    };

    localStorage.setItem(enrollmentKey, JSON.stringify(activityData));
    
    // Trigger storage event for same-tab updates
    window.dispatchEvent(new Event('storage'));
    
    console.log('Enrollment activity logged:', enrollmentKey);
}

/**
 * Get all activities for a user
 */
export function getUserActivities(userId: string): any[] {
    if (typeof window === 'undefined') return [];

    const activities: any[] = [];
    const keys = Object.keys(localStorage);
    
    const userActivityKeys = keys.filter(key => 
        (key.startsWith('quiz_') || 
         key.startsWith('lesson_') || 
         key.startsWith('enrollment_')) &&
        localStorage.getItem(key)?.includes(userId)
    );

    userActivityKeys.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            if (!data) return;

            const parsedData = JSON.parse(data);
            
            if (parsedData.userId === userId) {
                activities.push({
                    key,
                    ...parsedData,
                    type: key.startsWith('quiz_') ? 'quiz' : 
                          key.startsWith('lesson_') ? 'lesson' : 'enrollment'
                });
            }
        } catch (error) {
            console.error('Error parsing activity:', error);
        }
    });

    return activities.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.enrolledAt).getTime();
        const dateB = new Date(b.completedAt || b.enrolledAt).getTime();
        return dateB - dateA; // Newest first
    });
}

/**
 * Clear all activities for a user (useful for testing)
 */
export function clearUserActivities(userId: string) {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const userActivityKeys = keys.filter(key => 
        (key.startsWith('quiz_') || 
         key.startsWith('lesson_') || 
         key.startsWith('enrollment_')) &&
        localStorage.getItem(key)?.includes(userId)
    );

    userActivityKeys.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log(`Cleared ${userActivityKeys.length} activities for user ${userId}`);
}
