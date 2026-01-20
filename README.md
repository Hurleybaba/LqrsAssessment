# Demo Credit - Mobile Lending MVP

A robust, transactional wallet service built for a mobile lending application. This MVP allows users to create accounts, fund wallets, transfer funds peer-to-peer, and withdraw funds, while enforcing compliance checks via the Lendsqr Adjutor API.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture & Design](#-system-architecture--design)
- [Database Schema](#-database-schema-er-diagram)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)

## ✨ Features

- **User Account Management:** Secure user registration with compliance checks
- **Wallet Operations:** Fund, transfer, and withdraw funds with atomic transactions
- **Compliance:** Integrated Lendsqr Adjutor Karma Blacklist verification
- **Transaction History:** Complete audit trail of all wallet operations
- **Concurrency Control:** Pessimistic locking to prevent double-spending
- **Error Handling:** Comprehensive error handling and logging

## 🛠 Tech Stack

- **Runtime:** Node.js (LTS v18+)
- **Language:** TypeScript (Strict Mode)
- **Framework:** Express.js
- **Database:** MySQL 8.0+
- **ORM:** Knex.js
- **Testing:** Jest
- **Architecture:** Modular (Controller-Service-Repository)

## 🏗 System Architecture & Design

### 1. Atomic Transactions & Concurrency

Financial integrity is paramount. This system uses **Database Transactions (ACID)** for all wallet operations.

- **Transfers:** Use `db.transaction()` to ensure that debiting the sender and crediting the receiver happen successfully together, or not at all.
- **Pessimistic Locking:** The `FOR UPDATE` SQL clause is used when fetching wallet balances during transfers. This prevents "Double Spending" race conditions if a user initiates two transfers simultaneously.

### 2. Repository Pattern

Data access logic is isolated in `*.repository.ts` files. This separation of concerns allows the Service layer to focus purely on business logic (validation, calculations) without being cluttered by SQL queries.

### 3. Compliance (Karma Blacklist)

Before onboarding, every user's email is checked against the **Lendsqr Adjutor Karma Blacklist**.

- **Strategy:** Fail-Open. If the external Adjutor API is down, we log the error but allow registration to proceed (as per standard MVP reliability patterns), ensuring user friction is minimized during outages.

## 🗄 Database Schema (ER Diagram)
![ER Diagram](ER%20diagram.png)

The database consists of four normalized tables:

1.  **Users:** Identity management with email compliance tracking
2.  **Wallets:** Financial balance and currency (one-to-one relationship with Users)
3.  **Transactions:** Ledger of all credits/debits (FUND, TRANSFER, WITHDRAW)
4.  **Transfers:** Record of peer-to-peer movements linking sender and receiver wallets

All tables include timestamps (`created_at`, `updated_at`) for audit trails.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL (v8.0 or higher)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Hurleybaba/LqrsAssessment
    cd assessment
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:

    ```bash
    cp .env.example .env
    ```

    See [Configuration](#-configuration) for required variables.

4.  **Run Migrations**

    ```bash
    npm run migrate:latest
    ```

5.  **Start the Server**

    ```bash
    # Development mode (with hot reload)
    npm run dev

    # Production mode
    npm run build
    npm start
    ```

## ⚙ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_secure_password
DB_NAME=lendsqrdb
DB_PORT=3306

# Lendsqr Adjutor API (Compliance)
ADJUTOR_API_KEY=sk_live_your_api_key_here
ADJUTOR_API_URL=https://adjutor.lendsqr.com

# Logging
LOG_LEVEL=info
```

### Production Considerations

- Use environment variables from your deployment platform (AWS Secrets Manager, Azure Key Vault, etc.)
- Ensure `NODE_ENV=production` in production deployments
- Use connection pooling for database connections
- Enable HTTPS/TLS for all communications
- Implement rate limiting on API endpoints

## 📖 API Documentation

### Base URL

```
http://localhost:3000/api
```

### User Endpoints

#### 1. Create User

**POST** `/users`

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "access_token": "uuid"
  }
}
```

#### 2. Get My Profile

**GET** `/users/me`

**Headers:**

```
Authorization: Bearer <user_id>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "wallet": {
      "balance": 50000,
      "currency": "NGN"
    }
  }
}
```

### Wallet Endpoints

All wallet endpoints require authentication:

```
Authorization: Bearer <user_id>
```

#### 1. Fund Wallet

**POST** `/wallet/fund`

**Request Body:**

```json
{
  "amount": 5000
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Wallet funded successfully",
    "new_balance": 55000
  }
}
```

#### 2. Transfer Funds

**POST** `/wallet/transfer`

**Request Body:**

```json
{
  "email": "receiver@example.com",
  "amount": 1000
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Transfer successful",
    "transaction_id": "uuid",
    "new_balance": 54000
  }
}
```

#### 3. Withdraw Funds

**POST** `/wallet/withdraw`

**Request Body:**

```json
{
  "amount": 200
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Withdrawal successful",
    "new_balance": 53800
  }
}
```

#### 4. Transaction History

**GET** `/wallet/history`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "TRANSFER",
        "amount": 1000,
        "status": "completed",
        "created_at": "2026-01-20T10:00:00Z"
      }
    ]
  }
}
```

## Testing

Run the unit test suite:

```bash
npm test
```

