# Cosibella

A Node.js backend service that integrates with the **IdoSell** e-commerce platform — synchronizing orders and their documents in the background, storing them in PostgreSQL, and exposing a REST API.

## Requirements

- Node.js & npm
- Docker with the Compose plugin

## Getting Started

1. **Copy the environment file and fill in the values:**

   ```bash
   cp .env.example .env
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up the database** (starts Postgres, runs migrations, then stops it):

   ```bash
   npm run db:setup
   ```

4. **Start the application in development mode:**

   ```bash
   npm run docker:dev
   ```

Swagger documentation: http://localhost:3000/docs

Drizzle Studio (dev mode only): https://local.drizzle.studio

## Tech Stack

- Express 5
- TypeScript (tsx)
- Drizzle ORM
- PostgreSQL
- Zod
- Pino
- Vitest
- Docker

## Running the Application

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run docker:dev`   | Start with hot-reload (development) |
| `npm run docker:start` | Start in production mode (detached) |
| `npm run docker:logs`  | Tail container logs                 |
| `npm run docker:stop`  | Stop all containers                 |

## Testing

```bash
# Run tests once
npm run test

# Watch mode
npm run test:watch
```

## Database Commands

| Command               | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `npm run db:setup`    | Generate migrations & apply them (auto-starts/stops DB) |
| `npm run db:generate` | Generate migration files from schema changes            |
| `npm run db:migrate`  | Apply pending migrations (requires running DB)          |
| `npm run db:push`     | Push schema directly to DB, skipping migrations         |
| `npm run db:clean`    | Drop the DB volume and delete the `drizzle/` folder     |
