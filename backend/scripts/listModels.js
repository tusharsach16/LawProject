// listModels.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });


const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GOOGLE_GEMINI_API_KEY missing in .env");
  console.error("Looking in:", path.join(__dirname, "..", ".env"));
  process.exit(1);
}

(async () => {
  try {
    console.log("📡 Fetching available Gemini models...");

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log("🔍 Status:", response.status, response.statusText);

    if (!response.ok) {
      console.error("❌ API Error:", JSON.stringify(data, null, 2));
      return;
    }

    console.log("\n✨ Available Models:");
    for (let i = 0; i < data.models.length; i++) {
      console.log(`${i + 1}. ${data.models[i].name}`);
    }
    console.log("\n✔️ Done!");
  } catch (err) {
    console.error("💥 Error:", err);
  }
})();
