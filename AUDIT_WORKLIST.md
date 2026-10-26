# Agri Noria - Technical Audit Worklist & Remediation Tracker

> **Source Audit Document**: Agri Noria Final Technical Audit Report  
> **Document Reference**: `AN AUD 20261023 FINAL`  
> **Audit Date**: 22–23 October 2026  
> **Total Identified Issues**: 84 (3 Critical, 37 High, 36 Medium, 8 Low)  
> **Initial Audit Verdict**: NO GO (Software Maturity 20/100, Launch Risk: Critical)  
> **Target Goal**: Remediate all 84 defects to achieve Production Launch Readiness.

---

## Executive Summary & Progress

| Severity | Total Findings | Remediated | Pending | Current Focus |
|:---|:---:|:---:|:---:|:---|
| **Critical** | 3 | **3** | **0** | **100% Resolved (A001, A002, A077)** |
| **High** | 37 | **37** | **0** | **100% Resolved (All 37 High Findings)** |
| **Medium** | 36 | 2 | 34 | Financial idempotency & precision (A080, A081) |
| **Low** | 8 | 0 | 8 | Presentation & label polishing |
| **TOTAL** | **84** | **7** | **77** | Systematic release sprints |

---

## Phase 1: Critical Authorisation & Containment Defects (SOLVED)

### 🔴 A001 — Public registration grants approved SuperAdmin access
- **Severity**: Critical (Risk R1: 5×5 = 25)
- **Status**: [x] **RESOLVED**
- **Affected Route**: `POST /api/auth/vendor/register`
- **Observed Behavior**: An unauthenticated registration request specified `role: "super admin"` or `role: "Finance"`. The server created the account with approved and verified status, enabling the user to immediately access administrative dashboard data and credit wallets.
- **Root Cause**: Registration controller accepted `role` from the client without whitelisting or rejecting privileged governance roles, and defaulted `approval_status = "approved"` and `is_verified = true` for unhandled roles.
- **Remediation Implemented**:
  1. Enforced strict RBAC role blacklist on public registration: requests attempting to register as `super_admin`, `super admin`, `admin`, `finance`, `financial`, `treasury`, `institution`, `program_director`, `regional_manager`, `cluster_supervisor`, `government`, `bank`, `dfi`, or `commodity board` are rejected with `HTTP 403 Forbidden`.
  2. Public self-registrations default to `approval_status = "pending_approval"` and `is_verified = false`.
  3. Sensitive password hashes are stripped from registration responses.

### 🔴 A002 — Account suspension does not consistently contain privileged or financial activity
- **Severity**: Critical (Risk R1: 5×5 = 25)
- **Status**: [x] **RESOLVED**
- **Affected Routes**: `GET /api/admin/dashboard/stats`, `PATCH /api/admin/users/toggle-suspension`, `POST /api/admin/institution/treasury/credit-wallet`, `PATCH /api/programs/:id/status`, `GET /api/programs/mine`
- **Observed Behavior**: When an administrator suspended an account, `GET /api/auth/verify-vendor` returned HTTP 403, but existing JWT tokens could still access administrative dashboard statistics, reactivate their own account, credit wallets, and mutate programme states.
- **Root Cause**: Middleware (`requireSuperAdmin`, `requireFinanceOrAdmin`) and controller handlers only checked JWT signature and role claims in token payload, but never checked the database `is_suspended` flag.
- **Remediation Implemented**:
  1. Updated `verifyVendorToken(req)` in session management to dynamically fetch fresh `is_suspended`, `approval_status`, and `role` from PostgreSQL on token verification.
  2. Enforced real-time suspension rejection (`HTTP 403 Forbidden`) across `requireSuperAdmin`, `requireFinanceOrAdmin`, `programsController`, `treasuryController`, and all operational mutation routes. Suspended accounts are immediately locked out from all administrative, financial, and lifecycle actions even with an existing unexpired token.

### 🔴 A077 — An unapproved farmer can credit its own wallet from the treasury
- **Severity**: Critical (Risk R3: 5×5 = 25)
- **Status**: [x] **RESOLVED**
- **Affected Route**: `POST /api/admin/institution/treasury/credit-wallet`
- **Observed Behavior**: A newly registered farmer (unapproved, unverified, onboarding level 0) sent a request to the treasury credit route with its own `vendor_id` and credited its wallet with funds drawn from the ecosystem treasury.
- **Root Cause**: The treasury endpoint lacked role-based authorization checks, allowing any authenticated caller (even an unapproved farmer) to trigger treasury transfers. It also lacked caller/recipient suspension checks, unapproved recipient guards, and idempotency deduplication.
- **Remediation Implemented**:
  1. Restricted `creditUserWallet` strictly to authorized roles (`super admin`, `admin`, `finance`). All other roles are rejected with `HTTP 403 Forbidden`.
  2. Blocked suspended callers (`HTTP 403`).
  3. Verified recipient status: recipient must exist, must not be suspended, and must have `approval_status = 'approved'` (resolving A010).
  4. Enforced monetary bounds: minimum credit 1.00 NGN and maximum 2 decimal places, rejecting sub-minor units like 0.001 NGN (resolving A081).
  5. Implemented `Idempotency-Key` header tracking and deduplication (resolving A080).
  6. Added corresponding debit entry to `finance_wallet_transactions` so treasury ledger reconciles accurately (resolving A011).

---

## Phase 2: High Severity Defects (37 Findings)

| ID | Title | Component / Route | Status | Risk / Consequence |
|:---|:---|:---|:---:|:---|
| **A003** | Administrative approval response discloses password hash field | `PATCH /api/admin/users/approval` | [x] | Password bcrypt hash exposed in admin client response |
| **A004** | Anonymous request exposes a populated buyer order and payment record | `GET /api/pipeline/buyer-orders/all` | [x] | Order, delivery and payment metadata readable without session |
| **A005** | Identity onboarding accepts missing and impossible information | `POST /api/vendor/onboarding/level1` | [x] | Empty level 1 accepted; future DOB and negative experience stored |
| **A006** | Verified identity status can be obtained without independent approval | `POST /api/vendor/onboarding/level2` | [x] | Verified badge shown without identity images or admin approval |
| **A007** | Successful farm onboarding silently loses documented coordinates | `POST /api/vendor/onboarding/level2` | [x] | Submitted GPS coordinates returned null in profile readback |
| **A008** | Harvest creation reports success but drops ownership and harvest info | `POST /api/pipeline/harvest` | [x] | Created harvest lacks farmer_id, cluster_id, yield and dates |
| **A009** | Inspection is saved as verified without officer visit or evidence | `POST /api/field-operations/inspections` | [x] | Inspection marked PASS with officer_id null and zero photos/GPS |
| **A010** | Verified recipient treasury workflow credits an unapproved farmer | `POST /api/admin/institution/treasury/credit-wallet` | [x] | Unapproved farmer credited; resolved alongside A077 |
| **A011** | Treasury balance changes without matching displayed ledger entry | `POST /api/admin/institution/treasury/credit-wallet` | [x] | Treasury balance debited without debit transaction; resolved |
| **A012** | Research trial plot API fails and interface presents empty directory | `GET/POST /api/admin/institution/trial-plots` | [x] | Returns 500; UI masks server crash as "No Plots Initialized" |
| **A013** | Published commercial operations unavailable at documented routes | Documented marketplace routes | [x] | Express 404 on 8 published routes (cart, checkout, storage) |
| **A014** | Public catalogue APIs return null rather than usable catalogues | `GET /api/marketplace/products` | [x] | Catalog routes return JSON null instead of empty array/catalog |
| **A015** | Cooperative farm management is an unfinished placeholder | Frontend `/cooperative/farms` | [x] | Page shows placeholder without farm operations workflow |
| **A016** | Cooperative Financing Inputs link returns to overview | Frontend navigation | [x] | Navigation link bounces user back to institutional overview |
| **A017** | NGO extension services screen crashes | Frontend NGO workspace | [x] | "Uh-oh! An error occurred" crash on Extension Services menu |
| **A018** | Traceability ledger does not identify origins, destinations or dates | Frontend Traceability ledger | [x] | Blank origin/destination, N/A dates, repeated identical batches |
| **A019** | Aggregator profile creation discards fields; update fails with 500 | `POST /api/aggregator/profile` | [x] | Capacity null; second request fails with duplicate key 500 |
| **A020** | Documented buyer registration request crashes with undefined quantity | `POST /api/aggregator/buyer-registration` | [x] | Schema mismatch causes server 500 on required_quantity_mt |
| **A021** | Inventory API counts one kilogram as one metric tonne | `GET /api/pipeline/sales/inventory/aggregated` | [x] | 1 Kg intake increases MT stock total by 1 MT instead of 0.001 MT |
| **A022** | Sales order assignment and processing changes do not persist | Frontend & API Sales Order | [x] | Assigned distributor and Processing status reset upon reload |
| **A023** | Manual order displayed as Paid & Escrow Secured while unpaid | `POST /api/pipeline/buyer-orders` | [x] | Client overrides order status to paid without payment record |
| **A024** | Unused sales account displays unsupported lifetime earnings | Frontend `/pipeline/wallet` | [x] | Fresh sales account shows NGN 1,250,000 Total Earned with empty ledger |
| **A025** | Monitoring actions provide no usable operational result | Frontend Monitoring | [x] | Deep Scan, Issue Field Audit, Schedule Audit buttons produce no action |
| **A026** | Advertised marketplace workflow links lead to 404 page | Drone & Farm Dev navigation | [x] | Drone Orders, View Quote Requests, and Add Listing return 404 |
| **A027** | Training creation crashes when a valid PNG is uploaded | Frontend Training create | [x] | `TypeError: i.map is not a function` crash on valid image upload |
| **A028** | Documented group and cluster creation fail with 500 for ops roles | `POST /api/admin/institution/groups` | [x] | 500 Internal Server Error when creating clusters via API contract |
| **A029** | Bookable storage availability published without a facility | `POST /api/vendor/commodity-operations/storage/calendar` | [x] | Storage window published with facility_id null |
| **A030** | Published buyer order history endpoint fails for authenticated roles | `GET /api/buyer/orders` | [x] | Returns HTTP 500 for Exporter and Processor accounts |
| **A031** | Logistics vehicle submission does not produce retrievable fleet entry | Fleet management frontend/API | [x] | Submitted vehicle does not appear in vehicle fleet list |
| **A059** | Programme director appointment fails through normal workflow | `POST /api/programs/:id/program-director` | [x] | "Failed to assign program director" / 500 error on assignment |
| **A060** | Programme creator refused permission to edit its own programme | `PUT /api/programs/:id` | [x] | "You can only modify programs you created" for actual creator |
| **A061** | Programme creation silently drops entered start and end dates | `POST /api/programs/create` | [x] | start_date and end_date persisted as null |
| **A062** | Programme activation bypasses stated configuration prerequisites | `PATCH /api/programs/:id/status` | [x] | Incomplete program without director or dates can be activated |
| **A065** | Agronomist supervision changes cannot be saved | `POST /api/agronomist/supervision` | [x] | "Failed to update supervision"; notes and progress lost |
| **A066** | Published boundary capture rejects the officer who registered farmer | `POST /api/field-operations/capture-farm-boundary` | [x] | HTTP 403 on boundary capture by the registering officer |
| **A078** | Unrelated account can mark another buyer order paid & escrow held | `POST /api/pipeline/buyer-orders/escrow-pay` | [x] | Order ownership check enforced: only buyer or admin can escrow |
| **A079** | Documented input package creation fails for programme owner | `POST /api/programs/:id/packages` | [x] | HTTP 500 when creating input package with valid schema |

---

## Phase 3: Medium Severity Defects (36 Findings)

| ID | Title | Component / Area | Status | Notes |
|:---|:---|:---|:---:|:---|
| **A032** | Published request schemas contradict runtime accepted fields | API Contracts | [x] | Title vs name, recipientUserId vs vendor_id |
| **A033** | Malformed identifier produces raw PostgreSQL error and 500 | Validation | [x] | Discloses database syntax error on invalid UUID |
| **A034** | Farmer directory has no published pagination contract | Directory API | [x] | Ignores `page` and `limit` query parameters |
| **A035** | Institutional notification and security controls do not change settings view | Settings UI | [ ] | Clicking tabs leaves Account Info form active |
| **A036** | Logistics active vehicle count contradicts fleet inventory | Logistics UI | [ ] | Settings says 15 vehicles while fleet displays 0 |
| **A037** | Insurance settings promises profile/integration controls that are absent | Insurance UI | [ ] | Text claims features not present on screen |
| **A038** | Underwriting requests show an unpopulated risk type field | Insurance UI | [ ] | Risk Type field rendered empty |
| **A039** | Program management activity tracking is not implemented | Programs UI | [ ] | Displays "ACTIVITY TRACKING COMING SOON" placeholder |
| **A040** | Scheduled field visit lacks assigned officer and usable location | Field Ops UI | [ ] | Renders "Farm, Unknown" and "Unassigned" |
| **A041** | Wallet debit transactions are displayed with positive signs | Wallet UI | [ ] | Outflow debits shown with "+" sign instead of "-" |
| **A042** | Audit log attribution displays only loopback IP addresses (`::1`) | Audit Logger | [ ] | Client real IP not parsed from `x-forwarded-for` |
| **A043** | Distributor analytics reports 100% success with zero assignments | Distributor UI | [ ] | Empty performance history displayed as 100% |
| **A044** | Authenticated inspector settings fails to load profile identity | Settings UI | [ ] | Name, email, phone fields blank on load |
| **A045** | Farmer screens disagree on primary commodity | Farmer UI | [ ] | Overview shows null while My Farm shows Maize |
| **A046** | Field audit ledger search does not filter its records | Field Audit UI | [ ] | Search input does not apply filter on enter/change |
| **A047** | Monitoring presents precise predictions without traceable observations | Monitoring UI | [ ] | 68 risk index and 12% yield without data points |
| **A048** | Storage listing persists availability greater than total capacity | Storage API/UI | [ ] | 2 sq ft available saved when total capacity is 1 sq ft |
| **A049** | Farm service listing persists inverted budget range | Farm Dev API/UI | [ ] | Min budget R2, Max budget R1 saved without validation |
| **A050** | Profile compliance status cannot be inspected through advertised link | Profile UI | [ ] | Clicking "View Compliance Details" exposes nothing |
| **A051** | Monitoring settings headings do not expose advertised config areas | Monitoring UI | [ ] | Tabs do not change configuration views |
| **A052** | Published API success responses almost entirely lack schemas | API Specs | [ ] | 110 of 111 operations lack response schema in OpenAPI |
| **A053** | Drone creation requires 21 fields that schema does not define | Drone API | [ ] | Missing property types in OpenAPI spec |
| **A054** | Interactive API documentation leaves execution target ambiguous | Swagger UI | [ ] | Preselected server mismatch |
| **A063** | Field officer programme labels contradict saved programme state | Field Ops UI | [ ] | Configuring program labeled as Active |
| **A064** | Cooperative member total does not reconcile with member directory | Cooperative UI | [ ] | Overview shows 0 members when directory has 2 |
| **A067** | Conflicting identity details are silently linked on phone collision | Registration | [ ] | Existing phone overwrites surname/hectares without warning |
| **A068** | Temporary credentials allow entry without forced replacement | Auth Flow | [ ] | First login does not prompt password change |
| **A069** | Core cooperative forms lack accessible field names | Accessibility | [ ] | 22 inputs missing `aria-label` / `aria-labelledby` |
| **A070** | Creation forms do not maintain accessible modal focus context | Accessibility | [ ] | Missing `aria-modal` and Escape key handler |
| **A071** | Mobile navigation hides focused controls and excludes toggle | Accessibility | [ ] | Div menu toggle has `tabIndex="-1"`, closed drawer focusable |
| **A072** | Programme actions clipped at 1280x720 laptop viewport | UI Responsive | [ ] | Overflow width 1347px cuts off Launch/Edit buttons |
| **A075** | Leaving maximum salary blank publishes inverted salary range | Farm Dev UI | [ ] | Blank max salary saved as `$3000.00 - $0.00` |
| **A076** | Job salary changes currency between list and detail views | Farm Dev UI | [ ] | List shows `$3000` while detail shows `R 3 000` |
| **A080** | Repeating the same treasury request creates two credits | Treasury API | [x] | Idempotency deduplication implemented |
| **A081** | Sub-minor unit credit (0.001 NGN) reports success but zero value | Treasury API | [x] | Decimal precision & min amount >= 1.00 validated |
| **A082** | Registration rejects a hyphenated surname | Auth Form | [ ] | Regex rejects valid hyphenated names like `Test-Smith` |

---

## Phase 4: Low Severity Findings (8 Findings)

| ID | Title | Component / Area | Status | Notes |
|:---|:---|:---|:---:|:---|
| **A055** | Administrative analytics splits equivalent roles by casing | Admin Analytics | [ ] | "Finance" vs "finance" counted separately |
| **A056** | Drone quote screen describes the wrong service | Drone UI Copy | [ ] | Mentions customer storage instead of drone services |
| **A057** | Buyer order screens misclassify ecosystem orders as marketplace | Orders UI | [ ] | Ecosystem cards placed under Marketplace header |
| **A058** | Job creation silently defaults to Afghanistan / Badakhshan | Jobs UI Form | [ ] | Needs empty default prompt or company country |
| **A073** | Authenticated page titles do not identify current workspace | Frontend Head | [ ] | All tabs titled generic `Home \| Agri-Noria` |
| **A074** | Dashboard navigation exposes nested link and button semantics | Accessibility | [ ] | `<button>` nested directly inside `<a>` tag |
| **A083** | Registration does not explain required 11-digit phone format | Auth UI Form | [ ] | Format error shown only after failed submission |
| **A084** | Bank escrow screen exposes internal workflow step numbering | Escrow UI Copy | [ ] | Title contains "Step 17 and 18" developer notes |

---

## Technical Audit Verification Checklist

- [x] Backend syntax verification: `node --check src/server.js`
- [ ] Frontend build verification: `npm run build` or `npx tsc --noEmit`
- [x] A001 Verification: Public register rejects administrative roles with HTTP 403
- [x] A002 Verification: Suspended accounts rejected on privileged / administrative endpoints with HTTP 403
- [x] A077 Verification: Treasury credit rejects non-finance/admin callers with HTTP 403
- [x] A078 Verification: Escrow payment checks order buyer ownership
