const http = require('http');

const data = JSON.stringify({
  text: "Hello! I am Jarvis. Testing the TTS endpoint.",
  voice: "en-US-AriaNeural"
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/tts/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let responseBody = '';
  res.on('data', chunk => {
    responseBody += chunk;
  });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`RESPONSE: ${responseBody}`);
  });
});

req.on('error', error => {
  console.error('Error making request:', error);
});

req.write(data);
req.end();
