from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.testcase import TestCase
from app.models.user import User
from app.schemas.project import ExportResponse, TestCaseResponse, TestCaseUpdate
from app.services.auth import get_current_user

router = APIRouter(tags=["testcases"])


def _get_owned_testcase(testcase_id: int, user: User, db: Session) -> TestCase:
    tc = db.query(TestCase).filter(TestCase.id == testcase_id).first()
    if not tc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "TestCaseNotFound", "message": f"Test case {testcase_id} not found"},
        )
    project = db.query(Project).filter(Project.id == tc.project_id).first()
    if not project or (project.user_id != user.id and user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Cannot access another user's test case"},
        )
    return tc


@router.get("/api/projects/{project_id}/testcases", response_model=list[TestCaseResponse])
def list_testcases(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "ProjectNotFound", "message": f"Project {project_id} not found"},
        )
    if project.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Cannot access another user's test cases"},
        )
    return [TestCaseResponse.model_validate(tc) for tc in project.test_cases]


@router.get("/api/testcases/{testcase_id}", response_model=TestCaseResponse)
def get_testcase(
    testcase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tc = _get_owned_testcase(testcase_id, current_user, db)
    return TestCaseResponse.model_validate(tc)


@router.put("/api/testcases/{testcase_id}", response_model=TestCaseResponse)
def update_testcase(
    testcase_id: int,
    payload: TestCaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tc = _get_owned_testcase(testcase_id, current_user, db)
    if payload.title is not None:
        tc.title = payload.title
    if payload.description is not None:
        tc.description = payload.description
    if payload.expected_outcome is not None:
        tc.expected_outcome = payload.expected_outcome
    db.commit()
    db.refresh(tc)
    return TestCaseResponse.model_validate(tc)


@router.delete("/api/testcases/{testcase_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testcase(
    testcase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tc = _get_owned_testcase(testcase_id, current_user, db)
    db.delete(tc)
    db.commit()


@router.get("/api/projects/{project_id}/export")
def export_testcases(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "ProjectNotFound", "message": f"Project {project_id} not found"},
        )
    if project.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Cannot export another user's project"},
        )

    export_data = ExportResponse(
        project_id=project.id,
        project_name=project.name,
        test_cases=[TestCaseResponse.model_validate(tc) for tc in project.test_cases],
        exported_at=datetime.now(timezone.utc),
    )
    return JSONResponse(
        content=export_data.model_dump(mode="json"),
        headers={"Content-Disposition": f'attachment; filename="testcases-{project_id}.json"'},
    )
