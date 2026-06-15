# AI-Powered Test Case Generation Web App

A full-stack web application that automatically generates software test cases using intelligent analysis. Built for developers and QA engineers to accelerate testing, improve test coverage, and maintain code quality.

## 🎯 Features

- **User Authentication** - Secure register, login, logout with JWT tokens
- **Code & Spec Submission** - Submit source code or textual specifications via text area
- **AI Test Generation** - Intelligent analysis generates comprehensive test cases
- **Results Management** - View, edit, update, and delete generated test cases
- **Export Functionality** - Download test cases as JSON for integration
- **Project Dashboard** - Manage all projects with status tracking and history
- **Admin Dashboard** - View usage statistics and system metrics (admin only)
- **Role-based Access Control** - User and admin roles with permission-based features

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router 7, Lucide Icons |
| **Backend** | FastAPI (0.115.6), Python 3.11 |
| **Database** | PostgreSQL with SQLAlchemy ORM |
| **Cache/Queue** | Redis for caching and future async job processing |
| **Authentication** | JWT (python-jose), bcrypt password hashing (passlib) |
| **Testing** | pytest (backend), vitest (frontend) |
| **Deployment** | Docker, Docker Compose, Nginx reverse proxy |

## 🏗️ Project Structure

```
AI-powered-Test-Case-Generation-Web-App/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/              # HomePage, AuthPages, DashboardPage, ProjectPage, AdminPage
│   │   ├── components/         # Reusable React components
│   │   ├── services/           # API client services
│   │   ├── context/            # React context for state management
│   │   └── types/              # TypeScript type definitions
│   ├── vite.config.ts          # Vite configuration with API proxy
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── package.json
│   └── Dockerfile              # Multi-stage build for nginx serving
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── routers/            # API endpoints (auth, projects, testcases, users, admin)
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic services
│   │   ├── config.py           # Configuration management
│   │   ├── database.py         # Database connection setup
│   │   └── main.py             # FastAPI application entry point
│   ├── tests/                  # Pytest test suite
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variables template
│   └── Dockerfile              # FastAPI container
└── docker-compose.yml          # Multi-container orchestration

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────┐        ┌──────────────────────┐   │
│  │  React Frontend     │        │  Nginx Reverse       │   │
│  │  (Port 5173/3000)   │◀──────│  Proxy (Port 80)     │   │
│  └──────────┬──────────┘        └──────────────────────┘   │
│             │                                               │
│             │ HTTP Requests                                 │
│             │ (API proxied to :8000)                        │
│             ▼                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          FastAPI Backend (Port 8000)                │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ Routers: auth, projects, testcases, admin   │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│             │                                               │
│             │ SQL Queries                                  │
│             ▼                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │      PostgreSQL Database (Port 5432)                │  │
│  │  Tables: User, Project, TestCase                   │  │
│  └─────────────────────────────────────────────────────┘  │
│             │                                               │
│             ▼                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Redis Cache (Port 6379)                     │  │
│  │  For caching and future async job processing       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Model

```
USER (id, name, email, passwordHash, role)
  │
  └──creates──▶ PROJECT (id, userId, name, inputData, status, createdAt, updatedAt)
                  │
                  └──contains──▶ TESTCASE (id, projectId, title, description, expectedOutcome, status, createdAt, updatedAt)
```

- **User**: Represents registered users with authentication credentials and role-based access
- **Project**: Contains submitted code/specifications with generation status
- **TestCase**: Individual test cases generated for each project

## 🚀 Quick Start

### Prerequisites

Choose one option:
- **Option 1 (Recommended):** Docker and Docker Compose
- **Option 2:** Node.js 20+, Python 3.11+, PostgreSQL, Redis

### Run with Docker (Recommended)

```bash
cd C:\Users\aklil\Documents\GitHub\AI-powered-Test-Case-Generation-Web-App
docker compose up --build
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database: localhost:5432 (postgres/postgres)
- Redis: localhost:6379

### Local Development

**Terminal 1 - Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs at **http://localhost:5173** with API proxy to port 8000.


## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login, returns JWT |
| POST | `/api/logout` | Logout |
| GET | `/api/users/me` | Current user profile |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project & trigger generation |
| GET | `/api/projects/:id` | Project details with test cases |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/regenerate` | Regenerate test cases |
| GET | `/api/projects/:id/testcases` | List test cases |
| PUT | `/api/testcases/:id` | Update test case |
| DELETE | `/api/testcases/:id` | Delete test case |
| GET | `/api/projects/:id/export` | Export as JSON |
| GET | `/api/admin/stats` | Admin usage stats |
| GET | `/health` | Health check |

## Testing

```bash
# Backend
cd backend && pytest -v

# Frontend build
cd frontend && npm run build
```

## Security

- Passwords hashed with bcrypt
- JWT authentication on protected endpoints
- Input validation via Pydantic schemas
- CORS configured for allowed origins
- Users can only access their own data
- Structured error responses without stack traces

## License

MIT
