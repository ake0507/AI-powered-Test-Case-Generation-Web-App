from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    input_data: str = Field(..., min_length=1)


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    name: str
    input_data: str
    status: str
    created_at: datetime
    updated_at: datetime
    test_case_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    test_cases: list["TestCaseResponse"] = []


class TestCaseResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str
    expected_outcome: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestCaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = Field(None, min_length=1)
    expected_outcome: Optional[str] = Field(None, min_length=1)


class ExportResponse(BaseModel):
    project_id: int
    project_name: str
    test_cases: list[TestCaseResponse]
    exported_at: datetime
