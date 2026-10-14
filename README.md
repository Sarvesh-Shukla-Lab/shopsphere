# ShopSphere - Classic Premium Multi-Vendor E-Commerce Platform

A production-grade, full-stack multi-vendor e-commerce platform built with **Spring Boot 3 (REST API)**, **MySQL 8.0**, and a **Modern Vanilla JavaScript & CSS Design System** frontend.

---

## 🌟 Key Highlights & Features

### 👤 Role-Based Authentication & User Profiles
- **Three Core Roles:** `BUYER`, `SELLER`, and `ADMIN`.
- **JWT (JSON Web Token) Security:** Stateless authentication with token-based access control.
- **Profile Photo Upload:** Direct device photo upload for user profile avatars with real-time preview and dynamic header/navbar/mobile drawer synchronization.
- **Role Badges:** Context-aware navigation and dashboards tailored to each authenticated role.

### 🏬 Seller (Merchant) Ecosystem
- **Merchant Onboarding:** Seller registration capturing Store Name, GSTIN, and business description.
- **Seller Dashboard:**
  - Real-time inventory metrics (Total Products, Stock Levels, Sales Overview).
  - Monthly Sales Performance bar chart.
- **7-Photo Product Listing System:**
  - Multi-photo uploader supporting up to 7 photos per product via drag-and-drop or file selection.
  - Slot 1 designated as compulsory Cover Photo with real-time thumbnail preview and delete controls.
  - Direct local file upload encoded seamlessly for high-resolution storage (`MEDIUMTEXT`).

### 🛍️ Shopper (Buyer) Experience
- **Interactive Product Catalog:** Category filtering, search, sorting (price, rating, new arrivals), and responsive grid.
- **Product Detail Gallery:** Multi-image thumbnail slider with zoom and dynamic stock availability badges.
- **Shopping Cart & Slide Drawer:** Real-time subtotal calculation, free shipping progress bar, and delivery estimation.
- **Coupon & Discount Engine:** Validation and application of flat/percentage discount codes.
- **Checkout & Order Processing:** Multi-step order flow with shipping address management.
- **Order History & Tracking:** Timeline-based order status (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`).
- **Wishlist & Browsing History:** Buyer interaction tracking and instant wishlist toggles.

### 🛡️ Admin Management Panel
- **User & Seller Governance:** Account activation, status review, and merchant approval workflows.
- **Platform Inventory Oversight:** Global product management and category management.
- **Order Monitoring:** Platform-wide order status tracking and fulfillment updates.
- **Audit & Activity Logs:** System event tracking for platform accountability.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Modern Design System, CSS Variables), JavaScript (ES6+ Fetch API, Services Architecture), FontAwesome 6 |
| **Backend** | Java 17/21, Spring Boot 3.2.4, Spring Security, JWT (JJWT), Spring Data JPA / Hibernate |
| **Database** | MySQL 8.0 (`InnoDB`, UTF-8, pure normalized relational schema) |
| **Build & Tooling** | Apache Maven, Node.js (`serve`) |

---

## 📁 Repository Structure

```
shopsphere/
├── assets/                     # Platform images and visual assets
├── services/                   # Modular frontend client services
│   ├── adminService.js         # Admin panel API client
│   ├── cartService.js          # Cart state and calculations
│   ├── couponService.js        # Discount & promo code service
│   ├── orderService.js         # Order placement and tracking
│   └── productService.js       # Product inventory, cache, and filtering
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/...       # Controllers, Services, Repositories, Entities, Security
│   ├── src/main/resources/     # application.properties & static assets
│   ├── pom.xml                 # Maven dependencies and build definition
│   └── README.md               # Backend specific documentation
├── api.js                      # Central REST API Fetch wrapper
├── auth.js                     # Client-side AuthStore and token management
├── data.js                     # Fallback product catalog & category definitions
├── index.html                  # Single-Page Application (SPA) entrypoint
├── script.js                   # Application UI engine & event orchestrator
├── style.css                   # Responsive design system & styles
├── schema.sql                  # MySQL database schema (Pure DDL, no fake data)
├── admin_queries.sql           # Query templates for administration and reports
├── package.json                # Frontend dev server scripts
└── .gitignore                  # Git ignore rules for node_modules, target, logs
```

---

## 🚀 Getting Started

### Prerequisites
- **Java Development Kit (JDK 17 or higher)**
- **Apache Maven**
- **MySQL Server 8.0**
- **Node.js (v18 or higher)**

---

### Step 1: Database Setup
1. Open **MySQL Workbench** or your MySQL command line.
2. Execute the `schema.sql` file located in the root directory:
   ```sql
   SOURCE path/to/shopsphere/schema.sql;
   ```
   *This creates all 15 relational tables with safe `IF NOT EXISTS` guards and `MEDIUMTEXT` photo columns.*

---

### Step 2: Configure & Run Backend
1. Open `backend/src/main/resources/application.properties` and verify your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/shopsphere_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
2. Navigate to the `backend` directory and start the application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. The Spring Boot REST API will start on: **`http://localhost:8080`**

---

### Step 3: Run Frontend
1. Open a new terminal in the `shopsphere` root directory:
   ```bash
   npm install
   npm start
   ```
2. Access the store in your browser at: **`http://localhost:3000`**

---

## 🔒 Security Best Practices
- Passwords are encrypted using **BCrypt**.
- Authenticated endpoints validate bearer tokens via `JwtAuthenticationFilter`.
- Sensitive database fields and file uploads enforce strict validation.
- Clean `.gitignore` ensures credentials, build artifacts (`target/`), and `node_modules/` are never committed to version control.

---

## 📄 License
This project is open-source and available under the **ISC License**.
