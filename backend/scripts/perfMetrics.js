module.exports = function printMetrics({ cached, uncached, label }) {
  const avgCached = cached.reduce((a, b) => a + b, 0) / cached.length;
  const avgUncached = uncached.reduce((a, b) => a + b, 0) / uncached.length;

  const hitRate =
    (cached.length / (cached.length + uncached.length)) * 100;

  console.log('\n' + '='.repeat(60));
  console.log(`📊 FINAL PERFORMANCE METRICS (${label})`);
  console.log('='.repeat(60));
  console.log(`Total requests: ${cached.length + uncached.length}`);
  console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`);
  console.log(`Average WITHOUT Redis: ${avgUncached.toFixed(0)}ms`);
  console.log(`Average WITH Redis: ${avgCached.toFixed(0)}ms`);
  console.log(`🚀 Speedup: ${(avgUncached / avgCached).toFixed(1)}x`);
  console.log(`⚡ Latency reduced by: ${(avgUncached - avgCached).toFixed(0)}ms`);
  console.log('='.repeat(60));
};
