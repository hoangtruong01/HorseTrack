# UI Generation Rules — HorseTrack

## Source of truth

Always follow:

- `docs/topic.md`
- `docs/planning_fe.md`
- `docs/design.md`

## Business model

The system is race-centric:

Tournament → many independent Races → each Race has its own participants, jockey assignment, referee, result, and ranking.

Tournament is only a container.

## Must not generate

Do not generate:

- RaceRound
- RoundManager
- StageManager
- Stage progression
- Qualification flow
- Bracket
- Playoff
- Grand Final
- Season points
- Complex leaderboard aggregation
- Gambling/betting flow (spectators can predict, but no real money betting, though deposit simulations and wallet points ledgers are included)
- Traditional credit card payment flow

**Allowed / Required Scope:**
- Reward points ledger & wallet transactions (1 point = 100 VND)
- Owner & Jockey Cashout request submission (mock points validation)
- Admin Cashout approval queue
- Pre-race checklist (Jockey roll-call, horse health, equipment)
- Referee violations panel (Minor, Major, Critical time penalties + Disqualified)
- Race automatic simulation button
- Google Login integration

## UI style

Use premium motorsport racing style:

- dark background
- red accent `#E10600`
- white text on dark surfaces
- bold headings
- strong race status labels
- clean dashboard layout
- sharp cards
- high contrast
- responsive design

Do not copy Formula 1:

- no F1 logo
- no official F1 assets
- no proprietary font
- no exact page clone

## Tech rules

Use:

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- lucide-react
- mock data first

Do not:

- use react-router-dom
- use pages router
- use localStorage JWT
- implement backend logic unless requested
- call real API unless requested

## Component rules

Create reusable components:

- AppHeader
- AppSidebar
- PageHeader
- StatusBadge
- RaceCard
- RaceStatusTimeline
- RaceRankingTable
- PredictionPanel
- WalletBalance
- TransactionHistory
- CashoutRequestForm
- CashoutApprovalQueue
- AuditLogsViewer
- RaceChecklist
- ViolationQuickAdd

Keep:

- components generic in `components/`
- business components in `features/`
- mock data near feature or page
- clean TypeScript types

## UX rules

Every list page should have:

- loading state
- empty state
- clear CTA
- status badge
- search/filter if useful

Every important action should have:

- confirmation dialog
- success/error feedback
- disabled/loading state

## Priority

Generate P0 screens first:

1. Base layout
2. Landing page
3. Login/Register
4. Admin Tournament/Race
5. Owner Horse/Race Registration
6. Jockey Assignment
7. Referee Result Entry
8. Public Race Detail
9. Spectator Prediction
