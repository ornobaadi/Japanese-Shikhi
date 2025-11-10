// Simple test to check if the models are loading correctly
const { User, Course, QuizSubmission, AssignmentSubmission } = require('./lib/models');

console.log('Testing model imports:');
console.log('User:', typeof User);
console.log('Course:', typeof Course);
console.log('QuizSubmission:', typeof QuizSubmission);
console.log('AssignmentSubmission:', typeof AssignmentSubmission);
console.log('All models loaded successfully!');