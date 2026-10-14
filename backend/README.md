# ShopSphere - Spring Boot 3 Java Backend

Welcome to the backend service for **ShopSphere Classic E-Commerce**. This is a modern, modular, production-ready Spring Boot 3 application supporting MySQL database persistence, Spring Security stateless setup, OpenAPI/Swagger documentation, and clean DTO-layered architecture.

---

## 🛠️ Tech Stack & Dependencies

- **Language & Runtime**: Java 17+ (Tested on OpenJDK 21)
- **Framework**: Spring Boot 3.2.4
- **Modules**:
  - `Spring Web` (RESTful Web Services)
  - `Spring Data JPA` (ORM & Data Access Layer)
  - `Spring Security` (Stateless security setup, BCrypt Password Hashing)
  - `Spring Validation` (Bean validation & constraints)
  - `MySQL Connector/J` (MySQL Database Driver)
  - `Lombok` (Boilerplate reduction annotations)
  - `SpringDoc OpenAPI 2.5` (Interactive Swagger UI documentation)
- **Port**: `8080`

---

## 🗄️ Database Setup (MySQL)

1. Open your MySQL client (MySQL Workbench, MySQL CLI, or DBeaver) and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS shopsphere;
   ```
2. By default, `application.properties` connects to:
   - **Host & Port**: `localhost:3306`
   - **Database**: `shopsphere`
   - **Username**: `root` (Default, overridable via `DB_USERNAME` env var)
   - **Password**: `root` (Default, overridable via `DB_PASSWORD` env var)

   *Example with custom environment variables:*
   ```bash
   # Linux/macOS
   export DB_USERNAME=myuser
   export DB_PASSWORD=mypassword

   # Windows PowerShell
   $env:DB_USERNAME="myuser"
   $env:DB_PASSWORD="mypassword"
   ```

---

## 🚀 How to Run the Backend

Navigate to the `backend` project root directory:

```bash
cd backend
```

Run the Spring Boot application using Maven:

```bash
# Standard Maven Command
mvn spring-boot:run
```

> **Note**: On startup, `DataInitializer` will automatically seed the MySQL database with:
> - 1 Admin (`admin@shopsphere.com` / `Admin@123`)
> - 2 Sellers (`seller1@shopsphere.com` / `Seller@123`, `seller2@shopsphere.com` / `Seller@123`)
> - 2 Buyers (`buyer1@shopsphere.com` / `Buyer@123`, `buyer2@shopsphere.com` / `Buyer@123`)
> - 5 Categories (`Tech & Gadgets`, `Fashion & Apparel`, `Home & Living`, `Beauty & Care`, `Sports & Travel`)
> - 20 Detailed products matching the frontend datastore with Inventory stock tracking.

---

## 📖 API Documentation & Swagger UI

Once the backend server is running on port 8080, open your browser to access the interactive Swagger UI:

👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**
or **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

OpenAPI JSON Spec endpoint:
👉 `http://localhost:8080/v3/api-docs`

---

## 🔌 Verification Read-Only Endpoints

### 1. GET `/api/categories`
- **Description**: Returns all 5 product categories along with active product counts.
- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Categories retrieved successfully",
    "data": [
      {
        "id": 1,
        "name": "Tech & Gadgets",
        "slug": "tech",
        "description": "Headphones, Smartwatches, Audio & Tech Accessories",
        "icon": "fa-solid fa-laptop",
        "productCount": 4
      }
    ],
    "timestamp": "2026-10-09T10:45:00"
  }
  ```

### 2. GET `/api/products`
- **Description**: Returns active products. Supports optional filtering by `category` slug and `search` keyword.
- **Query Parameters**:
  - `category` (optional, e.g. `tech`, `fashion`, `home`, `beauty`, `sports`)
  - `search` (optional, e.g. `Headphones`, `Leather`, `Serum`)
- **Examples**:
  - `http://localhost:8080/api/products`
  - `http://localhost:8080/api/products?category=tech`
  - `http://localhost:8080/api/products?search=wireless`
  - `http://localhost:8080/api/products?category=fashion&search=watch`
