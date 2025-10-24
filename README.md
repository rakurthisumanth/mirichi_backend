# Mirichi Backend (Express + MongoDB Driver)

Node.js backend using Express, the official MongoDB Node.js driver, and bcrypt.

## Features

- ES Modules ("type": "module")
- MongoDB collections: users, farmers, customers
- Auth: POST `/login` verifies credentials and returns a success message (no JWT)
- Endpoints: POST `/farmers`, POST `/customers`
- Seed script to create an initial admin user

## Requirements

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. Copy env file and configure:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/mirichi
JWT_SECRET=change_me_to_a_long_random_string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

2. Install dependencies:

```powershell
npm install
```

3. Seed initial user:

```powershell
npm run seed
```

Server runs on `http://0.0.0.0:3000`.

```powershell
 Base path: `/api`
 POST `/api/login` body: `{ "username": "admin", "password": "admin123" }` → `{ "message": "Login successful", "user": {"username": "admin", "id": "..."} }`
 POST `/api/farmers` body:

Server runs on `http://localhost:4000`.

## API

- POST `/login` body: `{ "username": "admin", "password": "admin123" }` → `{ "token": "..." }`
- POST `/farmers` (Bearer token required) body:
  ```json
  {
    "name": "Ravi",
    "mobile_number": "9876543210",
    "village": "SomeVillage",
    "no_of_bags": 10
  }
  ```
 POST `/api/customers` body:
  ```json
  {
## Swagger

Swagger UI will be available at: `http://0.0.0.0:3000/api-docs`

    "customer_name": "Suresh",
    "phone_number": "9123456780",
    "buy_bags": 5
  }
  ```

No token-based authorization is used.

## Notes

- Passwords are hashed with bcrypt in the seed and any user creation logic.
JWT is not used in this setup.
