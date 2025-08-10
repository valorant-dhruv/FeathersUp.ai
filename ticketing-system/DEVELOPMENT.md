# Development Guide

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Clone and navigate to project
cd FeathersUp.ai/ticketing-system

# Run the setup script
./start.sh
```

### 2. Development Commands

#### Start Both Servers (Recommended)
```bash
npm run dev
```

#### Start Individual Servers
```bash
# Backend only (API server)
npm run dev:backend

# Frontend only (React app)
npm run dev:frontend
```

#### Database Operations
```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

#### Docker Operations
```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# Restart services
npm run docker:restart
```

## 📁 Project Structure

```
ticketing-system/
├── backend/                 # Node.js/Express API
│   ├── src/               # Source code
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── migrations/        # Database migrations
│   ├── package.json       # Backend dependencies
│   └── .env              # Backend environment variables
├── frontend/              # React application
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── package.json      # Frontend dependencies
├── docker-compose.yml     # Docker services
├── package.json          # Root scripts
└── start.sh              # Setup script
```

## 🔧 Development Workflow

### Backend Development
1. **Navigate to backend**: `cd backend`
2. **Install dependencies**: `npm install`
3. **Set environment**: `cp env.example .env`
4. **Start server**: `npm run dev`

### Frontend Development
1. **Navigate to frontend**: `cd frontend`
2. **Install dependencies**: `npm install`
3. **Start app**: `npm start`

### Database Changes
1. **Create migration**: `cd backend && npx sequelize-cli migration:generate --name migration_name`
2. **Run migration**: `npm run db:migrate`
3. **Seed data**: `npm run db:seed`

## 🌐 Ports

- **Backend API**: http://localhost:3000
- **Frontend App**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **PgAdmin**: http://localhost:5050

## 📝 Environment Variables

### Backend (.env in backend folder)
```env
DB_NAME=feathersup_ticketing
DB_USER=feathersup_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (.env in frontend folder)
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## 🐛 Troubleshooting

### Rate Limiting
If you get "Too many requests" errors:
1. Wait 15 minutes for rate limit to reset
2. Or create `.env` in backend with more generous limits:
   ```env
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=1000
   ```

### Database Connection Issues
1. Check if PostgreSQL is running: `docker ps`
2. Restart database: `npm run docker:restart`
3. Check environment variables in backend/.env

### Port Conflicts
1. Check if ports 3000, 3001, 5432, 5050 are available
2. Kill conflicting processes or change ports in configuration 