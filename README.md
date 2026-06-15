# AI-Powered Test Case Generation Web App

An MVP full-stack web application that automatically generates software test cases from source code or specifications using intelligent analysis. Built for developers and QA engineers to accelerate testing, improve coverage, and maintain quality.

## Features

- **User Authentication** - Register, login, logout with JWT tokens
- **Code Submission** - Submit code or textual specifications via text area
- **AI Test Generation** - Asynchronous background processing analyzes input and generates test cases
- **Results Management** - View, edit, and delete generated test cases
- **Export** - Download test cases as JSON
- **Dashboard** - List all projects with status tracking
- **Admin Dashboard** - Usage statistics (admin role)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Cache/Queue | Redis (configured for future scaling) |
| Auth | JWT (python-jose), bcrypt password hashing |
| Deployment | Docker, Docker Compose, Nginx |

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   React     │────▶│   FastAPI   │────▶│  PostgreSQL  │
│   Frontend  │     │   Backend   │     │   Database   │
└─────────────┘     └──────┬──────┘     └──────────────┘
                           │
                    ┌──────▼──────┐
                    │  Background │
                    │  Job Worker │
                    │ (Test Gen)  │
                    └─────────────┘
```

### Data Model

```
USER ──creates──▶ PROJECT ──contains──▶ TESTCASE
```

- **User**: id, name, email, passwordHash, role
- **Project**: id, userId, name, inputData, status, timestamps
- **TestCase**: id, projectId, title, description, expectedOutcome, timestamps

## Quick Start

### Prerequisites

- Docker and Docker Compose
- OR: Node.js 20+, Python 3.11+, PostgreSQL

### Run with Docker (Recommended)

```bash
docker compose up --build
```



### Local Development

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Start PostgreSQL locally, then:
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```


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
