# Chai Craft - Tea Shop Application

## Overview

Chai Craft is a full-stack e-commerce web application for a tea shop, built with React frontend and Express backend. The application features role-based authentication (customer/admin), product catalog management, shopping cart functionality, order processing with UPI payment integration, job postings, and a contact system. The app uses a warm, earthy design theme with Playfair Display and DM Sans fonts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: 
  - TanStack React Query for server state and API caching
  - Zustand for client-side cart state (persisted to localStorage)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js (v5) with TypeScript
- **API Design**: RESTful JSON API with session-based authentication
- **Authentication**: Passport.js with local strategy, using scrypt for password hashing
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Key Design Patterns
- **Monorepo Structure**: Client code in `/client`, server code in `/server`, shared types in `/shared`
- **Path Aliases**: `@/` for client src, `@shared/` for shared modules, `@assets/` for attached assets
- **Type Safety**: Zod schemas for runtime validation, Drizzle-Zod for database schema types
- **API Pattern**: Custom hooks (`use-auth`, `use-cart`, `use-products`, `use-orders`) wrap React Query mutations/queries

### Database Schema
Core tables:
- `users` - Authentication and profile data with role field (customer/admin)
- `products` - Product catalog with category, pricing, stock, and Hindi name support
- `orders` / `orderItems` - Order management with status tracking
- `jobs` - Career postings management
- `messages` - Contact form submissions

## External Dependencies

### Database
- PostgreSQL (required, configured via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database queries

### Authentication
- express-session for session management
- passport / passport-local for authentication strategy
- connect-pg-simple for PostgreSQL session storage

### UI Framework
- Full shadcn/ui component suite (Radix UI primitives)
- Recharts for admin dashboard analytics
- Lucide React for icons
- Embla Carousel for carousels

### Build Tools
- Vite for frontend development and bundling
- esbuild for server bundling in production
- TSX for TypeScript execution in development

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key (optional, has default for development)