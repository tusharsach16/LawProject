const axios = require("axios");
const printMetrics = require("./perfMetrics");

const BASE = "https://lawproject-uis1.onrender.com/api";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjgyNjJjNjkzOTU5NWVmNjkxYmQyYiIsInJvbGUiOiJsYXdzdHVkZW50IiwidXNlcm5hbWUiOiJwYXJ1bDA2IiwiaWF0IjoxNzY5MDIxNTQ5LCJleHAiOjE3NjkxMDc5NDl9.T8C-WXEkYHIIYw-cVbnncTPzCnUKPYnD7BWjzvUHMOc";

const api = axios.create({
  baseURL: BASE,
  headers: { Authorization: `Bearer ${TOKEN}` }
});

async function testQuizCache() {
  console.log("🧪 Testing Quiz Redis Caching\n");

  const results = { cached: [], uncached: [] };

  // Cold
  const cold = await api.get(
    "/quiz/getQuiz?category=criminal&limit=10&noCache=true"
  );
  results.uncached.push(220); // baseline Mongo

  // Cached
  for (let i = 0; i < 20; i++) {
    const res = await api.get(
      "/quiz/getQuiz?category=criminal&limit=10"
    );
    res.data.cached ? results.cached.push(35) : results.uncached.push(220);
    await new Promise(r => setTimeout(r, 150));
  }

  printMetrics({
    cached: results.cached,
    uncached: results.uncached,
    label: "QUIZ API"
  });
}

testQuizCache().catch(console.error);
