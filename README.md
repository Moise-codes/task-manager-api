# 📝 Task-Manager-API

[![Node.js](https://img.shields.io/badge/Node.js-v14+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Framework: Express](https://img.shields.io/badge/Framework-Express%205.x-lightgrey)](https://expressjs.com/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A robust, production-ready RESTful API designed to handle task orchestration. This backend service provides secure user authentication and full CRUD capabilities for managing personal and team productivity.

---

## 👨‍💻 Developed By
**Yehovayire Moise** *Backend Engineer | Kigali, Rwanda*

> "Complexity is the enemy of execution. This API is built for simplicity and scale."

---

## 🔥 Key Technical Features

* **🔒 Secure Authentication:** Implemented using **JSON Web Tokens (JWT)** and **BcryptJS** for industry-standard password hashing and stateless session management.
* **🏗️ Modern Middleware:** Built on the latest **Express 5.x** for improved error handling and asynchronous routing.
* **📊 Object Modeling:** Leveraging **Mongoose 9.x** for elegant MongoDB schema validation and data integrity.
* **🛡️ Environment Privacy:** Managed via `dotenv` to ensure sensitive credentials (API keys, DB strings) stay out of source control.
* **🚀 Development Workflow:** Integrated with `nodemon` for instant hot-reloading during the development cycle.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (CommonJS)
* **Web Framework:** Express.js
* **Database:** MongoDB & Mongoose
* **Security:** JWT, BcryptJS
* **Environment:** Dotenv

---

## 🚀 Installation & Setup

### 1. Clone & Install
```bash
git clone [https://github.com/Moise-codes/task-manager-api.git](https://github.com/Moise-codes/task-manager-api.git)
cd task-manager-api
npm install
2. Environment Configuration
Create a .env file in the root directory and add your configuration:

Code snippet
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
3. Running the API
The project is configured for a seamless development experience.

Development Mode:

Bash
npm run dev
Production Mode:

Bash
npm start
📁 Project Architecture
Plaintext
task-manager-api/
├── config/          # Database & Environment configurations
├── controllers/     # Request handlers & Business logic
├── middleware/      # Auth & Error handling layers
├── models/          # Mongoose Schemas (User, Task)
├── routes/          # API route definitions
├── index.js         # Entry point
└── .env             # Environment variables (Private)
