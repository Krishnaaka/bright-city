from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

Base = declarative_base()

class UserRole(enum.Enum):
    CITIZEN = "citizen"
    ADMIN = "admin"

class ComplaintStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CITIZEN)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="owner")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String) # road, water, garbage, electricity
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.PENDING)
    image_url = Column(String, nullable=True)
    resolved_image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="complaints")
    status_history = relationship("ComplaintStatusHistory", back_populates="complaint")
    remarks = relationship("AdminRemark", back_populates="complaint")

class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    old_status = Column(String)
    new_status = Column(String)
    changed_at = Column(DateTime, default=datetime.utcnow)
    changed_by = Column(Integer, ForeignKey("users.id"))

    complaint = relationship("Complaint", back_populates="status_history")

class AdminRemark(Base):
    __tablename__ = "admin_remarks"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    admin_id = Column(Integer, ForeignKey("users.id"))
    remark = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="remarks")
