# 🏨 AI Test Engineer — Technical Challenge

> Playwright test automation for **Restful Booker API** and **Automation in Testing UI**

This project implements **77 automated tests** (17 API + 60 UI) across **4 viewports** using Playwright and TypeScript. Tests follow **Equivalence Class Partitioning + Boundary Value Analysis (ECP/BVA)** methodology with business-impact prioritization. **14 application bugs** were discovered and documented using `test.fail()` — each test asserts the ideal behavior, so bug fixes are automatically detected. The entire development workflow was AI-assisted using **Cursor IDE + Playwright MCP** for live application discovery, test generation, and debugging.

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Structure](#-project-structure)
3. [Test Strategy](#-test-strategy)
4. [Test Coverage](#-test-coverage)
5. [Bug Discovery](#-bug-discovery)
6. [Architecture Decisions](#-architecture-decisions)
7. [Environment Setup — MCP & Cursor Rules](#-environment-setup--mcp--cursor-rules)
8. [AI-Assisted Development](#-ai-assisted-development)
9. [CI/CD & Docker](#-cicd--docker)
10. [Trade-offs & Known Limitations](#-trade-offs--known-limitations)
11. [Future Work](#-future-work)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20 ([download](https://nodejs.org/))
- **Docker Desktop** (optional, for containerized execution)

> **Environment variables**: No `.env` file is required. All defaults are built into `tests/config/env.ts`. To override, create a `.env` at the project root:
>
> | Variable | Default | Description |
> |----------|---------|-------------|
> | `API_BASE_URL` | `https://restful-booker.herokuapp.com` | API target |
> | `UI_BASE_URL` | `https://automationintesting.online` | UI target |
> | `API_AUTH_USERNAME` | `admin` | API admin credentials |
> | `API_AUTH_PASSWORD` | `password123` | API admin credentials |
> | `UI_ADMIN_USERNAME` | `admin` | UI admin credentials |
> | `UI_ADMIN_PASSWORD` | `password` | UI admin credentials |

### Local Setup

```bash
# Clone and install
git clone https://github.com/MarcosTenorioDev/Playright-Automation.git
cd technical-challenge
npm ci

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run all tests
npx playwright test

# Run by layer
npm run test:api          # API tests only
npm run test:ui           # UI desktop only
npm run test:ui:all       # UI desktop + tablet + mobile

# View report
npm run report
```

### Docker

```bash
docker compose build playwright        # Build image (first time ~10min)
docker compose run --rm playwright      # Run all tests
docker compose run --rm api-tests       # API only
docker compose run --rm ui-tests        # UI desktop only
```

---

## 📁 Project Structure

```
tests/
├── api/                          # API test layer
│   ├── auth.spec.ts              # Authentication tests (AU01-AU02)
│   ├── booking.spec.ts           # Booking CRUD + BVA tests (BK01-BK13)
│   ├── booking.lifecycle.spec.ts # Full CRUD lifecycle tests (LC01-LC02)
│   ├── helpers/
│   │   ├── api-helper.ts         # Auth, cleanup, date generation utilities
│   │   └── schema-helper.ts      # Zod schema validation helpers
│   ├── schemas/                  # Zod response schemas
│   │   ├── auth.schema.ts
│   │   └── booking.schema.ts
│   └── constants/
│       └── error-messages.ts     # Expected API error messages
│
├── ui/                           # UI test layer
│   ├── booking-flow.spec.ts      # Home page structure tests (BF01-BF08)
│   ├── check-availability.spec.ts# Availability widget tests (CA01-CA05)
│   ├── form-validation.spec.ts   # Contact form validation (CT01-CT06)
│   ├── reservation-form.spec.ts  # Room booking flow + BVA (RF01-RF09)
│   ├── admin-dashboard.spec.ts   # Admin panel management (AD01-AD16)
│   ├── admin-flow.spec.ts        # Login/logout flow (AD01-AD05)
│   ├── responsive.spec.ts        # Responsive layout tests (RS01-RS06)
│   ├── visual-regression.spec.ts # Visual regression baselines (VR01-VR05)
│   ├── pages/                    # Page Object Model
│   │   ├── BasePage.ts           # Abstract base (readyLocator pattern)
│   │   ├── HomePage.ts           # Home page interactions
│   │   ├── BookingPage.ts        # Room reservation page
│   │   └── admin/                # Admin panel Page Objects
│   │       ├── AdminLoginPage.ts
│   │       ├── AdminDashboardPage.ts
│   │       ├── AdminRoomsPage.ts
│   │       ├── AdminReportPage.ts
│   │       ├── AdminBrandingPage.ts
│   │       └── AdminMessagesPage.ts
│   └── helpers/
│       └── booking-helper.ts     # UI test cleanup utilities
│
├── fixtures/                     # Test data factories
│   ├── auth.fixture.ts           # Admin credentials factory
│   ├── booking.data.ts           # Booking + reservation BVA factories
│   ├── contact.data.ts           # Contact form BVA factories
│   └── room.data.ts              # Room data factories
│
├── types/                        # TypeScript interfaces
│   ├── booking.types.ts
│   └── room.types.ts
│
└── config/
    └── env.ts                    # Environment configuration

postman/
├── Restful_Booker_Environment.json     # Environment variables (base_url, credentials, token)
├── Restful_Booker_By_Endpoint.json     # Collection organized by API endpoint
└── Restful_Booker_By_Test.json         # Collection organized by test case ID (AU, BK, LC)
```

---

## 🎯 Test Strategy

### Prioritization: Business Impact First

Tests were prioritized by **revenue impact** — what breaks if this fails?

| Priority | Area | Rationale |
|----------|------|-----------|
| 🔴 Critical | Booking creation (API + UI) | Broken bookings = lost revenue |
| 🔴 Critical | Authentication | No auth = no admin access |
| 🟡 High | Form validation | Bad data = corrupted bookings |
| 🟡 High | Availability search | Wrong dates = wrong rooms shown |
| 🟢 Medium | Admin dashboard | Internal tool, not customer-facing |
| 🟢 Medium | Responsive layout | Mobile users can't book |
| 🔵 Low | Visual regression | CSS regressions, brand consistency |

### Testing Approach

- **Equivalence Class Partitioning + BVA**: Inputs are first grouped into equivalence classes (valid, invalid-empty, invalid-below-min, invalid-above-max), then boundary values are tested at exact min, max, below-min, and above-max within each class. This combination minimizes the number of test cases while maximizing validation coverage. Character lengths are commented in fixtures for traceability.
- **Happy Path + Negative**: Each feature has both success and failure scenarios.
- **Schema Validation**: All API responses validated with Zod schemas — catches silent contract changes.
- **`test.fail()` for Known Bugs**: Tests document the **ideal** behavior. When a bug is fixed, the test auto-detects it (expected failure becomes unexpected pass → remove annotation).

### Multi-Viewport Testing

| Project | Viewport | Scope |
|---------|----------|-------|
| `ui-desktop` | 1280×720 | All UI tests + visual regression |
| `ui-tablet` | 768×1024 | Responsive + functional tests |
| `ui-mobile` | 375×667 | Responsive + functional tests |

---

## 📊 Test Coverage

### Test Map

| Layer | Prefix | Range | Spec File | Tests | Scope |
|-------|--------|-------|-----------|-------|-------|
| **API** | `AU` | AU01–AU02 | `auth.spec.ts` | 2 | Authentication — valid/invalid credentials, token generation |
| **API** | `BK` | BK01–BK13 | `booking.spec.ts` | 13 | Booking CRUD — create, read, update, delete with ECP/BVA |
| **API** | `LC` | LC01–LC02 | `booking.lifecycle.spec.ts` | 2 | End-to-end lifecycle — create → read → update → delete |
| **UI** | `BF` | BF01–BF08 | `booking-flow.spec.ts` | 8 | Home page structure — navbar, hero, rooms, booking widget, footer |
| **UI** | `CA` | CA01–CA05 | `check-availability.spec.ts` | 5 | Availability widget — date selection, API integration, edge cases |
| **UI** | `CT` | CT01–CT06 | `form-validation.spec.ts` | 6 | Contact form validation — ECP/BVA on name, email, phone, message |
| **UI** | `RF` | RF01–RF09 | `reservation-form.spec.ts` | 9 | Room booking flow — reservation form ECP/BVA + date conflict |
| **UI** | `AD` | AD01–AD16 | `admin-dashboard.spec.ts` | 16 | Admin panel — room CRUD, branding, messages, reports, navigation |
| **UI** | `AD` | AD01–AD05 | `admin-flow.spec.ts` | 5 | Admin login/logout — credentials, session management |
| **UI** | `RS` | RS01–RS06 | `responsive.spec.ts` | 6 | Responsive layout — viewport adaptation (mobile, tablet, desktop) |
| **UI** | `VR` | VR01–VR05 | `visual-regression.spec.ts` | 5 | Visual regression — component-level screenshot baselines (desktop) |
| | | | | **77 total** | |

### Test Distribution by Viewport

| Project | Test Count |
|---------|-----------|
| API | 17 |
| UI Desktop | 49 |
| UI Tablet | 50 |
| UI Mobile | 50 |
| **Total executions** | **166** |

---

## 🐛 Bug Discovery

14 bugs were discovered and documented using `test.fail()` — tests are written with the **expected (ideal) behavior**, so when a bug is fixed the test automatically detects it.

### API Bugs

| ID | Endpoint | Expected | Actual | Severity |
|----|----------|----------|--------|----------|
| BUG-001 | `POST /booking` | 201 Created | 200 OK | Medium — Wrong status code, violates REST standards |
| BUG-002 | `POST /booking` | 400 Bad Request (empty fields) | 200 OK | High — Accepts bookings with empty names |
| BUG-003 | `POST /booking` | 400 Bad Request (negative price) | 200 OK | High — Accepts negative prices |
| BUG-004 | `POST /booking` | 400 Bad Request (invalid dates) | 200 OK | High — Accepts checkout before checkin |
| BUG-005 | `PUT /booking/:id` | 400 Bad Request (invalid data) | 200 OK | High — Updates with invalid data |
| BUG-006 | `PUT /booking/:id` | 400 Bad Request (invalid data) | 200 OK | High — No server-side validation on update |
| BUG-007 | `POST /auth` | 401 Unauthorized | 200 OK | Medium — Wrong status code for invalid credentials |
| BUG-008 | `DELETE /booking/:id` | 200/204 | 201 Created | Low — Semantically wrong status for deletion |

### UI Bugs

| ID | Component | Expected | Actual | Severity |
|----|-----------|----------|--------|----------|
| BUG-009 | Booking form validation | Error messages reference field names | Generic messages without field context | Medium |
| BUG-010 | Booking form (409 conflict) | User-friendly error message | Frontend crashes with TypeError | Critical |
| BUG-011 | Availability widget | Reject checkout before checkin | Accepts invalid date ranges | High |
| BUG-012 | Availability widget | Disable past dates | Allows searching past dates | Medium |
| BUG-013 | Date handling | Correct date conversion | UTC conversion adds +1 day (timezone bug) | High |
| BUG-014 | Admin hamburger menu | Menu expands on mobile/tablet | Menu remains collapsed, nav inaccessible | High |

---

## 🏗️ Architecture Decisions

### Page Object Model with `readyLocator` Pattern

Every Page Object extends `BasePage` and declares a `readyLocator` — a locator that signals the page is truly ready for interaction:

```typescript
// BasePage.ts
export abstract class BasePage {
  protected abstract readonly readyLocator: Locator;

  async waitForPageLoad(): Promise<void> {
    await this.readyLocator.waitFor({ state: 'visible', timeout: 15000 });
  }
}

// AdminDashboardPage.ts — Rooms tab only renders after API responds
protected readonly readyLocator = this.page.getByRole('link', { name: 'Rooms' });
```

**Why**: The target application is a React SPA. `domcontentloaded` fires before hydration. `readyLocator` ensures the app is fully rendered and interactive.

### Fixture Factories with BVA

Test data comes from factory functions, never inline objects. Each factory documents exact character lengths for BVA traceability:

```typescript
export function createMinBoundaryBookingRequest(): BookingRequest {
  return {
    firstname: 'Ana',           // 3 chars (exact minimum)
    lastname: 'Kim',            // 3 chars (exact minimum)
    totalprice: 1,              // minimum price
    // ...
  };
}
```

**Why**: Centralizes test data, makes BVA boundaries explicit, and enables overrides via `Partial<T>` spread.

### `test.fail()` for Bug Documentation

Tests are written with the **ideal behavior** and annotated with `test.fail()` when a known bug prevents them from passing:

```typescript
test('BK01 - valid: should create booking with valid data', async ({ request }) => {
  test.fail(true, 'BUG-001'); // API returns 200 instead of 201
  // Test asserts 201 (correct behavior)
  expect(response.status()).toBe(201);
});
```

**Why**: When the bug is fixed, Playwright auto-detects it ("expected failure but test passed") → remove the annotation. No permanently red tests, no forgotten bugs.

### Visual Regression (Component-Level)

Screenshots are taken of **stable UI components** (navbar, footer, forms), not full pages. Dynamic content is masked:

```typescript
await expect(homePage.bookingSection).toHaveScreenshot('booking-widget.png', {
  mask: [homePage.checkinInput, homePage.checkoutInput],
  maxDiffPixelRatio: 0.05,
});
```

**Why**: Full-page screenshots on an external app are inherently flaky. Component-level captures provide regression value without maintenance burden.

**Baselines are OS-specific**: Playwright generates separate snapshots per platform (`-win32.png`, `-linux.png`). To generate Linux baselines for CI:

```bash
docker compose build playwright
docker compose run --rm `
  -v "${PWD}/tests/ui/visual-regression.spec.ts-snapshots:/app/tests/ui/visual-regression.spec.ts-snapshots" `
  playwright npx playwright test --project=ui-desktop --grep "VR" --update-snapshots
```

Commit both `-win32.png` (local) and `-linux.png` (CI/Docker) baselines to the repository.

---

## 🔌 Environment Setup — MCP & Cursor Rules

Before writing any test, two foundational tools were configured to ensure quality and consistency throughout development.

### Playwright MCP

Playwright MCP was configured in Cursor IDE for live browser interaction during test development.

#### `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser", "chromium"],
      "env": {
        "DISPLAY": ":1"
      }
    }
  }
}
```

#### Usage in Practice

1. **Page structure analysis** — `browser_snapshot` to map DOM elements before writing Page Objects
2. **Bug reproduction** — `browser_navigate` + `browser_click` + `browser_console_messages` to confirm frontend crashes and give context to create the automated tests correctly
3. **Locator discovery** — `browser_snapshot` to inspect the accessibility tree and derive semantic locators (`getByRole`, `data-testid`) before coding Page Objects
4. **Visual verification** — `browser_take_screenshot` to confirm UI state during debugging

### Cursor Rules & Skills — Preventing AI-Slop

In addition to custom rules, the [Playwright Skill](https://github.com/sickn33/antigravity-awesome-skills) was installed to give the AI agent Playwright-specific knowledge and best practices:

```bash
npx skills add https://github.com/sickn33/antigravity-awesome-skills --skill playwright-skill
```

A key part of managing the AI agent was **constraining its behavior** through Cursor Rules (`.cursor/rules/*.mdc`) combined with this skill. These were applied globally to every AI interaction, enforcing:

- **Human Approval Gate** — the AI cannot write or modify code without explicit verbal approval. Every change must be described first, then approved before implementation. This prevented runaway refactors and unnecessary file creation.
- **Naming conventions** — test IDs (`XX## - valid/invalid/edge:`), fixture factories (`create{Scenario}{Entity}`), Page Object structure
- **Architecture enforcement** — Page Object Model, fixture factories, no inline test data, Zod schema validation
- **BVA methodology** — character length comments, boundary categories, coverage requirements
- **Bug documentation** — `test.fail()` with ideal behavior, never `test.skip()`

Three rules files were maintained throughout development (available in `rules-used/`):

| Rule File | Purpose |
|-----------|---------|
| `playwright.mdc` | POM architecture, assertions, locator strategy, SPA navigation patterns |
| `api-tests.mdc` | Request fixture, Zod schemas, cleanup strategy, AAA pattern |
| `testing-strategy.mdc` | Business-first prioritization, BVA methodology, multi-viewport coverage |

**Impact**: Without these rules, the AI would default to verbose, inconsistent code. With them, ~90% of generated code required only minor adjustments instead of rewrites.

---

## 🤖 AI-Assisted Development

### Tools Used

- **Cursor IDE** with Claude (primary — code generation, refactoring, debugging)
- **Cursor Playwright Skill** (`antigravity-awesome-skills`) — injected Playwright best practices into the AI's context
- **Playwright MCP** (browser automation via Model Context Protocol — live page analysis)

### How AI Was Used

#### 1. Application Discovery & Analysis - MCP

Before writing any test, I used Playwright MCP to navigate the live applications and understand their behavior. The AI took snapshots of each page, mapped DOM structures, and identified testable elements:

```
Prompt: "Using Playwright MCP, navigate to https://automationintesting.online and analyze the page structure.

Your analysis should include:
- The main sections available on the page.
- All forms present (including their fields and purpose).
- The default user behavior when visiting the site.
- The critical functions and interactions that should be covered by automated tests.

Provide a structured analysis with clear headings and technical observations."
```

This gives the AI enough context to work with later without making assumptions, reducing the possibility of hallucinations.

#### 2. Element Scraping & Page Setup – MCP

After understanding the application structure, I used Playwright MCP to systematically extract stable locators directly from the live DOM.

The AI interacted with the rendered page, inspected elements, and collected reliable selectors (prioritizing data-testid > getByRole > labels, and accessible names over fragile CSS/XPath). This reduced ambiguity and ensured locator stability.

```
Prompt: "Using Playwright MCP, inspect the DOM of https://automationintesting.online, extract elements locators and create the page in @ui/pages following the best pratices"
```

*With these locators, MCP helped structure the initial page setup (base URL, reusable page object structure, and test-ready selectors), ensuring the test environment was deterministic and ready for automation without assumptions.*

#### 3. Bug Discovery via MCP

Several bugs were found by having the AI interact with the app in real-time:

- **BUG-010**: Asked the AI to book the same dates twice via UI → observed the frontend crash with `TypeError` in the console (409 conflict not handled)
- **BUG-013**: Asked the AI to select a date and check what the API received → found the UTC+1 day offset
- **BUG-014**: Asked the AI to navigate admin tabs on mobile viewport → hamburger menu never expanded

#### 4. Test Generation & Refinement

Tests were generated with structured prompts following BVA methodology:

```
Prompt: "Create booking API tests following BVA. 
         Test boundaries for firstname (3-18 chars), lastname (3-30 chars), 
         phone (11-21 chars). Include exact min, max, below-min, above-max.
         Use fixtures from booking.data.ts."
```

#### 5. Debugging Failures

When tests failed, I provided the error details + page snapshot to the AI for root cause analysis:

```
Prompt: "This test failed. Error: navTexts is empty array. 
         Page snapshot shows only a status element. Why?"
```

The AI identified that `waitForPageLoad` using `domcontentloaded` was insufficient for React SPAs and proposed the `readyLocator` pattern.

### What the AI Got Wrong

| Issue | What AI Did | What I Corrected |
|-------|-------------|------------------|
| Over-engineered refactor of AdminDashboardPage | Proposed full rewrite (225→155 lines) | Asked for minimal fix — only changed `readyLocator` |
| Low-level waits leaked into tests | Put `scrollIntoViewIfNeeded()` + `waitFor()` in spec | Moved to PO method `scrollToSimilarRooms()` |
| `Promise.all` for SPA navigation | Used `Promise.all([waitForURL, click])` | Changed to sequential click → waitForURL (SPA uses pushState) |
| `.catch(() => {})` in waitForDashboardLoad | Silently swallowed timeout errors | Replaced with `waitForLoadState('networkidle')` |
| Aggressive VRT threshold | `maxDiffPixelRatio: 0.01` (1%) | Increased to `0.05` (5%) — realistic for external app |

### What I Learned

1. **AI is excellent at discovery** — using MCP to analyze live apps before writing tests saved hours of manual exploration
2. **AI defaults to over-engineering** — it tends to propose complex refactors when a surgical fix is better. The engineer's job is to scope the change
3. **AI-generated waits are often wrong** — `.catch(() => {})`, `waitForTimeout()`, and premature assertions are common AI anti-patterns that need human review
4. **Prompts with constraints produce better code** — telling the AI "use fixtures, follow BVA, comment char lengths" yields cleaner output than open-ended requests
5. **Cursor Rules are essential for AI governance** — global rules that enforce architecture and naming prevent AI-slop at the source, reducing review overhead significantly

---

## ⚙️ CI/CD & Docker

### GitHub Actions

The CI pipeline runs on every push to `main`/`develop` and on PRs:

```yaml
strategy:
  fail-fast: false
  matrix:
    project: [api, ui-desktop, ui-tablet, ui-mobile]
```

- **4 parallel jobs** (one per project) for fast feedback
- **`fail-fast: false`** — all projects run even if one fails
- **Artifacts uploaded**: HTML reports (14 days) + test results (7 days)
- **Retries**: 2 retries in CI to handle external app flakiness

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.58.2-noble
```

- **Single image** shared across `docker-compose` services (`playwright`, `api-tests`, `ui-tests`)
- **`.dockerignore`** keeps build context small (~210KB vs ~300MB without it)
- **Volumes** for `playwright-report/` and `test-results/` — reports persist on host

### Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:api` | API tests only |
| `npm run test:ui` | UI desktop only |
| `npm run test:ui:all` | All viewports (desktop + tablet + mobile) |
| `npm run test:headed` | UI tests with visible browser |
| `npm run docker:test` | Run all tests in Docker |
| `npm run docker:api` | API tests in Docker |
| `npm run docker:ui` | UI tests in Docker |

### Postman Collections

The `postman/` folder contains ready-to-import collections for manual API exploration:

| File | Purpose |
|------|---------|
| `Restful_Booker_Environment.json` | Environment with `base_url`, credentials, and auto-populated `token`/`booking_id` |
| `Restful_Booker_By_Endpoint.json` | Organized by REST resource (Auth, Health, Booking CRUD) |
| `Restful_Booker_By_Test.json` | Maps 1:1 to Playwright test IDs (AU01–AU02, BK01–BK13, LC01–LC02) |

Import all three into Postman, select the **Restful Booker** environment, and run. Test scripts document known bugs inline (e.g. `BUG-001: should be 201`).

---

## ⚖️ Trade-offs & Known Limitations

### Deliberate Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Visual regression on desktop only | No mobile/tablet baselines | Cost of maintaining 3× baselines on external app outweighs incremental coverage. Responsive behavior is covered by functional tests in `responsive.spec.ts` |
| `maxDiffPixelRatio: 0.05` for VRT | Allows 5% pixel difference | External app — 1% threshold is unrealistic due to scrollbar variance, font rendering, and dynamic content |
| `networkidle` for admin dashboard | Slower than targeted waits | The admin dashboard makes multiple API calls on load; `networkidle` reliably ensures React hydration is complete |
| Shared public test environment | Possible inter-user conflicts | No isolated environment available; tests use dynamic date generation (unique month offsets) to minimize collisions |
| `test.fail()` over `test.skip()` | Tests run and fail (expected) | Documents the ideal behavior and auto-detects fixes, vs. `skip` which is invisible and forgotten |

### Not Implemented

| Feature | Why |
|---------|-----|
| Agent-driven testing | Time constraint — prioritized functional coverage and bug discovery over an agent architecture |
| Performance testing (k6/Artillery) | Out of scope — challenge focuses on functional testing |
| Cross-browser testing | Chromium only — sufficient for the challenge; adding Firefox/WebKit would 3× execution time with minimal additional coverage |

### What I Would Improve Given More Time

- **Isolated test environment** — spin up the application locally via Docker Compose to eliminate shared-state flakiness and inter-user date conflicts
- **Granular cleanup** — replace best-effort `try/catch` cleanup with a global teardown that queries and deletes all test-created resources

---

## 🔮 Future Work

### Agent-Driven Bug Lifecycle Automation

The `test.fail()` pattern creates a natural bridge to **autonomous bug lifecycle management**. A future iteration would implement an agent loop that:

1. **Monitors Change Requests** — on each deploy, the agent reads CR tickets (Jira, Linear, etc.) tagged with `BUG-XXX` IDs
2. **Runs targeted tests** — executes only the tests annotated with the resolved `BUG-XXX`, using `--grep "BUG-003"` filtering
3. **Evaluates outcomes** — if a `test.fail()` test now passes ("expected failure but passed"), the agent confirms the fix is live
4. **Handles disposition** — based on the CR resolution:

| CR Resolution | Agent Action |
|---------------|-------------|
| **Fixed** | Remove `test.fail()`, test now asserts correct behavior permanently |
| **Won't Fix / By Design** | Update test expectations to match the new accepted behavior, remove `test.fail()` |
| **Deferred** | Keep `test.fail()`, log that the bug remains open |

5. **Creates a PR** — the agent commits the updated test files and opens a PR for human review

**Why this matters**: In production at scale (Voidr's use case), hundreds of `test.fail()` annotations across multiple clients would be unmanageable without automation. This agent closes the loop between QA discovery and engineering resolution — every bug either gets fixed or its test gets updated, and nothing is forgotten.

---

## 📝 Running Specific Tests

```bash
# By test ID
npx playwright test --grep "BK01"

# By spec file
npx playwright test tests/ui/booking-flow.spec.ts

# By project + grep
npx playwright test --project=ui-mobile --grep "RS"

# Only failed tests (after a run)
npx playwright test --last-failed

# Visual regression
npx playwright test --project=ui-desktop --grep "VR"

# Update VRT baselines
npx playwright test --project=ui-desktop --grep "VR" --update-snapshots

# Debug mode (step-by-step)
npx playwright test --debug --grep "BF01"
```

