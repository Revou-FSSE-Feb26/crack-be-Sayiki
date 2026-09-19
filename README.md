# SwitchLab Backend API

> **Enterprise REST API for Mechanical Keyboard Tuning, Customization Services & Escrow Protection**  
> Built with **NestJS**, **Prisma ORM**, **PostgreSQL (Supabase)**, and **Passport JWT (RBAC)**.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Security & Authentication Model](#-security--authentication-model)
- [Role & Permission Matrix](#-role--permission-matrix)
- [API Endpoints Specification](#-api-endpoints-specification)
  - [1. Authentication (`/auth`)](#1-authentication-auth)
  - [2. Users Management (`/users`)](#2-users-management-users)
  - [3. Listings & Modding Services (`/listings`)](#3-listings--modding-services-listings)
  - [4. Modder Directory & Portfolios (`/modders`)](#4-modder-directory--portfolios-modders)
  - [5. Orders & Escrow Bookings (`/orders`)](#5-orders--escrow-bookings-orders)
- [Database Schema & ERD](#-database-schema--erd)
- [Environment Configuration](#-environment-configuration)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Testing](#-testing)
- [Production Deployment](#-production-deployment)

---

## 🚀 Overview

SwitchLab is a two-sided marketplace connecting mechanical keyboard enthusiasts with verified keyboard modders. The backend handles:
- **JWT Authentication & Role-Based Access Control**: Strict role separation between `CUSTOMER`, `MODDER`, and `ADMIN`.
- **Modder Marketplace & Catalog**: Services (lubing, stabilizer tuning, case foaming) and build portfolios.
- **Escrow Transaction Management**: End-to-end booking flow from payment proof submission, admin verification, tracking logistics, to escrow fund release.
- **Ratings & Reviews**: Real-time recalculation of modder average ratings upon completed builds.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Framework** | NestJS 11 | Modular architecture with dependency injection, controllers, services, and pipes |
| **Language** | TypeScript 5 | Strictly typed codebase across all entities and DTOs |
| **Database** | PostgreSQL | Hosted on AWS via Supabase pooler |
| **ORM** | Prisma ORM 7 | Type-safe queries, relations, and migrations |
| **Authentication** | Passport.js & JWT | Bearer token authentication with zero hardcoded fallbacks |
| **Password Hashing**| bcryptjs | Salted hashing with 10 rounds |
| **Validation** | `class-validator` & `class-transformer` | Global validation pipe with payload whitelisting |
| **Testing** | Jest | Comprehensive unit and controller test suites |

---

## 🔐 Security & Authentication Model

### 1. No Hardcoded Fallback Secret
`JWT_SECRET` is strictly enforced at application bootstrap:
- If `JWT_SECRET` is missing from the environment, the server immediately fails fast with an explicit fatal error.
- No default or fallback strings are exposed in public source code, preventing unauthorized token forgery.

### 2. Guards & Decorators
- **`JwtAuthGuard`**: Extracts and validates the Bearer token from the `Authorization` header (`Bearer <token>`). Verifies signature, expiration, and ensures the user still exists in the database.
- **`RolesGuard`**: Reads role metadata attached via `@Roles(...)` and validates against `req.user.role`. Rejects unauthorized roles with `403 Forbidden`.
- **`@CurrentUser()`**: Custom parameter decorator for extracting authenticated user context in controllers without manual typecasting.

### 3. Participant Ownership Verification
In addition to role guards, write operations verify that the authenticated user owns the resource:
- Modders can only edit/delete their own listings and portfolio showcases.
- Customers can only view, track, or review their own bookings.
- Admins possess system-wide supervisory capabilities (e.g. verifying payment proofs, resolving disputes, and deleting records).

---

## 🛡️ Role & Permission Matrix

| Endpoint | Method | Public | `CUSTOMER` | `MODDER` | `ADMIN` | Description |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `/auth/register` | `POST` | ✅ | ✅ | ✅ | ✅ | Register a new account (`CUSTOMER` or `MODDER`) |
| `/auth/login` | `POST` | ✅ | ✅ | ✅ | ✅ | Authenticate with email & password |
| `/auth/me` | `GET` | ❌ | ✅ | ✅ | ✅ | Get currently authenticated profile |
| `/users` | `GET` | ❌ | ❌ | ❌ | ✅ | List all registered users |
| `/users/:id` | `GET` | ❌ | ✅ | ✅ | ✅ | View user profile details |
| `/users` | `POST` | ❌ | ❌ | ❌ | ✅ | Create user account via admin panel |
| `/users/:id` | `PATCH` | ❌ | Self only | Self only | ✅ | Update user profile |
| `/users/:id` | `DELETE` | ❌ | ❌ | ❌ | ✅ | Delete user account |
| `/listings` | `GET` | ✅ | ✅ | ✅ | ✅ | Browse catalog services |
| `/listings/:id` | `GET` | ✅ | ✅ | ✅ | ✅ | View service details & pricing |
| `/listings` | `POST` | ❌ | ❌ | ✅ | ✅ | Create tuning package |
| `/listings/:id` | `PATCH` | ❌ | ❌ | Owner only | ✅ | Edit tuning package |
| `/listings/:id` | `DELETE` | ❌ | ❌ | Owner only | ✅ | Remove tuning package |
| `/modders` | `GET` | ✅ | ✅ | ✅ | ✅ | Browse modder directory & portfolios |
| `/modders/:id` | `GET` | ✅ | ✅ | ✅ | ✅ | View portfolio showcase detail |
| `/modders` | `POST` | ❌ | ❌ | ✅ | ✅ | Publish portfolio build |
| `/modders/:id` | `PATCH` | ❌ | ❌ | Owner only | ✅ | Edit portfolio build |
| `/modders/:id` | `DELETE` | ❌ | ❌ | Owner only | ✅ | Delete portfolio build |
| `/orders` | `GET` | ❌ | Own orders | Assigned | ✅ All | List escrow bookings |
| `/orders/:id` | `GET` | ❌ | Participant | Participant | ✅ | Get single booking tracking & status |
| `/orders` | `POST` | ❌ | ✅ | ❌ | ✅ | Create escrow booking & upload proof |
| `/orders/:id` | `PATCH` | ❌ | Participant | Participant | ✅ | Update status, logistics tracking, or escrow |
| `/orders/:id/review`| `POST` | ❌ | Owner only | ❌ | ✅ | Rate & review modder after delivery |
| `/orders/:id` | `DELETE` | ❌ | ❌ | ❌ | ✅ | Remove booking record |

---

## 📡 API Endpoints Specification

### 1. Authentication (`/auth`)

#### `POST /auth/register`
Create a new user account.
```json
// Request Body
{
  "name": "Adit Pratama",
  "email": "adit@example.com",
  "password": "Password123!",
  "role": "CUSTOMER",
  "locationCity": "Jakarta"
}

// Response (201 Created)
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-v4",
    "name": "Adit Pratama",
    "email": "adit@example.com",
    "role": "CUSTOMER",
    "locationCity": "Jakarta"
  }
}
```

#### `POST /auth/login`
Authenticate and retrieve a JWT bearer token.
```json
// Request Body
{
  "email": "adit@example.com",
  "password": "Password123!"
}

// Response (200 OK)
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-v4",
    "name": "Adit Pratama",
    "email": "adit@example.com",
    "role": "CUSTOMER"
  }
}
```

#### `GET /auth/me`
*Protected: `JwtAuthGuard`*  
Returns profile details of the authenticated token bearer.

---

### 2. Users Management (`/users`)

| Method | Endpoint | Guard | Allowed Roles | Description |
|---|---|---|---|---|
| `GET` | `/users` | `JwtAuthGuard`, `RolesGuard` | `ADMIN` | List all users |
| `GET` | `/users/:id` | `JwtAuthGuard` | Authenticated | Get user profile by ID |
| `POST` | `/users` | `JwtAuthGuard`, `RolesGuard` | `ADMIN` | Create user account |
| `PATCH` | `/users/:id` | `JwtAuthGuard` | Self, `ADMIN` | Update name, city, password |
| `DELETE`| `/users/:id` | `JwtAuthGuard`, `RolesGuard` | `ADMIN` | Delete user |

---

### 3. Listings & Modding Services (`/listings`)

| Method | Endpoint | Guard | Allowed Roles | Description |
|---|---|---|---|---|
| `GET` | `/listings` | Public | Anyone | Browse active marketplace services |
| `GET` | `/listings/:id` | Public | Anyone | View service options and pricing |
| `POST` | `/listings` | `JwtAuthGuard`, `RolesGuard` | `MODDER`, `ADMIN` | Publish new tuning service |
| `PATCH` | `/listings/:id` | `JwtAuthGuard`, `RolesGuard` | Owner Modder, `ADMIN`| Update service details or pricing |
| `DELETE`| `/listings/:id` | `JwtAuthGuard`, `RolesGuard` | Owner Modder, `ADMIN`| Delete service listing |

#### Sample Create Listing Payload:
```json
{
  "title": "Premium Switch Lubing & Filming",
  "description": "Hand lubed with Krytox 205g0 and Deskeys films for creamy acoustics.",
  "basePrice": 35000,
  "category": "SWITCH_MODS",
  "options": [
    {
      "optionName": "Krytox 205g0 + GPL 105",
      "optionType": "LUBE_TYPE",
      "extraPrice": 0
    },
    {
      "optionName": "Deskeys Switch Films (0.3mm)",
      "optionType": "ADDON_SERVICE",
      "extraPrice": 15000
    }
  ]
}
```

---

### 4. Modder Directory & Portfolios (`/modders`)

| Method | Endpoint | Guard | Allowed Roles | Description |
|---|---|---|---|---|
| `GET` | `/modders` | Public | Anyone | List all modders with portfolios & ratings |
| `GET` | `/modders/:id` | Public | Anyone | View portfolio build detail |
| `POST` | `/modders` | `JwtAuthGuard`, `RolesGuard` | `MODDER`, `ADMIN` | Add portfolio showcase build |
| `PATCH` | `/modders/:id` | `JwtAuthGuard`, `RolesGuard` | Owner Modder, `ADMIN`| Update showcase details |
| `DELETE`| `/modders/:id` | `JwtAuthGuard`, `RolesGuard` | Owner Modder, `ADMIN`| Remove showcase build |

---

### 5. Orders & Escrow Bookings (`/orders`)

| Method | Endpoint | Guard | Allowed Roles | Description |
|---|---|---|---|---|
| `GET` | `/orders` | `JwtAuthGuard` | Participant, `ADMIN` | List bookings (`CUSTOMER` sees own; `MODDER` sees assigned; `ADMIN` sees all) |
| `GET` | `/orders/:id` | `JwtAuthGuard` | Participant, `ADMIN` | Get booking status & tracking |
| `POST` | `/orders` | `JwtAuthGuard`, `RolesGuard` | `CUSTOMER`, `ADMIN` | Place booking with payment proof |
| `PATCH` | `/orders/:id` | `JwtAuthGuard` | Participant, `ADMIN` | Update booking status, tracking numbers, or disbursement |
| `POST` | `/orders/:id/review`| `JwtAuthGuard`, `RolesGuard` | Order Customer, `ADMIN`| Submit rating and review after completion |
| `DELETE`| `/orders/:id` | `JwtAuthGuard`, `RolesGuard` | `ADMIN` | Remove booking |

#### Booking Lifecycle Statuses:
```text
UNPAID ➔ PENDING_ADMIN_VERIFICATION ➔ PAID_WAITING_MODDER ➔ CUSTOMER_SENDING_KEYBOARD ➔ KEYBOARD_IN_MODDER_HAND ➔ SHIPPED_BACK ➔ SUCCESS (Escrow Released)
```

---

## 📊 Database Schema & ERD

```mermaid
erDiagram
    USER ||--o{ SERVICE : "modder offers"
    USER ||--o{ PORTFOLIO : "modder builds"
    USER ||--o{ BOOKING : "customer places"
    USER ||--o{ BOOKING : "modder assigned"
    USER ||--o{ REVIEW : "customer writes"
    USER ||--o{ REVIEW : "modder receives"

    SERVICE ||--o{ SERVICE_OPTION : "has options"
    SERVICE ||--o{ BOOKING_ITEM : "booked in"

    BOOKING ||--o{ BOOKING_ITEM : "contains items"
    BOOKING ||--o| REVIEW : "produces"

    USER {
        string id PK
        string name
        string email UK
        string password
        Role role
        boolean isVerified
        string locationCity
        float avgRating
        datetime createdAt
    }

    SERVICE {
        string id PK
        string modderId FK
        string title
        string description
        float basePrice
        ServiceCategory category
    }

    BOOKING {
        string id PK
        string customerId FK
        string modderId FK
        string keyboardModel
        BookingDeliveryMethod deliveryMethod
        float totalPrice
        datetime bookingDate
        BookingStatus status
        string paymentProof
        string inboundTrackingNum
        string outboundTrackingNum
        boolean isDisbursed
        datetime disbursedAt
        datetime createdAt
    }

    REVIEW {
        string id PK
        string bookingId FK
        string customerId FK
        string modderId FK
        int rating
        string comment
        datetime createdAt
    }
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and supply the values:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (Supabase / local) | `postgresql://postgres:pass@host:5432/db` |
| `JWT_SECRET` | **Yes** | Cryptographic secret for signing tokens (min 32 chars) | `your_secure_random_string_min_32_chars` |
| `JWT_EXPIRES_IN`| No | Token lifespan (default `7d`) | `7d`, `24h`, `30d` |
| `PORT` | No | HTTP server port (default `3001`) | `3001` |

> ⚠️ **Security Warning**: The backend refuses to start if `JWT_SECRET` is missing. Never commit `.env` containing production secrets to public repositories.

---

## 💻 Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local instance or Supabase database

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Revou-FSSE-Feb26/crack-be-Sayiki.git
cd crack-be-Sayiki

# Install dependencies
npm install
```

### 3. Database Synchronization
```bash
# Push Prisma schema to the database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample users, modders, services, and bookings
npm run seed
```

### 4. Run the Development Server
```bash
npm run start:dev
```
The API will be available at: `http://localhost:3001`

---

## 🧪 Testing

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run test coverage report
npm run test:cov
```

**Test Suite Coverage**:
- Controller Unit Tests (`Users`, `Listings`, `Modders`, `Orders`, `Auth`, `Products`, `App`)
- Service Unit Tests (`UsersService`, `ListingsService`, `ModdersService`, `OrdersService`, `AuthService`, `ProductsService`)

---

## 🚢 Production Deployment

1. **Build the Production Bundle**:
   ```bash
   npm run build
   ```
2. **Configure Environment Variables in Hosting Dashboard** (e.g. Render, Railway, AWS):
   - Set `DATABASE_URL` pointing to your hosted database.
   - Set `JWT_SECRET` to a cryptographically secure string.
   - Set `JWT_EXPIRES_IN` to `7d`.
   - Set `NODE_ENV` to `production`.
3. **Start Command**:
   ```bash
   npm run start:prod
   ```

---

## 📄 License
This project is proprietary and confidential for the RevoU Full Stack Software Engineering Program.
