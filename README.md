# MaserBorn App

Recruitment application for MaserBorn

## Requirements

- npm
- docker
- docker-compose-plugin

## First run

Remember to copy the `.env.example` file to `.env` and set the environment variables before running the application.

```bash
# Copy environment configuration
cp .env.example .env

# Set up the database
npm run db:setup

# Start the application (development mode)
npm run docker:dev

```

## Running the Application

Development mode:

```bash
# Start and watch the application
npm run docker:dev
```

Production mode:

```bash

# Start the application
npm run docker:start

# Show logs
npm run docker:logs

# Stop the application
npm run docker:stop

```

## Drizzle commands

```bash
# Generate and apply migrations in one step
# Automatically starts and stops the database container
npm run db:setup


# Generate migration files from schema changes
npm run db:generate

# Apply generated migrations
# Requires `docker:start` to be running
npm run db:migrate

# Apply schema changes directly to the database
# Use with caution, requires `docker:start` to be running
npm run db:push
```

In the development mode Drizzle Studio is available at https://local.drizzle.studio
