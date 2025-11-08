console.log('Testing API endpoints...');

// Test courses API
fetch('http://localhost:3001/api/courses')
  .then(res => {
    console.log('Courses API Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Courses API Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Courses API Error:', error);
  });

// Test curriculum API with our test course ID
const courseId = '6907359f04e2fbae0192d025';
fetch(`http://localhost:3001/api/courses/${courseId}/curriculum`)
  .then(res => {
    console.log('Curriculum API Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Curriculum API Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Curriculum API Error:', error);
  });