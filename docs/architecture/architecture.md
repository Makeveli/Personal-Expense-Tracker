# Architecture Overview

## High-Level Architecture
The Personal Expense Tracker follows a standard modern web application architecture: a decoupled Single Page Application (SPA) frontend communicating with a RESTful API backend, backed by a relational database.

### 1. Frontend (React + Vite)
- **Framework:** React.js bootstrapped with Vite for fast HMR and optimized builds.
- **Styling:** Tailwind CSS v4 for utility-first, highly responsive, and mobile-friendly design.
- **State Management:** React Context API (`AuthContext`) manages global user state and JWT tokens. Component-level state (`useState`, `useEffect`) manages forms and localized data.
- **Routing/Views:** Currently a simplified SPA where conditional rendering handles the Auth vs Dashboard views to meet the MVP time constraints.
- **Data Visualization:** Recharts is used for rendering dynamic Pie Charts (Expenses by Category) and Bar Charts (Budget vs Actual).
- **Communication:** Axios is used for HTTP requests to the backend, intercepting calls to attach the JWT Bearer token.

### 2. Backend (Spring Boot)
- **Framework:** Spring Boot 3.x (Java 17).
- **Architecture Pattern:** Controller -> Service -> Repository.
  - **Controllers:** Expose RESTful endpoints (`/api/auth`, `/api/transactions`, `/api/budgets`).
  - **Services:** Contain business logic (e.g., `FinanceService` aggregating dashboard metrics).
  - **Repositories:** Spring Data JPA interfaces for database abstraction.
- **Security:** Spring Security is integrated with a custom `SessionValidationFilter` that enforces a 15-minute sliding window session timeout mechanism.
- **Logging:** SLF4J is utilized extensively across controllers, services, and the global exception handler for enterprise-grade traceability.

### 3. Database (PostgreSQL)
- **Engine:** PostgreSQL (run via Docker Compose).
- **Schema Mapping:** Hibernate (JPA) maps Java entities to database tables (`users`, `user_sessions`, `transactions`, `budgets`, `categories`, `transaction_types`).
- **Initialization:** `DataInitializer` pre-seeds default categories and transaction types upon application startup to ensure immediate usability.

## Data Flow (Dashboard Summary)
1. User loads the dashboard. React triggers `fetchData()`.
2. Axios makes an authenticated GET request to `/api/dashboard/summary`.
3. The `SessionValidationFilter` intercepts, validates the token in the `user_sessions` table, and extends the 15-minute timeout.
4. `FinanceController` routes the request to `FinanceService`.
5. `FinanceService` queries `TransactionRepository` and `BudgetRepository` for the current month.
6. The service aggregates the data into a `DashboardSummary` DTO (calculating totals and mapping expenditures to budgets).
7. The JSON response is sent back to React, which updates state and triggers a re-render of the Recharts components.