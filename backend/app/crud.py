from sqlalchemy.orm import Session
from app import models, schemas, auth

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_complaint(db: Session, complaint: schemas.ComplaintCreate, user_id: int):
    db_complaint = models.Complaint(
        **complaint.dict(),
        user_id=user_id
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

def get_complaints(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Complaint).offset(skip).limit(limit).all()

def get_user_complaints(db: Session, user_id: int):
    return db.query(models.Complaint).filter(models.Complaint.user_id == user_id).all()

def update_complaint_status(db: Session, complaint_id: int, status_update: schemas.ComplaintStatusUpdate, admin_id: int):
    db_complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if db_complaint:
        old_status = db_complaint.status
        db_complaint.status = status_update.status
        
        if status_update.resolved_image_url:
            db_complaint.resolved_image_url = status_update.resolved_image_url
        
        # Log history
        history = models.ComplaintStatusHistory(
            complaint_id=complaint_id,
            old_status=old_status.value,
            new_status=status_update.status.value,
            changed_by=admin_id
        )
        db.add(history)
        
        # Add remark if provided
        if status_update.remark:
            remark = models.AdminRemark(
                complaint_id=complaint_id,
                admin_id=admin_id,
                remark=status_update.remark
            )
            db.add(remark)
            
        db.commit()
        db.refresh(db_complaint)
    return db_complaint
