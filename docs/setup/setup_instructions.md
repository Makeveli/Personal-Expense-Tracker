# Local Setup Instructions

Follow these steps to run the Personal Expense Tracker on your local machine.

## Prerequisites
- **Java 17** or higher installed.
- **Node.js** (v18+) and npm installed.
- **Docker & Docker Compose** installed and running (for the PostgreSQL database).

## Step 1: Start the Database
The application uses PostgreSQL. Spin it up using the provided Docker Compose file in the root directory.
```bash
docker-compose up -d
```
*(This will start a Postgres instance on port 5432 with the database `expense_tracker`)*

## Step 2: Start the Backend (Spring Boot)
Open a new terminal, navigate to the `backend` directory, and run the Maven wrapper.
```bash
cd backend
./mvnw clean spring-boot:run
```
*(The backend will start on `http://localhost:8080`. Hibernate will automatically create the tables, and the `DataInitializer` will seed default categories.)*

## Step 3: Start the Frontend (React/Vite)
Open another terminal, navigate to the `frontend` directory, install dependencies, and start the dev server.
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will be accessible at `http://localhost:5173`. Open this URL in your browser to view the application.)*