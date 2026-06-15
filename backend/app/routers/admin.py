from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.testcase import TestCase
from app.models.user import User
from app.services.auth import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return {
        "users": db.query(func.count(User.id)).scalar(),
        "projects": db.query(func.count(Project.id)).scalar(),
        "test_cases": db.query(func.count(TestCase.id)).scalar(),
        "projects_by_status": {
            status: count
            for status, count in db.query(Project.status, func.count(Project.id)).group_by(Project.status).all()
        },
    }
