import logging
import threading
from typing import Callable

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.project import Project
from app.models.testcase import TestCase
from app.services.test_generator import generate_test_cases

logger = logging.getLogger(__name__)


def process_project_generation(project_id: int) -> None:
    """Background worker: generate test cases and update project status."""
    db: Session = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            logger.error("Project %s not found for generation", project_id)
            return

        project.status = "processing"
        db.commit()

        generated = generate_test_cases(project.input_data)

        for tc in generated:
            db.add(
                TestCase(
                    project_id=project.id,
                    title=tc.title,
                    description=tc.description,
                    expected_outcome=tc.expected_outcome,
                )
            )

        project.status = "completed"
        db.commit()
        logger.info("Generated %d test cases for project %s", len(generated), project_id)
    except Exception:
        logger.exception("Failed to generate test cases for project %s", project_id)
        try:
            project = db.query(Project).filter(Project.id == project_id).first()
            if project:
                project.status = "failed"
                db.commit()
        except Exception:
            logger.exception("Failed to update project status to failed")
    finally:
        db.close()


def enqueue_generation(project_id: int) -> None:
    """Enqueue test generation as a background thread (MVP job queue)."""
    thread = threading.Thread(
        target=process_project_generation,
        args=(project_id,),
        daemon=True,
        name=f"gen-project-{project_id}",
    )
    thread.start()


def run_sync_generation(project_id: int) -> None:
    """Synchronous generation for testing."""
    process_project_generation(project_id)
