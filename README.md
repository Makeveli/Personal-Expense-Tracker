# Personal Expense Tracker MVP

A full-stack personal finance application built in under 1 hour for a developer assessment.

## Features
- **Transaction Management:** Add income/expenses, view categorized transaction list, and delete entries.
- **Budget Planning:** Set monthly spending limits per category.
- **Interactive Dashboard:** 
  - Real-time "Income vs Expense" summary.
  - **Budget vs Actual Comparison:** Visual bar charts showing spending progress against limits.
  - **Data Visualization:** Pie charts for category-wise expense breakdown.
- **Responsive Design:** Mobile-first UI using Tailwind CSS.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Recharts, Lucide-React.
- **Backend:** Spring Boot (Java 17), Spring Data JPA.
- **Database:** H2 (In-memory) for zero-setup local demonstration (Pivoted from Dockerized Postgres due to environment constraints).
- **Architecture:** Standard Controller-Service-Repository pattern with DTOs for dashboard summaries.

## Feature Prioritization Rationale
- **Must Haves:** Transaction CRUD and basic dashboard were prioritized as the core value proposition.
- **Should Haves:** "Budget vs Actual" and "Data Viz" were selected to provide immediate analytical value to the user, showcasing the ability to integrate charting libraries like Recharts.
- **Skipped:** Edit functionality and real Authentication were skipped to focus on high-impact visualization features within the 1-hour limit.

## AI Tools Used
- **Gemini CLI:** Used for project scaffolding, generating boilerplate logic for entities and controllers, and rapid frontend component development.
- **Impact:** Accelerated the development of the charting logic and Tailwind styling significantly, allowing for a polished UI in minimal time.

## Local Setup (Max 3 Commands)

1. **Start Backend:**
   ```bash
   cd backend && ./mvnw spring-boot:run
   ```
2. **Start Frontend:**
   ```bash
   cd frontend && npm install && npm run dev
   ```

## Next Steps with More Time
1. **User Authentication:** Integrate Spring Security with JWT or OAuth2.
2. **Persistent Storage:** Migrate back to a production-grade database like PostgreSQL.
3. **Recurring Transactions:** Automate monthly bills/salary entries.
4. **Export Functionality:** Support CSV/PDF exports for financial records.
