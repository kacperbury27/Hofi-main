/**
 * Performance Monitoring Utilities
 * Use with Chrome DevTools Performance tab or Web Vitals
 */

/**
 * Measure execution time of an async function
 * @param {string} label - Measurement label
 * @param {Function} fn - Async function to measure
 * @returns {Promise<*>} - Result of function
 */
export const measureAsync = async (label, fn) => {
  if (process.env.NODE_ENV === 'production') {
    return fn();
  }

  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`⏱  ${label}: ${duration.toFixed(2)}ms`);

  // Mark in performance timeline
  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);

  return result;
};

/**
 * Measure execution time of a sync function
 * @param {string} label - Measurement label
 * @param {Function} fn - Function to measure
 * @returns {*} - Result of function
 */
export const measure = (label, fn) => {
  if (process.env.NODE_ENV === 'production') {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`⏱  ${label}: ${duration.toFixed(2)}ms`);

  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);

  return result;
};

/**
 * Report Core Web Vitals
 * Measures LCP, FID, CLS for performance monitoring
 */
export const reportWebVitals = () => {
  // Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('📊 LCP:', entry.renderTime || entry.loadTime, 'ms');
    }
  });
  observer.observe({ entryTypes: ['largest-contentful-paint'] });

  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('📊 CLS:', clsValue.toFixed(3));
      }
    }
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
};

/**
 * Get memory usage (Chrome only)
 */
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
  }
  return null;
};

/**
 * Log memory usage
 */
export const logMemory = (label = 'Memory') => {
  const mem = getMemoryUsage();
  if (mem) {
    console.log(`💾 ${label}:`, mem);
  }
};

/**
 * Monitor render performance
 * @param {string} componentName - Component being measured
 * @param {Function} renderFn - Render function to time
 */
export const monitorRender = (componentName, renderFn) => {
  return measure(`Render: ${componentName}`, renderFn);
};

/**
 * Create a performance observer for custom metrics
 */
export const createCustomMetric = (metricName, startMark, endMark) => {
  try {
    performance.measure(metricName, startMark, endMark);
    const measure = performance.getEntriesByName(metricName)[0];
    if (measure) {
      console.log(`📈 ${metricName}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    }
  } catch (e) {
    console.error(`Failed to measure ${metricName}:`, e);
  }
  return null;
};

/**
 * Batch multiple measurements and report summary
 */
export const reportPerformanceSummary = () => {
  const measures = performance.getEntriesByType('measure');
  const marks = performance.getEntriesByType('mark');

  console.group('📊 Performance Summary');
  console.log(`Total Measures: ${measures.length}`);
  console.log(`Total Marks: ${marks.length}`);

  if (measures.length > 0) {
    const totalDuration = measures.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = totalDuration / measures.length;
    console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);

    const slowest = [...measures].sort((a, b) => b.duration - a.duration)[0];
    console.log(`Slowest Operation: ${slowest.name} (${slowest.duration.toFixed(2)}ms)`);
  }

  console.log('Memory:', getMemoryUsage());
  console.groupEnd();
};

/**
 * Debug helper: Log when a hook re-renders
 */
export const useRenderDebug = (componentName, dependencies = []) => {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current++;
    console.log(`🔄 ${componentName} render #${renderCount.current}`, dependencies);
  }, dependencies);
};

export default {
  measure,
  measureAsync,
  reportWebVitals,
  getMemoryUsage,
  logMemory,
  monitorRender,
  createCustomMetric,
  reportPerformanceSummary,
};
