# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **川岳員工及會員管理系統 (Chuanyueh Employee and Member Management System)** that provides branch management, employee management, member management, and role-based access control for businesses with multiple locations.

## Architecture

**Monorepo Structure:**
- `store-management-api/` - NestJS backend API with Prisma ORM
- `store-management-client/` - Vue 3 + TypeScript frontend with Element Plus
- `tech_architecture_doc.md` - Comprehensive technical architecture documentation

**Tech Stack:**
- **Backend**: NestJS + TypeScript, Prisma ORM, MySQL database, JWT authentication
- **Frontend**: Vue 3 + TypeScript, Vite build tool, Element Plus UI, Pinia state management, Vue Router
- **Database**: MySQL with Prisma schema for multi-tenant branch system

## Development Commands

### Backend (store-management-api/)
```bash
npm run start:dev          # Start development server with hot reload
npm run build              # Build for production
npm run start:prod         # Start production server
npm run lint               # Run ESLint
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Prisma commands
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Run database migrations
npx prisma studio          # Open Prisma Studio
npx prisma seed            # Seed database with initial data
```

### Frontend (store-management-client/)
```bash
npm run dev                # Start development server
npm run build              # Build for production (includes TypeScript compilation)
npm run preview            # Preview production build
```

## Core Architecture Patterns

### Backend - NestJS Modular Architecture
- **Modules**: auth, users, branches, employees, members, roles, audit
- **Authentication**: JWT with Passport.js strategy
- **Database**: Prisma ORM with MySQL, includes audit logging
- **API**: RESTful endpoints with `/api/v1/` prefix
- **Validation**: class-validator with global ValidationPipe
- **CORS**: Enabled for development with credentials support

### Frontend - Vue 3 Composition API
- **State Management**: Pinia stores (auth store implemented)
- **UI Framework**: Element Plus components
- **Routing**: Vue Router with authentication guards
- **Layout**: MainLayout wrapper for authenticated routes
- **Views**: Dashboard, Members, Login with form components

### Database Schema (Prisma)
Key entities with relationships:
- `Branch` - Store locations
- `User` - System login accounts
- `Role` - RBAC roles with JSON permissions
- `UserRole` - Many-to-many with optional branch scoping
- `Employee` - User profiles linked to branches
- `Member` - Customer records with cross-branch support
- `ServiceRecord` - Transaction history
- `AuditLog` - System audit trail

### Permission System
Role-based access control (RBAC) with branch-scoped permissions:
- **Roles**: SUPER_ADMIN, BRANCH_MANAGER, EMPLOYEE
- **Permissions**: JSON array in roles (e.g., `["branch.read", "employee.manage"]`)
- **Scoping**: UserRoles can be branch-specific or global

## Key Features

1. **Multi-Branch Management**: Employees assigned to specific branches with scoped permissions
2. **Cross-Branch Members**: Members can receive services at any branch location  
3. **RBAC Authorization**: Granular permissions with branch-level scoping
4. **Audit Logging**: Complete audit trail for all system changes
5. **JWT Authentication**: Stateless authentication with refresh token support

## Development Guidelines

### Backend Development
- Follow NestJS module structure in `src/modules/`
- Use Prisma for all database operations
- Implement DTOs for request validation
- Add audit logging for sensitive operations
- Use JWT guards for protected endpoints

### Frontend Development  
- Use Vue 3 Composition API with `<script setup>`
- Leverage Element Plus components for UI consistency
- Manage state with Pinia stores
- Implement route guards for authentication
- Follow TypeScript strict mode

### Database Changes
- Create Prisma migrations for schema changes
- Update seed data when adding new roles/permissions
- Maintain referential integrity across branches
- Consider performance impact of cross-branch queries

## Common Patterns

### Adding New Entities
1. Define Prisma model in `schema.prisma`
2. Create NestJS module with controller/service/DTOs
3. Add corresponding Pinia store for frontend
4. Create Vue components and routes
5. Update audit logging if needed

### Authentication Flow
1. User logs in via `/api/v1/auth/login`
2. JWT token stored in Pinia auth store
3. Router guards check authentication status
4. API requests include Authorization header
5. Backend validates JWT and checks permissions

### Permission Checking
- Backend: Use role guards with `@Roles()` and `@Permissions()` decorators
- Frontend: Check permissions in Pinia auth store before showing UI elements
- Database: UserRoles can be branch-scoped for location-specific access