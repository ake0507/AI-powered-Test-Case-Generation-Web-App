from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.database as database_module
import app.services.job_queue as job_queue_module
from app.database import Base, get_db
from app.main import app
from app.services.test_generator import generate_test_cases

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session, monkeypatch):
    monkeypatch.setattr(database_module, "engine", engine)
    monkeypatch.setattr(database_module, "SessionLocal", TestingSessionLocal)
    monkeypatch.setattr(job_queue_module, "SessionLocal", TestingSessionLocal)

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_and_login(client):
    register = client.post(
        "/api/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "password123"},
    )
    assert register.status_code == 201
    assert "access_token" in register.json()

    login = client.post(
        "/api/login",
        json={"email": "alice@example.com", "password": "password123"},
    )
    assert login.status_code == 200
    assert login.json()["user"]["email"] == "alice@example.com"


def test_create_project_requires_auth(client):
    response = client.post(
        "/api/projects",
        json={"name": "Login Feature", "input_data": "def login(user, password): pass"},
    )
    assert response.status_code in (401, 403)


def test_full_project_flow(client):
    reg = client.post(
        "/api/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "password123"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create = client.post(
        "/api/projects",
        headers=headers,
        json={
            "name": "Auth Module",
            "input_data": "def authenticate(email, password):\n    return True\n\ndef logout():\n    pass",
        },
    )
    assert create.status_code == 201
    project_id = create.json()["id"]

    import time
    for _ in range(30):
        detail = client.get(f"/api/projects/{project_id}", headers=headers)
        if detail.json()["status"] == "completed":
            break
        time.sleep(0.1)

    detail = client.get(f"/api/projects/{project_id}", headers=headers)
    assert detail.json()["status"] == "completed"
    assert len(detail.json()["test_cases"]) > 0


def test_create_project_with_empty_uploaded_file_returns_bad_request(client):
    reg = client.post(
        "/api/register",
        json={"name": "Carol", "email": "carol@example.com", "password": "password123"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/projects",
        headers=headers,
        data={"name": "Empty Spec", "input_data": ""},
        files={"file": ("empty.txt", b"", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"]["error"] == "EmptyFile"
    assert "readable text" in response.json()["detail"]["message"]


def test_test_generator_extracts_functions():
    code = "def add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b"
    cases = generate_test_cases(code)
    titles = [c.title for c in cases]
    assert any("add" in t for t in titles)
    assert any("subtract" in t for t in titles)


def test_test_generator_empty_input():
    cases = generate_test_cases("")
    assert len(cases) >= 1
