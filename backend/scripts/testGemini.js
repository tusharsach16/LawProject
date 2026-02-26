// backend/src/testGemini.js

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'), // ensures it loads backend/.env
});

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GOOGLE_GEMINI_API_KEY) {
  console.error('❌ GOOGLE_GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🔑 API Key found:', GOOGLE_GEMINI_API_KEY.substring(0, 10) + '...');

const testGeminiAPI = async () => {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [{ text: 'Hello! Please respond with a simple greeting.' }],
      },
    ],
  };

  console.log('📡 Testing Gemini API...');

  try {
    // Node 22 already has global fetch
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', JSON.stringify(data, null, 2));
      return;
    }

    if (data.candidates && data.candidates[0]) {
      console.log('✅ API Test SUCCESSFUL!');
      console.log('🤖 Gemini Response:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('⚠️ No candidates in response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
};

testGeminiAPI();
