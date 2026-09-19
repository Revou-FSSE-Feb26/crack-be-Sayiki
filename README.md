# SwitchLab Backend API

> **Enterprise REST API for Mechanical Keyboard Tuning, Customization Services & Escrow Protection**  
> Built with **NestJS**, **Prisma ORM**, **PostgreSQL (Supabase)**, and **Passport JWT (RBAC)**.

---

## 🌐 Live Deployments

| Platform | Role | Live URL |
|---|---|---|
| **Frontend Web App** | Vercel Deployment | [https://crack-fe-sayiki.vercel.app](https://crack-fe-sayiki.vercel.app) |
| **Backend API Service** | Render Deployment | [https://crack-be-sayiki.onrender.com](https://crack-be-sayiki.onrender.com) |

---

## 📑 Table of Contents
- [Project Description](#-project-description)
- [List of Features](#-list-of-features)
- [Tech Stack Used](#-tech-stack-used)
- [Application Screenshots](#-application-screenshots)
- [Entity Relationship Diagram (ERD)](#-entity-relationship-diagram-erd)
- [Security & Authentication Model](#-security--authentication-model)
- [Role & Permission Matrix](#-role--permission-matrix)
- [API Endpoints Specification](#-api-endpoints-specification)
  - [1. Authentication (`/auth`)](#1-authentication-auth)
  - [2. Users Management (`/users`)](#2-users-management-users)
  - [3. Listings & Modding Services (`/listings`)](#3-listings--modding-services-listings)
  - [4. Modder Directory & Portfolios (`/modders`)](#4-modder-directory--portfolios-modders)
  - [5. Orders & Escrow Bookings (`/orders`)](#5-orders--escrow-bookings-orders)
- [Environment Configuration](#-environment-configuration)
- [Installation and Usage Instructions](#-installation-and-usage-instructions)
- [Testing](#-testing)
- [Production Deployment](#-production-deployment)

---

## 🚀 Project Description

**SwitchLab** is an end-to-end mechanical keyboard marketplace and custom service platform connecting keyboard enthusiasts with verified, specialized keyboard modders across Indonesia. 

The backend service acts as the central engine managing secure escrow transactions, tuning package configurations (switch lubing, filming, stabilizer tuning, acoustic foaming), modder portfolio showcases, order tracking lifecycles, and role-based access control. With escrow protection, customer funds are held in trust until the customer receives their custom keyboard and verifies the sound and feel.

---

## ✨ List of Features

1. **Authentication & Role-Based Authorization (RBAC)**:
   - Complete JWT registration and login with bcrypt salted password hashing.
   - 3 distinct user roles: `CUSTOMER`, `MODDER`, and `ADMIN`.
   - Hardened JWT signing with zero hardcoded secret fallbacks.
   - Endpoint guards (`JwtAuthGuard`, `RolesGuard`) with resource ownership verification.

2. **Modder Services & Catalog Management**:
   - Modders create, update, and publish customization services with add-on options (e.g., Krytox 205g0 lube, Holee mod, sound dampening).
   - Public marketplace browsing with filtering and search.

3. **Modder Showcase & Directory**:
   - Verified modder profiles with specialties, tools, and audio sound test clips.
   - Modder portfolio showcases of completed custom workbench builds.

4. **Escrow Booking Workflow**:
   - Booking placement with courier or walk-in delivery channels.
   - Automatic 3-digit verification code generation matching BCA bank statements.
   - Payment proof receipt submission and admin verification queue.
   - Milestone tracking (Inbound shipment ➔ Workbench tuning ➔ Sound test ➔ Outbound dispatch ➔ Escrow release).

5. **Disbursements & Reputation System**:
   - Customer-driven escrow release upon delivery and build confirmation.
   - Admin payout disbursement system for modder payouts.
   - Verified customer ratings and reviews with automated modder average rating recalculation.

---

## 🛠️ Tech Stack Used

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | NestJS | 11.x | Modular architecture, Dependency Injection, and Guards |
| **Language** | TypeScript | 5.x | Strong static typing across entities, DTOs, and controllers |
| **ORM** | Prisma ORM | 7.x | Type-safe database queries, migrations, and relational mapping |
| **Database** | PostgreSQL (Supabase) | 16.x | Relational database hosted on AWS pooler |
| **Authentication** | Passport.js + JWT | - | Stateless bearer token authentication & guard validation |
| **Password Hashing** | bcryptjs | 3.x | One-way password encryption with 10 salt rounds |
| **Validation** | `class-validator` / `class-transformer` | - | Automated DTO payload whitelisting and input sanitation |
| **Testing** | Jest | 29.x | Unit and integration test suites |
| **Hosting** | Render | - | Containerized backend web service deployment |

---

## 📸 Application Screenshots

### 1. Escrow Admin Vault & Verification Queue
Admin verification queue displaying customer orders, exact bank transfer totals, and 3-digit verification codes matching BCA bank mutation statements.
![Admin Escrow Vault](docs/screenshots/admin-vault.png)

### 2. Payment Proof & Verification Confirmation
Customer checkout confirmation screen showing the exact transfer amount with the 3-digit unique escrow verification code and receipt upload status.
![Payment Verification Confirmation](docs/screenshots/payment-verification.png)

### 3. Escrow Order & Workbench Tracking
Interactive order lifecycle tracking showing current build stage, modder workbench notes, inbound/outbound logistics numbers, and escrow release action.
![Escrow Tracking](docs/screenshots/escrow-tracking.png)

### 4. Marketplace Services & Modder Discovery
Filterable catalog connecting keyboard enthusiasts with verified modders and tuning packages.
![Marketplace Services](docs/screenshots/marketplace-modders.png)

---

## 📊 Entity Relationship Diagram (ERD)

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
        string id PK "UUID"
        string name "Full Name"
        string email UK "Unique Email"
        string password "Hashed Password"
        Role role "CUSTOMER | MODDER | ADMIN"
        boolean isVerified "Default false"
        string locationCity "City name"
        float avgRating "Default 0.0"
        datetime createdAt
    }

    SERVICE {
        string id PK "UUID"
        string modderId FK "References USER"
        string title "Service Name"
        string description "Service details"
        float basePrice "Base cost"
        ServiceCategory category "CASE_AND_ACOUSTIC | SWITCH_MODS | STABILIZER_MODS | CUSTOMIZATION_AESTHETICS"
    }

    SERVICE_OPTION {
        string id PK "UUID"
        string serviceId FK "References SERVICE"
        string optionName "Option label"
        ServiceOptionType optionType "LUBE_TYPE | NEW_SWITCH | ADDON_SERVICE | FOAM_TYPE"
        float extraPrice "Additional price"
    }

    PORTFOLIO {
        string id PK "UUID"
        string modderId FK "References USER"
        string title "Build title"
        string description "Build description"
        string imageUrl "Showcase photo"
        datetime createdAt
    }

    BOOKING {
        string id PK "UUID"
        string customerId FK "References USER"
        string modderId FK "References USER"
        string keyboardModel "Keyboard target"
        BookingDeliveryMethod deliveryMethod "COURIER | WALK_IN"
        float totalPrice "Exact total with unique code"
        datetime bookingDate "Scheduled slot"
        BookingStatus status "UNPAID | PENDING_ADMIN_VERIFICATION | PAID_WAITING_MODDER | CUSTOMER_SENDING_KEYBOARD | KEYBOARD_IN_MODDER_HAND | SHIPPED_BACK | SUCCESS | UNDER_DISPUTE"
        string paymentProof "Receipt file path"
        string inboundTrackingNum "Logistics tracking"
        string outboundTrackingNum "Logistics tracking"
        boolean isDisbursed "Payout status"
        datetime disbursedAt
        datetime createdAt
    }

    BOOKING_ITEM {
        string id PK "UUID"
        string bookingId FK "References BOOKING"
        string serviceId FK "References SERVICE"
        json selectedOptions "Selected config options"
        float subTotal "Item cost"
    }

    REVIEW {
        string id PK "UUID"
        string bookingId FK "References BOOKING"
        string customerId FK "References USER"
        string modderId FK "References USER"
        int rating "1 to 5 stars"
        string comment "Feedback comment"
        datetime createdAt
    }
```

---

## 🔐 Security & Authentication Model

### 1. No Hardcoded Fallback Secret
`JWT_SECRET` is strictly enforced at application bootstrap:
- If `JWT_SECRET` is missing from the environment, the server immediately fails fast with an explicit fatal error: `FATAL: JWT_SECRET environment variable is missing and must be configured.`
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
- **`POST /auth/register`**: Register a new user (`CUSTOMER` or `MODDER`).
- **`POST /auth/login`**: Authenticate and retrieve JWT bearer token.
- **`GET /auth/me`**: Get authenticated user profile (`JwtAuthGuard`).

### 2. Users Management (`/users`)
- **`GET /users`**: List all users (`ADMIN` only).
- **`GET /users/:id`**: View profile detail by ID (`JwtAuthGuard`).
- **`POST /users`**: Create user account directly (`ADMIN` only).
- **`PATCH /users/:id`**: Update profile (`Self` or `ADMIN`).
- **`DELETE /users/:id`**: Delete user (`ADMIN` only).

### 3. Listings & Modding Services (`/listings`)
- **`GET /listings`**: Public catalog browse.
- **`GET /listings/:id`**: Public service details.
- **`POST /listings`**: Create tuning service (`MODDER`, `ADMIN`).
- **`PATCH /listings/:id`**: Update tuning service (`Owner Modder`, `ADMIN`).
- **`DELETE /listings/:id`**: Delete tuning service (`Owner Modder`, `ADMIN`).

### 4. Modder Directory & Portfolios (`/modders`)
- **`GET /modders`**: Public directory browse.
- **`GET /modders/:id`**: Public portfolio build detail.
- **`POST /modders`**: Create showcase build (`MODDER`, `ADMIN`).
- **`PATCH /modders/:id`**: Update showcase build (`Owner Modder`, `ADMIN`).
- **`DELETE /modders/:id`**: Delete showcase build (`Owner Modder`, `ADMIN`).

### 5. Orders & Escrow Bookings (`/orders`)
- **`GET /orders`**: List user bookings (`CUSTOMER` sees own; `MODDER` sees assigned; `ADMIN` sees all).
- **`GET /orders/:id`**: View booking details & tracking (`Participant`, `ADMIN`).
- **`POST /orders`**: Place escrow booking (`CUSTOMER`, `ADMIN`).
- **`PATCH /orders/:id`**: Update status, tracking, or disbursement (`Participant`, `ADMIN`).
- **`POST /orders/:id/review`**: Rate & review modder (`Order Customer`, `ADMIN`).
- **`DELETE /orders/:id`**: Delete booking (`ADMIN` only).

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (Supabase / local) | `postgresql://postgres:pass@host:5432/db` |
| `JWT_SECRET` | **Yes** | Cryptographic secret for signing tokens (min 32 chars) | `c695a46a228875ecf1cc01278b3da4b82...` |
| `JWT_EXPIRES_IN`| No | Token lifespan (default `7d`) | `7d` |
| `PORT` | No | HTTP server port (default `3001`) | `3001` |

---

## 💻 Installation and Usage Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: PostgreSQL database instance (local or Supabase)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/Revou-FSSE-Feb26/crack-be-Sayiki.git
cd crack-be-Sayiki
npm install
```

### 3. Setup Database with Prisma
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed sample data (users, modders, services, bookings, reviews)
npm run seed
```

### 4. Running the Application
```bash
# Development mode with hot-reload
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```
The server will start at `http://localhost:3001`.

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run test coverage report
npm run test:cov
```

---

## 🚢 Production Deployment

1. Push your changes to GitHub `main` branch.
2. Link the repository in your cloud provider (e.g. **Render**).
3. Set the following environment variables in the dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `NODE_ENV=production`
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm run start:prod`

---

## 📄 License
This project is proprietary and confidential for the RevoU Full Stack Software Engineering Program.
