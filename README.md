# MyTaxi — Full Stack Admin Panel

## Stack
- **Frontend**: React 18 + Vite + React Router v6
- **Backend**: Node.js + Express.js + REST API
- **Database**: MongoDB + Mongoose

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET

# Start server (development)
npm run dev

# Seed database with sample data
npm run seed
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 3. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default Login
- Email: `admin@mytaxi.com`
- Password: `123456`

---

## Project Structure

```
mytaxi/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Business logic (17 controllers)
│   ├── middleware/     # Auth & error handling
│   ├── models/         # Mongoose models (14 models)
│   ├── routes/         # API routes (17 route files)
│   ├── seed/           # Database seeder
│   ├── .env.example
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/        # Axios API modules
    │   ├── components/ # Layout, Sidebar, Topbar, etc.
    │   ├── context/    # Auth context
    │   ├── hooks/      # useToast hook
    │   ├── pages/      # 17 page components
    │   ├── App.jsx     # React Router routes
    │   └── main.jsx    # Entry point
    └── vite.config.js  # Proxies /api → localhost:5000
```

## API Endpoints

| Module         | Base Path          |
|----------------|--------------------|
| Auth           | /api/auth          |
| Dashboard      | /api/dashboard     |
| Cab Bookings   | /api/bookings      |
| Intercity      | /api/intercity     |
| Parcel         | /api/parcel        |
| Rental         | /api/rental        |
| Customers      | /api/customers     |
| Drivers        | /api/drivers       |
| Employees      | /api/employees     |
| Finance        | /api/finance       |
| Support        | /api/support       |
| SOS Alerts     | /api/sos           |
| Zones & Fares  | /api/zones         |
| Subscriptions  | /api/subscriptions |
| Notifications  | /api/notifications |
| Coupons        | /api/coupons       |
| Settings       | /api/settings      |
