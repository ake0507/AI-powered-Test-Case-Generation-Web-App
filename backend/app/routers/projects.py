from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectDetailResponse, ProjectResponse, TestCaseResponse
from app.services.auth import get_current_user
from app.services.file_parser import extract_text_from_file
from app.services.job_queue import enqueue_generation

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _project_response(project: Project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        user_id=project.user_id,
        name=project.name,
        input_data=project.input_data,
        status=project.status,
        created_at=project.created_at,
        updated_at=project.updated_at,
        test_case_count=len(project.test_cases),
    )


def _get_owned_project(project_id: int, user: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "ProjectNotFound", "message": f"Project {project_id} not found"},
        )
    if project.user_id != user.id and user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Cannot access another user's project"},
        )
    return project


@router.get("", response_model=list[ProjectResponse])
def list_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )
    return [_project_response(p) for p in projects]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        name = form.get("name")
        input_data = form.get("input_data") or ""
        file = form.get("file")

        if name is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error": "MissingName", "message": "Project name is required."},
            )

        if file and isinstance(file, UploadFile):
            extracted = await extract_text_from_file(file)
            if input_data:
                input_data = f"{input_data}\n\n{extracted}"
            else:
                input_data = extracted

        payload = ProjectCreate(name=name, input_data=str(input_data))
    else:
        payload = ProjectCreate.model_validate(await request.json())

    project = Project(
        user_id=current_user.id,
        name=payload.name,
        input_data=payload.input_data,
        status="pending",
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    enqueue_generation(project.id)
    return _project_response(project)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned_project(project_id, current_user, db)
    return ProjectDetailResponse(
        **_project_response(project).model_dump(),
        test_cases=[TestCaseResponse.model_validate(tc) for tc in project.test_cases],
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned_project(project_id, current_user, db)
    db.delete(project)
    db.commit()


@router.post("/{project_id}/regenerate", response_model=ProjectResponse)
def regenerate_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _get_owned_project(project_id, current_user, db)
    for tc in list(project.test_cases):
        db.delete(tc)
    project.status = "pending"
    db.commit()
    db.refresh(project)
    enqueue_generation(project.id)
    return _project_response(project)
