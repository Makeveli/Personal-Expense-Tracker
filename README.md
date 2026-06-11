# Personal Expense Tracker MVP

A full-stack personal finance application built for a developer assessment, demonstrating rapid AI-assisted development and clean architecture.

## Features
- **Authentication & Security:** Custom session management with a 15-minute sliding window expiration and frontend inactivity warning modal. Registration includes email validation.
- **Transaction Management:** Add income/expenses, view categorized transaction lists, and delete entries.
- **Budget Planning:** Set monthly spending limits per category (excluding non-budgetable items like "Salary").
- **Interactive Dashboard:** 
  - Real-time "Income vs Expense" summary and Net Balance.
  - **Budget vs Actual Comparison:** Visual bar charts showing spending progress against limits. Bars dynamically turn red if expenses exceed the budget.
  - **Data Visualization:** Pie charts for category-wise expense breakdown.
- **Responsive Design:** Mobile-first UI using Tailwind CSS v4.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Recharts, Lucide-React.
- **Backend:** Spring Boot 3.x (Java 17), Spring Data JPA, Spring Security, SLF4J for robust logging.
- **Database:** PostgreSQL (Dockerized) for production-grade relational integrity.
- **Architecture:** Standard Controller-Service-Repository pattern with DTOs and Global Exception Handling.

## Documentation
Comprehensive documentation required for the assessment can be found in the `docs/` folder:
- **[Architecture Overview](docs/architecture/architecture.md):** Detailed breakdown of the frontend, backend, and data flow.
- **[Justification Document](docs/justification.md):** Rationale for feature prioritization, tech stack choices, and AI workflow.
- **[Setup Instructions](docs/setup/setup_instructions.md):** Step-by-step guide to running the application.

## Local Setup (Max 3 Commands)

1. **Start the Database:**
   ```bash
   docker-compose up -d
   ```
2. **Start the Backend:**
   ```bash
   cd backend && ./mvnw clean spring-boot:run
   ```
3. **Start the Frontend:**
   ```bash
   cd frontend && npm install && npm run dev
   ```

## Next Steps with More Time
1. **Recurring Transactions:** Automate monthly bills/salary entries.
2. **Export Functionality:** Support CSV/PDF exports for financial records.
3. **Savings Goals:** Visual progress trackers for specific long-term savings targets.
