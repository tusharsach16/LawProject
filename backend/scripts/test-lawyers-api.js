const axios = require('axios');

const API_URL = 'https://lawproject-uis1.onrender.com/api/getLawyers';

async function testLawyersAPI() {
  console.log('🧪 Testing Lawyers API Performance with Redis\n');

  const results = {
    uncached: [],
    cached: [],
  };

  // ✅ Test 1: FORCED COLD START
  console.log('📍 Test 1: Forced cold start (MongoDB)');

  const cold = await axios.get(API_URL + '?noCache=true');

  console.log(`Response time: ${cold.data.responseTime}ms`);
  console.log(`Cached: ${cold.data.cached}`);
  console.log(`Source: ${cold.data.source}\n`);

  results.uncached.push(cold.data.responseTime);

  // ✅ Test 2: Redis warm requests
  console.log('📍 Test 2: 30 cached requests');

  for (let i = 0; i < 30; i++) {
    const res = await axios.get(API_URL);

    if (res.data.cached) {
      results.cached.push(res.data.responseTime);
    } else {
      results.uncached.push(res.data.responseTime);
      console.log(`⚠️ Cache miss at request ${i + 1}`);
    }

    if (i === 0 || i === 29) {
      console.log(
        `Request ${i + 1}: ${res.data.responseTime}ms (cached: ${res.data.cached})`
      );
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  // ✅ Metrics
  const avgCached =
    results.cached.reduce((a, b) => a + b, 0) / results.cached.length;

  const avgUncached =
    results.uncached.reduce((a, b) => a + b, 0) / results.uncached.length;

  const hitRate =
    (results.cached.length /
      (results.cached.length + results.uncached.length)) *
    100;

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL PERFORMANCE METRICS');
  console.log('='.repeat(60));

  console.log(`Total requests: ${results.cached.length + results.uncached.length}`);
  console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`);

  console.log(`Average WITHOUT Redis: ${avgUncached.toFixed(0)}ms`);
  console.log(`Average WITH Redis: ${avgCached.toFixed(0)}ms`);

  console.log(
    `🚀 Speedup: ${(avgUncached / avgCached).toFixed(1)}x faster`
  );
  console.log(
    `⚡ Latency reduced by: ${(avgUncached - avgCached).toFixed(0)}ms`
  );

  console.log('='.repeat(60));

  console.log('\n📝 RESUME BULLET:');
  console.log(
    `Implemented Redis cache-aside pattern with 60s TTL, improving API latency by ${(
      ((avgUncached - avgCached) / avgUncached) *
      100
    ).toFixed(1)}% and reducing MongoDB reads by ${hitRate.toFixed(0)}%`
  );
}

testLawyersAPI().catch(console.error);
