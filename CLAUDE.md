# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS backend application called "valnut-backend" built with TypeScript. It follows the standard NestJS architecture with modules, controllers, and services.

## Development Commands

**Package Manager**: This project uses `pnpm` as its package manager.

**Development workflow**:
```bash
# Install dependencies
pnpm install

# Start development server with watch mode
pnpm run start:dev

# Build the application
pnpm run build

# Start production server
pnpm run start:prod

# Lint and format code
pnpm run lint
pnpm run format
```

**Testing**:
```bash
# Run unit tests
pnpm run test

# Run unit tests in watch mode
pnpm run test:watch

# Run e2e tests
pnpm run test:e2e

# Run tests with coverage
pnpm run test:cov

# Debug tests
pnpm run test:debug
```

## Architecture

**Core Structure**:
- **Entry Point**: `src/main.ts` - Bootstraps the NestJS application on port 3000 (or PORT env var)
- **App Module**: `src/app.module.ts` - Root module that imports all other modules
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data processing
- **Module Pattern**: NestJS uses decorators (@Module, @Controller, @Injectable) for dependency injection

**Key Configuration**:
- **TypeScript**: ES2023 target with strict null checks enabled
- **Testing**: Jest for unit tests, separate e2e configuration
- **ESLint**: TypeScript ESLint with Prettier integration, some rules relaxed (@typescript-eslint/no-explicit-any is off)
- **Build**: NestJS CLI handles compilation, outputs to `dist/` directory

The application currently has basic "Hello World" functionality through AppController and AppService.