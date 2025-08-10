# FeathersUp Ticketing System

A full-stack ticketing system built with React frontend and Node.js/Express backend.

**Location**: This project is located in `FeathersUp.ai/ticketing-system/`

## 📁 Project Structure

```
ticketing-system/
├── backend/          # Node.js/Express backend API
│   ├── src/         # Source code
│   ├── migrations/  # Database migrations
│   └── package.json # Backend dependencies
├── frontend/        # React frontend application
│   ├── src/        # Source code
│   └── package.json # Frontend dependencies
└── docker-compose.yml # Docker services configuration
```

## 🚀 Features

- **User Management**: Authentication, authorization, and role-based access control
- **Ticket Management**: Create, update, and track support tickets
- **Comment System**: Internal and external communication on tickets
- **File Attachments**: Support for ticket attachments
- **Category Management**: Organized ticket categorization
- **Priority & Status Tracking**: Comprehensive ticket lifecycle management
- **RESTful API**: Clean and intuitive API endpoints
- **Security**: JWT authentication, rate limiting, and input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting
- **File Upload**: Multer

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Docker (optional, for easy database setup)

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Navigate to the ticketing system directory**
   ```bash
   cd FeathersUp.ai/ticketing-system
   ```

2. **Start the database**
   ```bash
   docker-compose up -d postgres
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Set up backend environment variables**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your database credentials
   cd ..
   ```

6. **Start the backend development server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server (in a new terminal)**
   ```bash
   cd frontend
   npm start
   ```

### Option 2: Manual PostgreSQL Setup

1. **Install PostgreSQL** on your system
2. **Create a database** named `feathersup_ticketing`
3. **Run the initialization script**:
   ```bash
   psql -U postgres -d feathersup_ticketing -f backend/init.sql
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feathersup_ticketing
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
```

### Database Access

- **PostgreSQL**: `localhost:5432`
- **PgAdmin**: `http://localhost:5050`
  - Email: `admin@feathersup.com`
  - Password: `admin123`

## 📁 Project Structure

```
ticketing-system/
├── src/
│   ├── config/          # Database and app configuration
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── models/          # Sequelize models (to be implemented)
│   ├── routes/          # API route definitions (to be implemented)
│   ├── utils/           # Utility functions and helpers
│   └── server.js        # Main application entry point
├── package.json          # Dependencies and scripts
├── docker-compose.yml    # Database setup
├── init.sql             # Database initialization
├── env.example          # Environment variables template
└── setup.sh             # Automated setup script
```

## 🗄️ Database Schema

The system includes the following main entities:

- **Users**: Authentication and role management
- **Tickets**: Support ticket management
- **Comments**: Ticket communication
- **Categories**: Ticket organization
- **Attachments**: File management

## 📚 API Endpoints

The following endpoints will be implemented:

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /users` - Get users (agent only)
- `GET /tickets` - Get tickets
- `POST /tickets` - Create ticket
- `PUT /tickets/:id` - Update ticket
- `GET /categories` - Get categories

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Scripts

```bash
npm run dev          # Start development server
npm start            # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database (drop, create, migrate)
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](../LICENSE) file in the project root for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is the backend structure setup. The actual models, routes, and business logic will be implemented in subsequent phases.

**Project Location**: `FeathersUp.ai/ticketing-system/`
