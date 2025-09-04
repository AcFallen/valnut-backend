# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multitenant SaaS NestJS backend** called "valnut-backend" for managing nutritionist consultancies. It uses TypeORM with PostgreSQL and implements a sophisticated tenant-based architecture with role-based access control (RBAC).

## Development Commands

**Package Manager**: This project uses `pnpm` as its package manager.

**Essential Commands**:
```bash
# Start development server with watch mode
pnpm run start:dev

# Run database seeds (creates admin user, demo tenant, and memberships)
pnpm run seed

# Lint and format code
pnpm run lint
pnpm run format

# Build for production
pnpm run build

# Run tests
pnpm run test
pnpm run test:e2e
pnpm run test:cov
```

**Single Test Execution**:
```bash
# Run specific test file
pnpm test -- users.service.spec.ts

# Run test in watch mode
pnpm test:watch -- --testNamePattern="should create user"

# Debug tests
pnpm run test:debug
```

## Core Architecture

**Multitenant Design**:
- **Single Database**: All tenants share one PostgreSQL database
- **Tenant Context**: TenantMiddleware extracts tenant from JWT and sets global context
- **Auto-filtering**: All queries automatically filter by `tenant_id`
- **RBAC**: Granular permissions system with tenant-scoped roles

**Security Flow** (Critical for understanding):
1. **TenantMiddleware** (runs on ALL routes `*`): Extracts JWT → Sets tenant context
2. **JwtAuthGuard**: Validates JWT token authenticity
3. **PermissionsGuard**: Checks user permissions against required permissions
4. **TenantGuard**: Ensures tenant context exists when required

**User Types & Access**:
- **SYSTEM_ADMIN**: Global access, no tenant filtering (tenantId: null)
- **TENANT_OWNER**: Admin of specific tenant
- **TENANT_USER**: Regular user within tenant (e.g., nutritionist, receptionist)

**Module Structure**:
- `core/`: Tenant context, middleware, guards, decorators
- `auth/`: JWT authentication with extended payload (includes tenantId, userType)
- `users/`: User management with tenant filtering
- `tenants/`: Tenant management (SYSTEM_ADMIN only)
- `roles/`: RBAC system with tenant-scoped and system roles
- `memberships/`: Subscription plans and payment tracking

## Key Entities & Relationships

**Users & Tenants**:
- `User` → belongs to `Tenant` via `tenant_id` (nullable for system admin)
- `Profile` → one-to-one with `User`, stores email/personal data
- `UserRole` → many-to-many between `User` and `Role` within tenant context

**Security Architecture**:
- JWT payload includes: `{ sub, username, tenantId?, userType, iat, exp }`
- All DB queries auto-filtered by tenant context (except SYSTEM_ADMIN)
- Permissions defined in `PERMISSIONS` constant (`src/common/constants/permissions.constant.ts`)

## Database Configuration

**Connection**: PostgreSQL via TypeORM with auto-synchronization enabled
**Seeding**: `pnpm run seed` creates initial data:
- System admin: `system_admin` / `admin123!`
- Demo tenant with owner: `demo_owner` / `demo123!`
- Demo receptionist: `demo_receptionist` / `demo123!`
- Default membership plans

## Security Decorators & Guards

**Common Patterns**:
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.USER_CREATE)  // Requires specific permission

@UseGuards(JwtAuthGuard, TenantGuard)
@RequireTenant()  // Requires tenant context (excludes system admin)

@Public()  // Bypasses JWT authentication
```

**Guard Usage by Access Level**:
- Public routes: `@Public()`
- Authenticated only: `@UseGuards(JwtAuthGuard)`
- With permissions: `@UseGuards(JwtAuthGuard, PermissionsGuard) + @RequirePermissions(...)`
- System admin only: `@RequirePermissions(PERMISSIONS.SYSTEM_ADMIN)`

## API Documentation

**Swagger**: Available at `/api-docs` when server is running
**Authentication**: All protected endpoints require `Authorization: Bearer <jwt_token>`
**Tenant Context**: Automatically extracted from JWT token for tenant-scoped operations

## Development Conventions

**Entity Patterns**:
- All entities extend base fields: `id`, `createdAt`, `updatedAt`, `deletedAt`
- Tenant-scoped entities include `tenant_id` column with automatic filtering
- Use `@ManyToOne(() => Tenant)` relationships for tenant association

**Service Patterns**:
- Services automatically receive tenant context via `TenantContextService.getTenantId()`
- SYSTEM_ADMIN operations bypass tenant filtering
- Use TypeORM query builders for complex tenant-aware queries

## Testing & Database

**Test Environment**:
- Jest with TypeScript support and coverage reporting
- Separate e2e test configuration
- Test environment uses `node` (not `jsdom`)

**Database Seeding**:
- Run `pnpm run seed` to populate initial data
- Creates system admin, demo tenant, and sample users for development
- Safe to run multiple times (idempotent operations)