// Test script to simulate saving a curriculum item with attachments through the API
const https = require('https');
const http = require('http');

const courseId = '682dc09eee69e6dc98f167f6'; // Test course ID

const testData = {
  curriculum: {
    modules: [
      {
        name: "Module 1",
        description: "Test module",
        items: [
          {
            type: "resource",
            title: "Test Resource With Attachment",
            description: "This is a test resource with attachment",
            scheduledDate: new Date().toISOString(),
            resourceType: "pdf",
            attachments: [
              {
                url: "/uploads/test_file.pdf",
                name: "test_file.pdf",
                type: "application/pdf"
              }
            ],
            driveLinks: [],
            createdAt: new Date().toISOString(),
            isPublished: true
          }
        ],
        isPublished: true,
        order: 0
      }
    ]
  }
};

console.log('Sending data to API:');
console.log(JSON.stringify(testData, null, 2));

const data = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/admin/courses/${courseId}/curriculum`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`\nStatus: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
    
    if (res.statusCode === 200) {
      console.log('\n✅ API call successful! Now checking database...');
      // Can verify with check-attachments.js
    } else {
      console.log('\n❌ API call failed');
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(data);
req.end();
