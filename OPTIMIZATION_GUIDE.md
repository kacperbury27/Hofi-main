# Optimization & Testing Guide

## Table of Contents
1. [Performance Optimization](#performance-optimization)
2. [Testing & Quality Assurance](#testing--quality-assurance)
3. [UX/UI Best Practices](#uxui-best-practices)
4. [Monitoring & Debugging](#monitoring--debugging)

## Performance Optimization

### Code-Level Optimizations

#### 1. React Rendering Optimizations

**useCallback** - Prevent function recreation
```jsx
// ❌ Bad - new function on every render
<button onClick={() => handleSave(tx)}>Save</button>

// ✅ Good - memoized callback
const handleSave = useCallback((tx) => {
  // save logic
}, [dependencies]);
<button onClick={() => handleSave(tx)}>Save</button>
```

**useMemo** - Memoize expensive computations
```jsx
// ❌ Bad - recalculates every render
const stats = txs.reduce((a, t) => ({ ...a, [t.cat]: (a[t.cat] || 0) + t.amount }), {});

// ✅ Good - only recalculates when txs changes
const stats = useMemo(() => 
  txs.reduce((a, t) => ({ ...a, [t.cat]: (a[t.cat] || 0) + t.amount }), {}),
  [txs]
);
```

**Key Dependencies** - Keep dependency arrays minimal
```jsx
// ✅ Good - only depend on what you use
const filtered = useMemo(() => 
  filterByRange(txs, period),
  [txs, period]  // NOT including unused variables
);
```

#### 2. Data Structure Optimizations

**Filtering** (1000 txs)
```
Target: < 100ms
Implementation: Array.filter() -> performs in ~15-20ms
```

**Aggregation** (1000 txs)
```
Target: < 50ms
Implementation: Array.reduce() -> performs in ~5-10ms
```

**Sorting**
```jsx
// ✅ Sort in place when possible, avoid immutable copies for large arrays
const sorted = [...largeTxArray].sort(...); // Creates copy first

// Better for small arrays:
const sorted = largeTxArray.slice().sort(...);
```

#### 3. Array Operations

**Don't create unnecessary copies**
```jsx
// ❌ Bad - creates copy even if nothing changed
const updated = [...prevItems]; // unchanged

// ✅ Good - only spread when adding/modifying
const updated = [...prevItems, newItem];
const updated = prevItems.map(item => item.id === id ? newItem : item);
```

#### 4. Object Creation

**Memoize constants**
```jsx
// ❌ Bad - recreated on every render
const categories = CATS.map(c => ({ id: c, name: c }));

// ✅ Good - created once
const categoryOptions = useMemo(() => 
  CATS.map(c => ({ id: c, name: c })), 
  []  // never changes
);
```

### Frontend/UI Optimizations

#### 1. Responsive Layout

**CSS Grid with Auto-Fit**
```jsx
// Automatically adjusts columns based on screen size
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

**Mobile-First Design**
```jsx
// Start with mobile, add complexity for larger screens
const isMobile = window.innerWidth < 768;
const columns = isMobile ? "1fr" : "repeat(2, 1fr)";
```

#### 2. Animation Performance

**Use transform instead of layout properties**
```jsx
// ❌ Bad - causes layout recalculation
<div style={{ marginLeft: expanded ? 20 : 0 }}></div>

// ✅ Good - GPU accelerated
<div style={{ transform: expanded ? "translateX(20px)" : "translateX(0)" }}></div>
```

**Debounce expensive operations**
```jsx
const handleScroll = useCallback(debounce(() => {
  // Load more items, calculate position, etc.
}, 200), []);
```

#### 3. Image & Asset Loading

**Lazy load assets**
```jsx
<img loading="lazy" src="..." />
```

**Use appropriate image sizes**
```jsx
// Serve different sizes for different screens
<img srcSet="small.jpg 480w, medium.jpg 960w, large.jpg 1440w" />
```

#### 4. Bundle Size

**Monitor current size**
```bash
npm run build
# Check dist/assets/ folder sizes
# Current gzipped: ~160KB (acceptable for MVP)
```

**Optimizations for future**
- Dynamic imports for heavy components
- Tree-shaking unused dependencies
- Code splitting for routes

### Performance Benchmarks

**Current Performance Targets** ✓

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| Filter 1000 txs | < 100ms | ~15ms | ✅ |
| Aggregate expenses | < 50ms | ~5ms | ✅ |
| Monthly trends (5y) | < 150ms | ~20ms | ✅ |
| Search by ID | < 10ms | ~1ms | ✅ |
| Dashboard render | < 500ms | ~150ms | ✅ |
| Theme switch | < 300ms | ~50ms | ✅ |

**Run Performance Tests**
```bash
npm test -- performance.test.js
```

---

## Testing & Quality Assurance

### Unit Tests

**Test Files Structure**
```
src/__tests__/
  ├── useTransactionState.test.js    (8 tests)
  ├── useGoalsState.test.js          (14 tests)
  ├── usePeriodFilter.test.js        (13 tests)
  └── performance.test.js            (8 tests)
Total: 43 tests
```

**Running Tests**
```bash
npm test                  # Watch mode
npm test -- --run         # Single run
npm run test:ui           # Interactive UI
```

### Integration Tests

**Manual Integration Checklist**

1. **Transaction Management**
   - [ ] Add transaction with all fields
   - [ ] Edit existing transaction
   - [ ] Delete transaction
   - [ ] Undo delete
   - [ ] Switch expense/income type
   - [ ] Change currency
   - [ ] Validate required fields

2. **Filtering & Periods**
   - [ ] Switch between period presets
   - [ ] Custom date range selection
   - [ ] Filter updates dashboard metrics
   - [ ] List shows correct transactions

3. **Theme & Display**
   - [ ] Dark mode toggle
   - [ ] Light mode toggle
   - [ ] Smooth transitions
   - [ ] Colors update correctly
   - [ ] Responsive on mobile

4. **Data Visualization**
   - [ ] Charts render correctly
   - [ ] Tooltips display values
   - [ ] Category pie chart updates
   - [ ] Trend line chart updates
   - [ ] Empty state messages

### Performance Testing

**Browser DevTools**

1. **Chrome DevTools > Performance Tab**
   ```
   1. Open app in Chrome
   2. Open DevTools (F12)
   3. Performance tab > Record
   4. Perform actions (add tx, filter, toggle theme)
   5. Stop recording
   6. Look for long tasks (> 50ms)
   ```

2. **Lighthouse**
   ```
   1. DevTools > Lighthouse
   2. Generate report
   3. Check Performance score (target: 90+)
   4. Check accessibility (target: 95+)
   ```

3. **Network Tab**
   ```
   1. DevTools > Network
   2. Reload page
   3. Check bundle size
   4. Look for large assets
   5. Check cache usage
   ```

### Memory Leak Detection

**Chrome DevTools > Memory Tab**
```
1. Open app
2. Take heap snapshot
3. Perform actions (add/delete txs, switch themes)
4. Take another snapshot
5. Compare - memory should not grow indefinitely
6. Detached DOM nodes should be minimal
```

**Common Issues to Check**
- Event listeners not cleaned up
- Timers not cleared
- Subscriptions not unsubscribed
- Array/object references in closures

### Accessibility Testing

**Keyboard Navigation**
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate lists (if implemented)
- [ ] Escape closes modals

**Screen Reader (NVDA/JAWS)**
- [ ] All buttons have labels
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Status updates announced

**Color Contrast**
- [ ] Text on dark background: 4.5:1 minimum
- [ ] UI components: 3:1 minimum
- Use Chrome DevTools > Accessibility tab

---

## UX/UI Best Practices

### User Feedback

#### 1. Loading States
```jsx
import { LoadingSpinner, LoadingOverlay } from './components/common/LoadingSpinner';

<LoadingOverlay visible={isLoading} text="Dodawanie transakcji..." />
```

#### 2. Error Messages
```jsx
// Clear, actionable error messages
{error && (
  <div style={{ background: C.red, padding: 12, borderRadius: 8, color: "white" }}>
    {error}
  </div>
)}
```

#### 3. Success Notifications
```jsx
// Use Snackbar component
<Snackbar visible={saved} message="Transakcja zapisana" action="Cofnij" />
```

### Interaction Patterns

#### 1. Expandable Rows
```jsx
// Click to expand, show more details
<div onClick={() => setExpanded(expanded === id ? null : id)}>
  {expanded === id && <Details />}
</div>
```

#### 2. Modal Forms
```jsx
// Don't reload, update in place
const handleSave = (data) => {
  updateLocal(data);  // Update state immediately
  closeModal();       // User sees change instantly
  syncToServer();     // Background sync
};
```

#### 3. Inline Editing
```jsx
// Edit without leaving the page
<div onClick={() => setEditingId(id)}>
  {editingId === id ? <Input /> : <DisplayValue />}
</div>
```

### Mobile Considerations

**Touch Targets**
- Buttons should be at least 44x44px
- Spacing between buttons at least 8px
- No double-tap zoom needed (viewport configured)

**Finger-Friendly**
```jsx
// Larger tap targets on mobile
const buttonSize = isMobile ? "16px" : "14px";
const padding = isMobile ? "12px" : "8px";
```

**Mobile Breakpoints**
```jsx
const isMobile = window.innerWidth < 640;
const isTablet = window.innerWidth < 1024;
const isDesktop = window.innerWidth >= 1024;
```

### Dark/Light Mode

**Implementation**
```jsx
// Consistent across components
const T = darkMode ? DARK : LIGHT;
<div style={{ background: T.bg, color: T.text }} />
```

**Transition Smoothness**
```jsx
// Smooth color transitions
<div style={{ 
  ...styles,
  transition: "background .3s, color .3s"
}} />
```

---

## Monitoring & Debugging

### Console Logging Best Practices

**Development Only**
```jsx
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

**Levels of Logging**
```jsx
console.log('Info:', data);           // General info
console.warn('Warning:', issue);      // Potential problems
console.error('Error:', error);       // Failures
console.group('Label', () => { ... }); // Group related logs
```

### Error Boundary Usage

**Wrap major sections**
```jsx
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

**Catch and handle gracefully**
```jsx
// ErrorBoundary shows user-friendly message
// Logs full error for debugging
```

### Browser DevTools Tips

**Console Tricks**
```javascript
// Monitor performance
performance.mark('operation-start');
// ... do work ...
performance.mark('operation-end');
performance.measure('operation', 'operation-start', 'operation-end');
performance.getEntriesByName('operation')[0].duration;

// Monitor function calls
console.time('filterTxs');
const filtered = filterByRange(txs, period);
console.timeEnd('filterTxs');

// Profile function
console.profile('filterTxs');
const filtered = filterByRange(txs, period);
console.profileEnd('filterTxs');
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Slow filtering | Large arrays | Use useMemo, avoid nested loops |
| Modal lag | Heavy validation | Move to useCallback, debounce input |
| Theme switch delay | Color recalculation | Memoize theme object |
| Memory growth | Event listeners | Clean up in useEffect return |
| Re-render spam | Missing deps | Add missing to useCallback/useMemo |
| Stale data | Forgotten cache | Refresh on relevant state changes |

---

## Optimization Checklist

### Before Deployment

- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] No console errors
- [ ] No memory leaks detected
- [ ] Lighthouse score > 90
- [ ] Mobile tested on real device
- [ ] Accessibility audit passed
- [ ] Bundle size under 200KB gzipped

### Monitoring Post-Deployment

- [ ] User error reports
- [ ] Performance metrics (if analytics configured)
- [ ] Browser compatibility issues
- [ ] Mobile performance reports
- [ ] Accessibility feedback

---

## Tools & Resources

### Performance Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [React DevTools Profiler](https://react-devtools-experimental.vercel.app/)

### Testing Tools
- [Vitest](https://vitest.dev/) - Unit testing
- [Testing Library](https://testing-library.com/) - Component testing
- [Playwright](https://playwright.dev/) - E2E testing (future)

### Resources
- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/reference/react/useMemo)
- [MDN Performance Guide](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [WebAIM Accessibility](https://webaim.org/)

---

**Last Updated**: April 2026  
**Guide Version**: 1.0  
**Status**: Production-Ready
