# 🏥 MedStore B2B Medical App

A modern, user-friendly B2B mobile application for medical store management built with **Ionic + Angular 19** and **Node.js + Express + MongoDB**.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Backend API](#backend-api)
- [Frontend](#frontend)
- [Test Credentials](#test-credentials)
- [Database Models](#database-models)
- [Key Features](#key-features)
- [Development Guide](#development-guide)

---

## 🎯 Project Overview

**MedStore** is a B2B application designed specifically for medical store management with three user roles:

- **Store Owner**: Full system access, user management, inventory control, and reporting
- **Sales Person**: Order creation, POS transactions, and client management
- **Delivery Agent**: Order delivery, payment collection, and due management

### Core Workflows

#### 1. Order Creation (Sales Person/Owner)
- Select/add client
- Add items with automatic stock checking
- System handles: in stock → reduce stock | low stock → alert | out of stock → backorder
- Backorder creates alerts for owner

#### 2. Order Delivery & Payment (Agent)
- Mark items provided
- Record payment: full → completed | partial → due remains | zero → borrow
- Auto-updates client total due

#### 3. POS Mode (In-Store)
- No agent needed
- Instant billing and stock reduction
- Print/email invoice

#### 4. Background Alerts (Auto every 6 hours)
- Low stock (≤10)
- Out of stock (0)
- Expiring soon (≤30 days)
- Expired items
- Backorder pending

---

## 🏗️ Architecture

### Directory Structure

```
medstore/
├── backend/
│   ├── Api/
│   │   ├── common/          # Enums, constants
│   │   ├── Controllers/     # Request handlers
│   │   ├── Helper/          # Auth, error handling, utilities
│   │   ├── Interface/       # TypeScript interfaces
│   │   ├── middleware/      # RBAC, auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── modules/         # Feature modules (auth, user, client, item, order, alert, report)
│   │   └── service/         # Business logic services
│   ├── BaseRoutes/          # Open & closed routes
│   ├── seeders/             # Database seeders with test data
│   ├── scripts/             # Utility scripts
│   ├── index.ts             # Server entry point
│   ├── package.json         # Dependencies
│   ├── tsconfig.json        # TypeScript config
│   └── .env files           # Environment configs
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── services/    # API, Auth, Guards, Interceptors
    │   │   ├── pages/       # Screen components
    │   │   ├── components/  # Reusable UI components
    │   │   ├── store/       # NGXS state management
    │   │   ├── app.routes.ts      # Route definitions
    │   │   └── app.component.ts   # Root component
    │   ├── main.ts          # Bootstrap
    │   ├── index.html       # Entry HTML
    │   └── styles.scss      # Global styles
    ├── angular.json         # Angular config
    ├── package.json         # Dependencies
    └── tsconfig.json        # TypeScript config
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: v18+ (Check with `node --version`)
- **npm**: v9+ (Check with `npm --version`)
- **MongoDB**: Local or Atlas connection string
- **Git**: For version control

### Backend Setup

```bash
# Navigate to backend
cd medstore/backend

# Install dependencies
npm install

# Create .env file (already provided)
cat .env.development  # Check configuration

# Seed database with test data
npm run seed

# Start backend server
npm start

# Server runs on: http://localhost:5000
```

**Expected Output:**
```
✓ Connected to MongoDB
✓ Created 6 users
✓ Created 8 clients
✓ Created 17 items
✓ Created 15 orders
✓ Created 8 alerts
✓ Database seeding completed successfully!
```

### Frontend Setup

```bash
# Navigate to frontend
cd medstore/frontend

# Install dependencies
npm install

# Start Ionic development server
npm start

# App runs on: http://localhost:4200
```

---

## 🔌 Backend API

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "sales1@medstore.com",
  "password": "sales123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "Sales Person 1",
      "email": "sales1@medstore.com",
      "role": "sales_person"
    }
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Sales Person 1",
    "email": "sales1@medstore.com",
    "role": "sales_person",
    "assignedClients": [...]
  }
}
```

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientId": "client_id_here",
  "orderType": "delivery",  # or "pos"
  "items": [
    {
      "itemId": "item_id_here",
      "quantity": 5,
      "unitPrice": 100,
      "itemName": "Paracetamol 500mg"
    }
  ],
  "discount": 10,
  "notes": "Special order"
}
```

#### Get Orders
```http
GET /orders?status=created&clientId=xyz
Authorization: Bearer {token}

Query Params:
- status: created|assigned|items_provided|completed|backorder
- clientId: filter by client
- type: delivery|pos
```

#### Record Payment
```http
PUT /orders/{orderId}/payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5000,
  "method": "cash",
  "notes": "Partial payment"
}
```

### Client Endpoints

#### Get Clients
```http
GET /clients
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "City Hospital",
      "phone": "03001234567",
      "totalDue": 25000,
      "creditLimit": 50000,
      "assignedSalesPerson": {...}
    }
  ]
}
```

#### Get Client Dues
```http
GET /clients/{clientId}/dues
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "client": {...},
    "totalDue": 25000,
    "creditLimit": 50000,
    "availableCredit": 25000,
    "pendingOrders": [...]
  }
}
```

### Alert Endpoints

#### Get Alerts
```http
GET /alerts?resolved=false
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "type": "low_stock",
      "itemId": "...",
      "message": "Paracetamol: Stock is low (5 units)",
      "severity": "warning",
      "seenByOwner": false
    }
  ]
}
```

### Report Endpoints (Owner Only)

#### Outstanding Dues Report
```http
GET /reports/outstanding-dues
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalClients": 8,
      "clientsWithDue": 4,
      "totalOutstanding": 125000
    },
    "details": [...]
  }
}
```

#### Collection Report
```http
GET /reports/collection?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

#### Stock Report
```http
GET /reports/stock
Authorization: Bearer {token}

Returns: Low stock items, out of stock items, total inventory value
```

---

## 💻 Frontend

### Pages Structure

#### Role: Store Owner
- **Dashboard**: Overview of system status, alerts, pending approvals
- **Users Management**: Create/edit staff (sales persons, agents)
- **Reports**: Dues, collections, sales performance, expiry, stock

#### Role: Sales Person
- **Dashboard**: Quick stats, recent orders, assigned clients
- **Create Order**: Add items, select client, manage discount, create order
- **POS**: Fast in-store billing, instant payment and stock reduction
- **Orders**: View/manage all created orders

#### Role: Delivery Agent
- **Dashboard**: Assigned orders, due collection
- **Assigned Orders**: View orders to deliver, mark items provided
- **Payment Entry**: Record customer payment, update dues

### Key Services

#### `api.service.ts`
- All HTTP calls to backend
- Token management
- Error handling

#### `auth.service.ts`
- Login/logout logic
- User state management
- Role-based redirects

#### `auth.guard.ts`
- Route protection
- Role-based access control

#### `token.interceptor.ts`
- Auto-attach token to all requests
- Request/response logging

---

## 🔐 Test Credentials

### Owner Account
```
Email:    owner@medstore.com
Password: owner123
```

### Sales Person Account
```
Email:    sales1@medstore.com
Password: sales123
```

### Delivery Agent Account
```
Email:    agent1@medstore.com
Password: agent123
```

---

## 📊 Database Models

### User
```typescript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "owner" | "sales_person" | "delivery_agent",
  assignedClients: [ObjectId],
  isActive: Boolean,
  timestamps
}
```

### Client
```typescript
{
  name: String,
  phone: String,
  email: String,
  address: String,
  shopName: String,
  assignedSalesPerson: ObjectId (User),
  totalDue: Number,
  creditLimit: Number,
  isActive: Boolean,
  timestamps
}
```

### Item
```typescript
{
  name: String,
  category: String,
  sku: String,
  stockQuantity: Number,
  lowStockThreshold: Number,
  sellingPrice: Number,
  costPrice: Number,
  expiryDate: Date,
  isExpired: Boolean,
  description: String,
  timestamps
}
```

### Order
```typescript
{
  orderNumber: String (unique),
  orderType: "delivery" | "pos",
  client: ObjectId (Client),
  createdBy: ObjectId (User),
  assignedAgent: ObjectId (User),
  items: [{
    itemId, itemName, quantity, unitPrice,
    subtotal, expiryDate, isBackorder
  }],
  subtotal: Number,
  discount: Number,
  totalAmount: Number,
  paidAmount: Number,
  dueAmount: Number,
  paymentStatus: "pending" | "partial" | "fully_paid" | "borrow",
  orderStatus: "created" | "assigned" | "items_provided" | "completed" | "backorder",
  payments: [{amount, method, recordedBy, recordedAt, notes}],
  isBackorderComplete: Boolean,
  timestamps
}
```

### Alert
```typescript
{
  type: "low_stock" | "out_of_stock" | "expiring_soon" | "expired" | "backorder_pending",
  itemId: ObjectId,
  orderId: ObjectId,
  message: String,
  severity: "warning" | "urgent",
  seenByOwner: Boolean,
  seenBySalesPerson: Boolean,
  resolved: Boolean,
  timestamps
}
```

---

## ✨ Key Features

### ✅ Completed
- [x] User authentication with JWT
- [x] Role-based access control (RBAC)
- [x] Order creation with stock validation
- [x] Backorder management
- [x] Payment recording (full/partial/borrow)
- [x] Client dues tracking
- [x] Alert system (low stock, expiry, etc.)
- [x] Comprehensive reports
- [x] Database seeders with test data
- [x] Frontend service layer
- [x] Route guards and interceptors

### 🚧 To Implement
- [ ] Login/Dashboard pages (UI)
- [ ] Create Order page (UI)
- [ ] POS page (UI)
- [ ] Order List/Detail pages (UI)
- [ ] Delivery Agent workflow (UI)
- [ ] Reports Dashboard (UI)
- [ ] Alert notifications (UI)
- [ ] Background cron jobs (Email alerts)
- [ ] File upload for profile pictures
- [ ] Offline support (Service Workers)
- [ ] Android/iOS app build

---

## 📚 Development Guide

### Adding a New Endpoint

**Backend Example: New Report API**

1. Create controller in `Api/modules/report/report.routes.ts`
2. Add model methods if needed in `Api/models/`
3. Export routes in `BaseRoutes/routes.close.ts`

```typescript
// report.routes.ts
router.get("/custom", requireRole(["owner"]), async (req, res) => {
  try {
    const data = await Order.find({...});
    return successResponse(res, data);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});
```

4. Call from frontend `api.service.ts`

```typescript
getCustomReport(): Observable<any> {
  return this.http.get(`${this.apiUrl}/reports/custom`);
}
```

### Adding a New Page Component

```bash
# Generate standalone component
ng generate component pages/my-page --standalone

# Or manually create
mkdir src/app/pages/my-page
touch src/app/pages/my-page/my-page.component.ts
touch src/app/pages/my-page/my-page.component.html
touch src/app/pages/my-page/my-page.component.scss
```

```typescript
// my-page.component.ts
import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";

@Component({
  selector: "app-my-page",
  template: `<ion-content>...</ion-content>`,
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class MyPageComponent implements OnInit {
  constructor(private api: ApiService) {}

  ngOnInit() {
    // Initialize
  }
}
```

### Environment Variables

**Backend (.env.development)**
```env
NODE_ENV=development
PORT=5000
DB_CONNECT_DEV=mongodb://localhost:27017/medstore
JWT_SECRET=medstore_secret_key_2024_development
JWT_EXPIRE=7d
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:8100
```

**Frontend (hardcoded for now, move to environment files)**
```typescript
// src/app/services/api.service.ts
private apiUrl = "http://localhost:5000/api";
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Check MongoDB connection
mongod --version

# Check .env file exists and is correct
cat backend/.env.development
```

### Frontend Won't Compile
```bash
# Clear cache and reinstall
rm -rf frontend/node_modules package-lock.json
npm install

# Check TypeScript version
ng version
```

### Database Connection Error
```typescript
// backend/index.ts
// Check MONGO_URL is correct
console.log("Connecting to:", this.getMongoDbUrl());
```

---

## 📞 Support

For issues or questions:
1. Check existing database seeders for examples
2. Review TypeScript interfaces in `Api/Interface/`
3. Check error logs in terminal

---

## 📄 License

Project licensed for MedStore B2B.

---

**Happy coding! 🚀 Build with MedStore**
