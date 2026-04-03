# SkillSwap Hub

> A Peer-to-Peer Skill Exchange and Collaboration Platform

## Tech Stack
- **Frontend:** React.js, React Router v6, Axios, Socket.IO Client
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT (JSON Web Tokens) + bcryptjs
- **Payment:** Razorpay (Test Mode)

## Project Structure

```
skillswap-hub/
├── server/                     # Express.js Backend
│   ├── index.js                # Entry point (Express + Socket.IO)
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── Request.js
│   │   ├── Session.js
│   │   ├── Review.js
│   │   ├── Message.js
│   │   └── Payment.js
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── skillController.js
│   │   ├── requestController.js
│   │   ├── reviewController.js
│   │   ├── paymentController.js
│   │   └── adminController.js
│   ├── routes/                 # API route definitions
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── skills.js
│   │   ├── requests.js
│   │   ├── sessions.js
│   │   ├── reviews.js
│   │   ├── payments.js
│   │   ├── chat.js
│   │   └── admin.js
│   └── middleware/
│       └── auth.js             # JWT protect + adminOnly
│
└── client/                     # React.js Frontend
    └── src/
        ├── App.js              # Routes + Auth guards
        ├── context/
        │   └── AuthContext.js  # Global auth state
        ├── utils/
        │   └── api.js          # Axios instance + API calls
        ├── pages/              # Route-level page components
        ├── components/         # Reusable UI components
        │   ├── Auth/
        │   ├── Skills/
        │   ├── Search/
        │   ├── Bookings/
        │   ├── Chat/
        │   ├── Reviews/
        │   ├── Payment/
        │   ├── Admin/
        │   └── Shared/
        └── styles/
```

## Modules Implemented

| # | Module              | Status   |
|---|---------------------|----------|
| 1 | Authentication      | Complete |
| 2 | User Profile        | Complete |
| 3 | Skill Listing       | Complete |
| 4 | Search & Filter     | Complete |
| 5 | Skill Request/Booking| Complete|
| 6 | Chat (Socket.IO)    | Complete |
| 7 | Ratings & Reviews   | Complete |
| 8 | Payment (Razorpay)  | Complete |
| 9 | Admin Dashboard     | Complete |

## Database Collections

| Collection | Purpose |
|------------|---------|
| users      | User accounts, profiles, roles |
| skills     | Skill listings with categories |
| requests   | Skill swap requests between users |
| sessions   | Confirmed bookings/sessions |
| reviews    | Post-session ratings and feedback |
| messages   | Chat messages (per room) |
| payments   | Premium plan payment records |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login    | Login, returns JWT |
| GET  | /api/auth/me       | Get current user (protected) |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/skills             | List all skills (search, filter, paginate) |
| GET    | /api/skills/:id         | Get single skill |
| POST   | /api/skills             | Create skill (protected) |
| PUT    | /api/skills/:id         | Update skill (owner only) |
| DELETE | /api/skills/:id         | Soft delete skill (owner only) |

### Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/requests           | Send swap request |
| GET    | /api/requests/my        | My incoming + outgoing requests |
| PATCH  | /api/requests/:id/status| Accept or reject request |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/sessions/my        | My upcoming and past sessions |
| PATCH  | /api/sessions/:id/complete | Mark session complete |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/reviews            | Submit review after session |
| GET    | /api/reviews/user/:id   | Get all reviews for a user |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/payments/order     | Create Razorpay order |
| POST   | /api/payments/verify    | Verify payment + activate premium |

### Admin (admin role only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/admin/dashboard       | Stats overview |
| GET    | /api/admin/users           | All users list |
| PATCH  | /api/admin/users/:id/toggle| Suspend/activate user |
| GET    | /api/admin/payments        | All payment records |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/chat/:roomId       | Get message history |
| POST   | /api/chat               | Save a message |

## Setup & Installation

### Prerequisites
- Node.js 
- MongoDB (local or MongoDB Atlas)
- Razorpay test account (free at razorpay.com)

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env and fill in your values
```

### 3. Run the App

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm start
```

App runs at: http://localhost:3000
API runs at: http://localhost:5000

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| join_room | Client → Server | Join a chat room |
| send_message | Client → Server | Send a message |
| receive_message | Server → Client | Broadcast message to room |
| user_typing | Client → Server | Typing indicator |

## Razorpay Test Mode

Use these test card details for payment:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: 1234 (if prompted)
