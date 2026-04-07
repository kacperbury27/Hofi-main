# Web Dashboard Testing Checklist

## Functional Testing

### Transaction Management
- [ ] **Add Transaction**
  - [ ] Modal opens when clicking "+ Dodaj"
  - [ ] All form fields populate correctly
  - [ ] Validation: shows error if description empty
  - [ ] Validation: shows error if amount <= 0
  - [ ] Can switch between Expense/Income
  - [ ] Currency dropdown works
  - [ ] Date picker shows calendar
  - [ ] Can select Kacper or Anna
  - [ ] Can select category
  - [ ] Click "Dodaj" saves and closes modal
  - [ ] New transaction appears in list

- [ ] **Edit Transaction**
  - [ ] Click pencil button opens edit modal
  - [ ] Form pre-fills with transaction data
  - [ ] Button text changes to "Zapisz"
  - [ ] Changes are saved correctly
  - [ ] Edited transaction updates in list
  - [ ] Amount/type changes reflect in metrics

- [ ] **Delete Transaction**
  - [ ] Click ✕ button removes from list
  - [ ] Metrics update immediately
  - [ ] Undo functionality works (in future)

### Period Filtering
- [ ] **Period Selector**
  - [ ] Button shows filter icon
  - [ ] Click opens date range picker
  - [ ] "This month" preset selected
  - [ ] Can click other presets
  - [ ] Custom tab allows date selection
  - [ ] "Od" date input works
  - [ ] "Do" date input works
  - [ ] Validation: "Od" > "Do" shows error
  - [ ] "Zastosuj" applies custom range

- [ ] **Filter Updates**
  - [ ] Metrics update when period changes
  - [ ] List shows only transactions in period
  - [ ] Charts update to show period data
  - [ ] Period label updates in header
  - [ ] Switching presets works smoothly

### Dashboard Metrics
- [ ] **Balance Card**
  - [ ] Shows correct balance (income - expense)
  - [ ] Color changes based on positive/negative
  - [ ] Updates when transactions change

- [ ] **Income Card**
  - [ ] Shows total income with "+" prefix
  - [ ] Converts currencies to PLN
  - [ ] Updates correctly

- [ ] **Expense Card**
  - [ ] Shows total expense with "−" prefix
  - [ ] Shows absolute value
  - [ ] Updates correctly

- [ ] **Savings Rate Card**
  - [ ] Shows percentage (balance/income * 100)
  - [ ] Shows 0% when no income
  - [ ] Updates when period changes

### Charts
- [ ] **Monthly Trends**
  - [ ] Line chart renders
  - [ ] Shows income (green) and expense (red) lines
  - [ ] X-axis shows months
  - [ ] Y-axis shows formatted amounts
  - [ ] Hover tooltip shows values
  - [ ] Responsive width

- [ ] **Category Pie Chart**
  - [ ] Renders when expenses exist
  - [ ] Shows "Brak wydatków" when none
  - [ ] Each segment has correct color
  - [ ] Legend shows categories with amounts
  - [ ] Hover tooltip shows amounts
  - [ ] Responsive size

### List Display
- [ ] **Transaction List**
  - [ ] Scrollable if many transactions
  - [ ] Each shows: avatar, description, category, date, amount
  - [ ] Sorted newest first
  - [ ] Edit/delete buttons visible
  - [ ] Clickable for expansion (if implemented)
  - [ ] "Brak transakcji" when empty

---

## UI/UX Testing

### Visual Design
- [ ] **Color Consistency**
  - [ ] All text is readable
  - [ ] Accent color is consistent
  - [ ] Background/surface colors appropriate
  - [ ] Hover states visible
  - [ ] Active states clear

- [ ] **Typography**
  - [ ] Font sizes appropriate for hierarchy
  - [ ] All text is readable
  - [ ] Line spacing comfortable
  - [ ] Polish characters display correctly (ł, ą, ę, etc.)

- [ ] **Spacing & Layout**
  - [ ] No overlapping elements
  - [ ] Consistent padding/margins
  - [ ] Elements aligned properly
  - [ ] Grid gaps appropriate

- [ ] **Responsive Design**
  - [ ] Mobile (375px): Single column layout
  - [ ] Tablet (768px): 2-column layout
  - [ ] Desktop (1024px+): Multi-column layout
  - [ ] No horizontal scrolling
  - [ ] Text readable at all sizes
  - [ ] Touch targets large enough (44x44px)

### Interactivity
- [ ] **Buttons**
  - [ ] All buttons clickable
  - [ ] Hover state visible
  - [ ] Active state clear
  - [ ] Disabled state (if any) obvious
  - [ ] Text is readable

- [ ] **Forms**
  - [ ] Inputs accept text
  - [ ] Selects dropdown properly
  - [ ] Date pickers show calendar
  - [ ] Error messages appear
  - [ ] Error text is readable
  - [ ] Can tab between fields

- [ ] **Modals**
  - [ ] Overlay blocks background
  - [ ] Modal centered
  - [ ] Can close with ✕ button
  - [ ] Can close by clicking outside
  - [ ] Pressing Escape closes (if implemented)

### Theme Toggle
- [ ] **Dark Mode**
  - [ ] Default on load
  - [ ] All text readable
  - [ ] Colors appropriate
  - [ ] Charts render correctly
  - [ ] Hover states work

- [ ] **Light Mode**
  - [ ] Toggle to light works
  - [ ] All text readable
  - [ ] Good contrast
  - [ ] Charts readable
  - [ ] Can toggle back to dark

- [ ] **Transition**
  - [ ] Switch is smooth (no flashing)
  - [ ] No layout shift
  - [ ] All elements update color

---

## Performance Testing

### Loading Speed
- [ ] **Initial Load**
  - [ ] Page loads in < 2 seconds
  - [ ] Metrics visible immediately
  - [ ] Charts render smoothly
  - [ ] No layout shift (CLS < 0.1)

- [ ] **Interactions**
  - [ ] Adding transaction takes < 200ms
  - [ ] Filtering updates < 150ms
  - [ ] Theme toggle < 300ms
  - [ ] Modal opens instantly

### Resource Usage
- [ ] **Chrome DevTools > Performance**
  - [ ] No tasks longer than 50ms
  - [ ] Main thread utilization < 80%
  - [ ] No red warnings

- [ ] **Chrome DevTools > Memory**
  - [ ] Memory doesn't grow over time
  - [ ] No detached DOM nodes
  - [ ] Heap size < 50MB

- [ ] **Bundle Size**
  - [ ] Total gzipped < 200KB
  - [ ] JS gzipped < 160KB
  - [ ] CSS reasonable

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (Chrome, Safari)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all buttons
- [ ] Tab order logical
- [ ] Can submit forms with Enter
- [ ] Can open/close modals
- [ ] Escape closes modals

### Screen Reader (if available)
- [ ] Buttons have labels
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Charts have alt text (if added)

### Color Contrast
- [ ] Light text on dark background: 4.5:1+
- [ ] Dark text on light background: 4.5:1+
- [ ] UI elements: 3:1+ contrast

---

## Error Scenarios

- [ ] **Network Failure** (future: when API added)
  - [ ] Error message displays
  - [ ] Retry option available
  - [ ] App doesn't crash

- [ ] **Invalid Data**
  - [ ] Bad date shows error
  - [ ] Negative amount shows error
  - [ ] Form doesn't submit

- [ ] **JavaScript Error**
  - [ ] Error Boundary catches error
  - [ ] Shows user-friendly message
  - [ ] App can be recovered

---

## Cross-Browser Testing

### Desktop
- [ ] **Chrome**
  - [ ] Layout correct
  - [ ] Animations smooth
  - [ ] DevTools accessible

- [ ] **Firefox**
  - [ ] Colors render correctly
  - [ ] Form elements work
  - [ ] Charts render

- [ ] **Safari**
  - [ ] All features work
  - [ ] Styling consistent
  - [ ] Animations smooth

### Mobile
- [ ] **iOS Safari**
  - [ ] Touch interactions work
  - [ ] Keyboard doesn't overlap
  - [ ] Safe area respected
  - [ ] Pinch-zoom works

- [ ] **Android Chrome**
  - [ ] Touch interactions work
  - [ ] Keyboard doesn't overlap
  - [ ] Notch handling ok
  - [ ] Back button works

---

## Sign-Off

| Item | Tester | Date | Status |
|------|--------|------|--------|
| Functional Testing | | | |
| UI/UX Testing | | | |
| Performance | | | |
| Accessibility | | | |
| Cross-browser | | | |

**Overall Status**: Ready / Not Ready

**Issues Found**: 
- 
- 

**Notes**:

---

**Created**: April 2026
**Purpose**: Comprehensive testing of web dashboard
**Frequency**: Run before each major release
