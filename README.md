# PocketPilot — Your money. Your call.

> An interactive personal finance experience designed for Gen Z students and young adults managing a restricted monthly budget (primary configuration: ₹10,000 over 30 days).

---

## 1. Product Overview

PocketPilot bridges the gap between daily purchases and monthly financial reality. Rather than acting as a passive expense tracker or generic banking table, PocketPilot helps users understand the immediate and compounding consequences of their decisions.

PocketPilot answers seven core questions instantly:
1. **How much money did I start with?** (Configurable starting budget, default ₹10,000)
2. **How much have I actually spent?** (Dynamic summation across verified transactions)
3. **How much remains after accounting for obligations and savings?** (True available balance)
4. **How much can I safely spend per day?** (Dynamic, non-zero safe daily outflow indicator)
5. **Which future payments could affect my budget?** (Upcoming bills and subscription commitments)
6. **What happens if I make a purchase or change my habits?** (Interactive *Vibe Check* simulator and *Ripple Effect* projection engine)
7. **Am I on track to finish the budget period without running short?** (Factual, non-judgmental budget health status)

---

## 2. Core Features & Interactive Tools

- **Dashboard**: Unified financial command center featuring the **Safe to Spend Today** metric, visual category breakdown donut chart, remaining-days timeline, and quick-access shortcuts.
- **Transactions (CRUD)**: Filter by category, search by merchant or note, sort by date or amount, add new expenses with payment method tags (UPI, Card, Cash, NetBanking), edit entries inline, and delete with recalculation guarantees.
- **Budget & Commitments**: Configurable monthly budget cycle, upcoming bill tracking with one-tap payment toggle. Paid commitments automatically cease deducting from safe spend without duplicating transactions.
- **Savings Goals**: Goal progress tracker with optional balance locking (`reservedFromBudget`). Locked savings are protected from safe-to-spend calculations.
- **Pattern Radar**: Rule-based spending behavior detection derived strictly from actual recorded transactions (detects micro-transaction accumulation like repeated ₹99 purchases, category concentrations >30%, and rapid burn rates). Includes one-tap dismissal and restoration.
- **Vibe Check Simulator**: Test a potential purchase (e.g. ₹800 party or gadget) against the current budget. Live recalculation of available balance, safe daily limit reduction, and shortfall warning before deciding whether to cancel or officially apply it.
- **Ripple Effect**: Interactive multi-lever scenario simulator. Adjust daily delta (-₹200 to +₹400/day), dining out budget cuts (0-50%), splurges, and weekly recurring savings to project month-end cushion without altering real data.

---

## 3. Financial Calculation Engine & Rules

All calculations are centralized in `src/utils/calculations.ts` and tested via `test-qa.mjs`:

### Formulas:
$$\text{Available Balance} = \text{Budget} - \text{Recorded Expenses} - \text{Unpaid Commitments} - \text{Reserved Savings}$$

$$\text{Safe to Spend per Day} = \max\left(0, \left\lfloor\frac{\text{Available Balance}}{\text{Remaining Days}}\right\rfloor\right)$$

- **Zero Division Protection**: `Remaining Days` is clamped to $\ge 1$ for active periods. When days reach 0 or available balance is exhausted, safe spend returns ₹0 (no negative allowances displayed as recommendations).
- **Anti-Double-Counting**:
  - Paid commitments (`isPaid === true`) are excluded from pending obligations.
  - Only goals flagged with `reservedFromBudget === true` deduct from the monthly balance.
  - Simulations in Vibe Check and Ripple Effect are strictly read-only unless explicitly committed by the user.

---

## 4. Technical Stack

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS 3.4, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Donut Category Chart, Scenario Comparison Bar Charts)
- **Delight & Feedback**: Canvas Confetti
- **Code Quality**: Oxlint, TypeScript strict compiler
- **Persistence**: Centralized LocalStorage with structured fallbacks

---

## 5. Getting Started & Development

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$

### Installation
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```

### Run Automated QA & Financial Calculations Suite
```bash
node test-qa.mjs
```

### Run Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

---

## 6. Deployment & Repository Configuration

- **Target Repository**: `https://github.com/kendamic/pocketlink`
- **Deployment Platform**: Vercel
  - **Framework Preset**: Vite
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Single Page Application Fallback**: Configured via static routing / Vite client bundle.
