# HouseFinance Architecture

## Overview

HouseFinance is a modern React 18 budget management application designed for personal finance tracking. The application has been refactored from a monolithic single-file structure into a modular, maintainable architecture following React best practices.

**Tech Stack:**
- React 18 with Hooks
- Vite (build tool)
- Recharts (data visualization)
- Vitest (testing framework)
- Inline CSS styling with theme system

## Project Structure

```
src/
├── main.jsx                          # Entry point
├── AppNew.jsx                        # Root component (clean, 100 lines)
├── constants/
│   ├── theme.js                      # DARK & LIGHT color themes
│   └── categories.js                 # Categories, months, currencies, icons
├── utils/
│   ├── formatters.js                 # Date and number formatting utilities
│   ├── currency.js                   # Exchange rates and currency conversion
│   └── period.js                     # Date range filtering and logic
├── hooks/
│   ├── useTransactionState.js        # Transaction CRUD + undo
│   ├── useGoalsState.js              # Goals management + calculations
│   └── usePeriodFilter.js            # Period-based transaction filtering
├── components/
│   ├── common/                       # Reusable UI components
│   │   ├── Avatar.jsx                # User avatar with initials
│   │   ├── Card.jsx                  # Card, Label, Chip components
│   │   ├── CatSVG.jsx                # Category SVG icons
│   │   ├── Snackbar.jsx              # Notification with undo
│   │   ├── SlideScreen.jsx           # Animated slide-in panel
│   │   └── SkeletonRow.jsx           # Loading placeholder
│   ├── dashboard/
│   │   └── Dashboard.jsx             # Main dashboard view
│   ├── transactions/
│   │   └── TxModal.jsx               # Transaction add/edit modal
│   ├── period/
│   │   ├── DateRangePicker.jsx       # Date range selector popup
│   │   └── PeriodSelector.jsx        # Period button trigger
│   ├── mobile/
│   │   └── MobileApp.jsx             # Mobile-responsive view
│   └── settings/
│       └── SettingsComponents.jsx    # Settings UI components
├── data/
│   ├── seedTransactions.js           # Sample transaction data
│   └── seedGoals.js                  # Sample goals data
└── __tests__/
    ├── useTransactionState.test.js   # Hook tests
    ├── useGoalsState.test.js
    └── usePeriodFilter.test.js
```

## Architecture Decisions

### 1. Component Composition Over Inheritance
- Uses functional components with hooks
- Leverages composition for reusability
- Props-based communication for flexibility

### 2. Custom Hooks for State Management
Instead of Redux or Context API, the app uses custom hooks that encapsulate business logic:
- **useTransactionState**: Manages transaction CRUD operations and undo functionality
- **useGoalsState**: Handles goals and complex calculations
- **usePeriodFilter**: Encapsulates date range filtering logic

This approach provides:
- Simple, testable logic
- Easy to understand and modify
- Minimal dependencies
- Great for mid-sized applications

### 3. Centralized Theme System
All styling uses a theme object approach:
```javascript
const C = DARK; // or LIGHT
// Usage: <div style={{ color: C.text, background: C.bg }}>
```

Benefits:
- Dark/light mode toggling without extra dependencies
- Consistent color palette across the app
- Easy to implement new themes
- No CSS file maintenance needed

### 4. Inline Styling Pattern
All components use inline `style` objects rather than CSS files:
```jsx
<div style={{ 
  padding: "12px 24px", 
  borderRadius: 10, 
  background: C.s1,
  border: `1px solid ${C.border}`
}}>
```

Trade-offs:
- ✅ Self-contained components (no external CSS to maintain)
- ✅ Dynamic styling based on props/state
- ✅ Theme-aware styles automatically
- ❌ Slightly verbose
- ❌ No CSS optimization (but acceptable for app size)

### 5. Separation of Concerns
- **Constants** (`constants/`): Static data, enums, colors
- **Utils** (`utils/`): Pure functions for calculations, formatting
- **Hooks** (`hooks/`): State management and side effects
- **Components** (`components/`): UI and user interaction
- **Data** (`data/`): Seed/mock data for development

This structure makes it easy to:
- Test individual pieces
- Reuse logic across components
- Understand where to add new features
- Scale the application

## Key Components

### AppNew.jsx (Root Component)
**Purpose**: Application entry point and primary layout
**Responsibilities**:
- Manages main view state (dashboard vs mobile)
- Initializes custom hooks
- Loads Google Fonts
- Provides theme styling
- Routes between views

**Key Props**: None (self-contained)

### Dashboard.jsx (Main View)
**Purpose**: Desktop dashboard view
**Features**:
- 4 metric cards (balance, income, expenses, savings rate)
- Monthly trend chart
- Category breakdown pie chart
- Responsive grid layout

**Dependencies**: Recharts for charting

### TxModal.jsx (Transaction Form)
**Purpose**: Modal form for adding/editing transactions
**Features**:
- Transaction type toggle (expense/income)
- Category selection with icons
- Currency support
- Person assignment (Kacper/Anna)
- Amount validation
- Date picker

**Validates**: Description and amount are required

### MobileApp.jsx (Mobile View)
**Purpose**: Mobile-optimized interface
**Features**:
- Authentication gate (demo users)
- Three-tab navigation (home/analytics/goals)
- Balance card with breakdown
- Recent transactions list
- Floating action button (FAB)
- Bottom sheet form
- Settings panel with theme toggle
- iPhone frame styling (375x820px)

### DateRangePicker.jsx
**Purpose**: Date range selection
**Features**:
- Preset periods (this month, last 3 months, etc.)
- Custom date range input
- Validation for date order
- Popup or inline mode

## Custom Hooks

### useTransactionState()
**Returns**:
```javascript
{
  txs: [],                          // All transactions
  editingTx: null,                  // Currently editing transaction
  deletedTx: { tx, timer },         // Recently deleted (for undo)
  addTransaction(tx),               // Add or update transaction
  editTransaction(tx),              // Set editing transaction
  deleteTransaction(id),            // Delete transaction
  undoDelete()                       // Restore deleted transaction
}
```

**Features**:
- Soft delete (keeps deleted item for undo)
- Upsert pattern (add or update by ID)
- Simple array-based storage

### useGoalsState()
**Returns**:
```javascript
{
  goals: [],                        // All goals
  getGoalSaved(goal),              // Calculate total saved
  getGoalPct(goal),                // Percentage to target (capped at 100)
  getMonthsLeft(deadline),         // Months until deadline
  getMonthlyNeeded(goal),          // Monthly savings needed
  getEstimatedDone(goal),          // Estimated completion date
  saveGoal(goal),                  // Create or update goal
  deleteGoal(id)                   // Delete goal
}
```

**Calculations**:
- Saved amount: Sum all deposits converted to PLN
- Percentage: (saved / target) × 100, capped at 100%
- Months left: Date difference from today
- Monthly needed: Remaining amount ÷ months left
- Estimated done: Based on average monthly deposit rate

### usePeriodFilter(txs, defaultPeriod)
**Returns**:
```javascript
{
  period: "this_month",            // Current period key or custom range
  setPeriod(period),               // Change period
  filtered: [],                    // Filtered transactions (memoized)
  label: "Ten miesiąc"             // Human-readable period label
}
```

**Supported Periods**:
- `"this_month"` - Current calendar month
- `"last_month"` - Previous calendar month
- `"last_3"` - Last 3 calendar months
- `"this_year"` - Current calendar year
- `"last_year"` - Previous calendar year
- `{ from: "2026-03-01", to: "2026-03-31" }` - Custom range

**Performance**: Uses `useMemo` to avoid unnecessary re-filtering

## Data Models

### Transaction
```javascript
{
  id: 1,
  desc: "Biedronka",              // Description
  cat: "Jedzenie",                // Category
  amount: -89.5,                  // Negative = expense, Positive = income
  who: "Kacper",                  // Person
  date: "2025-03-25",             // YYYY-MM-DD format
  currency: "PLN",                // Currency code
  type: "expense"                 // "expense" or "income"
}
```

### Goal
```javascript
{
  id: "g1",
  name: "Wakacje w Japonii",      // Goal name
  type: "savings",                // "savings" or "budget"
  target: 12000,                  // Target amount in goal currency
  currency: "PLN",                // Currency
  deadline: "2026-09-01",         // Optional deadline (YYYY-MM-DD)
  createdAt: "2025-10-01",
  status: "active",               // "active" or "completed"
  color: "#4CAEFF",               // Display color
  deposits: [                     // Contributions
    {
      id: "d1",
      amount: 500,
      currency: "PLN",
      date: "2025-10-25",
      note: "Pierwsza wpłata",
      who: "Kacper"
    }
  ]
}
```

## Theme System

### DARK Theme
```javascript
{
  bg: "#06060f",                  // Dark background
  s1: "#0f0f1f",                  // Surface 1 (slightly lighter)
  s2: "#16162b",                  // Surface 2 (even lighter)
  s3: "#1d1d38",                  // Surface 3
  border: "#2a2a48",              // Border color
  text: "#ffffff",                // Primary text
  textSub: "#9ca3af",             // Secondary text
  muted: "#6b7280",               // Muted text
  accent: "#00d9a3",              // Accent/brand color (green)
  green: "#22c55e",               // Income/positive
  red: "#ff6b6b",                 // Expense/negative
  warning: "#f97316"              // Warning color
}
```

### LIGHT Theme
Similar structure with light colors. Switch between themes with `DARK` or `LIGHT` constants.

## Styling Approach

### Theme-aware Inline Styles
```jsx
<button style={{
  padding: "8px 16px",
  borderRadius: 7,
  border: `1px solid ${C.border}`,
  background: isActive ? C.accent : C.s2,
  color: isActive ? "#06060f" : C.text,
  cursor: "pointer"
}}>
```

### Utility Functions
- `makeTT(color)`: Tooltip styling helper
- All styles are composable and readable in-place

## Testing

### Testing Framework: Vitest
**Setup**:
- Uses jsdom for DOM simulation
- React Testing Library for hook testing with `renderHook`
- Mock support for data files and utils

### Test Files
1. **useTransactionState.test.js**: 8 tests covering CRUD and undo
2. **useGoalsState.test.js**: 13 tests covering calculations and mutations
3. **usePeriodFilter.test.js**: 13 tests covering filtering and periods

### Running Tests
```bash
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with interactive UI
```

### Test Strategies
- Mock external dependencies (seed data, utilities)
- Test hook behavior in isolation
- Use `act()` wrapper for state updates
- Test edge cases (empty data, null values, past dates)

## Currency Handling

### Exchange Rates (src/utils/currency.js)
```javascript
const EXCHANGE_RATES = {
  PLN: 1.0,
  EUR: 4.5,
  USD: 4.2,
  // Add more as needed
};

getPLNAmount({ amount, currency }) // Converts any currency to PLN
```

### Usage
All financial calculations (goals, analytics) convert to PLN for consistency.

## Performance Optimizations

1. **useMemo in usePeriodFilter**: Prevents unnecessary re-filtering
2. **Seed data caching**: Initial data loaded once per session
3. **Soft deletes**: Avoid expensive array operations for undo
4. **Inline styling**: No CSS bundle, minimal parse overhead

## Future Enhancements

### Short Term (Already Planned)
- [ ] Complete mobile app analytics and goals tabs
- [ ] GitHub Actions CI/CD pipeline
- [ ] Backend integration with Supabase

### Medium Term
- [ ] User authentication and cloud sync
- [ ] Recurring transaction templates
- [ ] Budget alerts and notifications
- [ ] Data export (CSV, PDF)

### Long Term
- [ ] Multi-user households
- [ ] Bill splitting features
- [ ] Investment tracking
- [ ] Tax optimization tools
- [ ] API for third-party integrations

## Development Workflow

### Adding a New Feature
1. Create component in appropriate folder
2. Add any needed hooks to `hooks/`
3. Add constants to `constants/` if needed
4. Add utility functions to `utils/`
5. Import and use in AppNew.jsx or route to it
6. Add tests for hooks/utilities
7. Commit with clear message

### Adding a New Category
1. Update `CATS` array in `constants/categories.js`
2. Add color mapping in `CAT_COLORS`
3. Add icon in `CAT_ICONS`
4. SVG in `CatSVG.jsx` if needed

### Theming
1. Update colors in `constants/theme.js` (DARK/LIGHT objects)
2. Use `const C = DARK` or `const C = LIGHT` pattern in components
3. Apply colors: `color: C.text`, `background: C.bg`, etc.

## File Size Summary
- **AppNew.jsx**: ~100 lines (root component)
- **Dashboard.jsx**: ~250 lines (main view)
- **TxModal.jsx**: ~300 lines (form)
- **MobileApp.jsx**: ~400 lines (mobile view)
- **Hook files**: 30-70 lines each
- **Component files**: 50-150 lines each
- **Total refactored**: ~3,000 lines (from 3,650 monolith)

## Deployment

The application is built with Vite and can be deployed to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static hosting
- Docker container

**Build**: `npm run build`
**Preview**: `npm run preview`

## Dependencies

### Production
- react: ^18.3.1
- react-dom: ^18.3.1
- recharts: ^3.8.1

### Development
- vite: ^6.0.5
- @vitejs/plugin-react: ^4.3.4
- vitest: ^2.0.5
- @testing-library/react: ^15.0.6
- jsdom: ^24.1.0
- @vitest/ui: ^2.0.5

**Note**: Deliberately minimal dependencies to keep the bundle small and the codebase maintainable.

## Contributing Guidelines

1. Keep components focused and single-responsibility
2. Extract reusable logic into custom hooks
3. Use TypeScript gradually (currently not required)
4. Write tests for hooks and utilities
5. Maintain consistent formatting and naming
6. Follow the existing inline styling pattern
7. Update ARCHITECTURE.md if making structural changes

---

**Last Updated**: April 2026
**Refactoring Completed**: [claude/migrate-to-claude-code session]
**Refactor Goal**: Break down 3,650-line monolith into modular, testable components
