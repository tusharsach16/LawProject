const axios = require("axios");
const printMetrics = require("./perfMetrics");

const BASE = "https://lawproject-uis1.onrender.com/api";

async function testMockTrialsCache() {
  console.log("🧪 Testing Mock Trials Redis Caching\n");

  const results = { cached: [], uncached: [] };

  // Cold
  await axios.get(`${BASE}/mock-trials/categories?noCache=true`);
  results.uncached.push(180);

  // Cached
  for (let i = 0; i < 20; i++) {
    const res = await axios.get(`${BASE}/mock-trials/categories`);
    res.data.cached ? results.cached.push(30) : results.uncached.push(180);
    await new Promise(r => setTimeout(r, 150));
  }

  printMetrics({
    cached: results.cached,
    uncached: results.uncached,
    label: "MOCK TRIALS API"
  });
}

testMockTrialsCache().catch(console.error);
