# Project Justification and Assessment Decisions

## Feature Prioritization Rationale
Based on the 2-hour time constraint and the MVP Feature Selection Matrix, I focused on high-impact, core functionalities that immediately demonstrate value:
- **Must Haves (Completed):** 
  - Transaction Management (Add, View, Delete).
  - Budget Creation (Set limits per category).
  - Basic Dashboard (Total income vs expenses, balance).
- ### 📊 Should Haves (Completed)

* **Budget vs Actual Comparison (Visual Bar Chart with Overspend Indicators)**
    * **Engineering Rationale:** Implementing a budget tracker without a deterministic feedback loop yields low user utility. This component was prioritized because it completes the data cycle between transaction entry and budget boundaries. By aggregating raw transactional data against defined budget constraints on the backend, we deliver high-impact financial telemetry with minimal architectural overhead, utilizing lightweight visual indicator logic to signal variance.
* **Data Visualization (Pie Chart for Expense Breakdown)**
    * **Engineering Rationale:** Raw tabular financial ledgers offer poor data density optimization for end-users. Transforming the structured data payload of the transaction schema into a normalized, category-wise percentage distribution provides immediate analytical value. From an execution standpoint, this was a highly efficient, low-effort progression that layered directly on top of our existing CRUD service aggregation queries.

### 🛡️ Bonus / Enterprise Enhancements (Completed)

* **Enterprise-Grade Session Timeout (15-Minute Sliding Window & Active Warning Modal)**
    * **Engineering Rationale:** During integration testing, persistent client-side authentication states exposed a critical data exposure risk. To align with industry security standards for financial data handling, a stateful, server-side verified sliding-window session management system was engineered. If a user is inactive for 15 minutes, the token is invalidated in the persistence layer. To ensure optimal user experience (UX), a proactive frontend interceptor detects idle DOM events and triggers a warning modal to let the user explicitly choose between extending the session or executing a clean logout.
* **Structured Global SLF4J Exception Handling & Distributed Traceability**
    * **Engineering Rationale:** To eliminate cascading silent failures and prevent information leakage via raw stack traces, a centralized `@ControllerAdvice` global exception handler was introduced. Integrating uniform SLF4J logging ensures that every request lifecycle—from authentication filters to domain layer execution—is trace-mapped. This baseline telemetry is non-negotiable for system observability, ensuring predictable troubleshooting and effortless root-cause analysis during horizontal scaling.
* **Relational Database Mapping for Core Enums (Categories & Transaction Types)**
    * **Engineering Rationale:** Relying on hardcoded application strings or tight code-level Enums introduces rigid deployments and potential database schema drift when scaling categories. Abstracting transaction types and spending categories into dedicated, relationally mapped database tables decouples configuration from the core execution logic. This normalizes the data model, enforces relational integrity at the database engine level, and allows for dynamic, runtime category expansions without requiring redeployments.

**Skipped Features:** Edit transactions and comprehensive account management were skipped to ensure the visualizations, core CRUD operations, and strict security/session management features were perfectly polished and bug-free within the time limit.

## Tech Stack Choices and Justification
- **Frontend:** React + Tailwind CSS. 
  - *Justification:* React provides rapid component-based UI development. Tailwind CSS allows for immediate, highly responsive styling without context-switching between CSS files, crucial for the 2-hour limit. Recharts was chosen for its out-of-the-box React compatibility.
- **Backend:** Spring Boot (Java) + Spring Data JPA. 
  - *Justification:* Spring Boot's auto-configuration and Spring Data JPA's interface-driven database queries drastically reduce boilerplate code, allowing me to focus on business logic (like the Dashboard summary aggregation).
- **Database:** PostgreSQL (Dockerized).
  - *Justification:* Transitioned from H2 to PostgreSQL to demonstrate production-readiness, data persistence across restarts, and robust relational integrity (foreign keys for categories and users).

## AI Tool Selection and Usage Strategy
- **Tool:** Gemini CLI (Auto-Edit Mode).
- **Strategy:** I leveraged the AI as a highly capable pair-programmer. 
  - **Scaffolding:** Used AI to generate the initial boilerplate for Spring entities, repositories, and the React UI.
  - **Complex Logic:** Delegated the aggregation logic in `FinanceService` (grouping transactions, calculating percentages against budgets) to the AI to save time.
  - **Debugging:** When shifting from Strings to Relational Entities caused Hibernate DDL errors, the AI rapidly analyzed the stack traces, corrected the Lombok/Maven compilation issues, and guided the database reset protocol.
  - **Refactoring:** Used AI to quickly implement the sliding-window session management system, applying changes across the frontend (Hooks, Context) and backend (Filters, Entities) simultaneously.

## Time Management and Scope Decisions
The primary focus was establishing a rock-solid data foundation first (Entities, Repositories). Once the data flowed correctly from the DB to the API, I shifted focus to the UI layer to ensure the charts accurately reflected the backend DTOs. When bugs arose (e.g., schema mismatches), I decisively opted to wipe the local DB volume rather than write complex Flyway migrations, trading off temporary local data loss for massive time savings in a prototype scenario.