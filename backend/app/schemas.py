from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from app.models import UserRole, ComplaintStatus

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ComplaintBase(BaseModel):
    title: str
    description: str
    category: str
    image_url: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    pass

class AdminRemark(BaseModel):
    id: int
    remark: str
    created_at: datetime
    admin_id: int

    class Config:
        from_attributes = True

class Complaint(ComplaintBase):
    id: int
    status: ComplaintStatus
    created_at: datetime
    updated_at: datetime
    user_id: int
    remarks: List[AdminRemark] = []

    class Config:
        from_attributes = True

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    remark: Optional[str] = None
