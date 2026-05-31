from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app import crud, models, schemas, auth, database
from jose import JWTError, jwt
import shutil
import uuid
import os

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/complaints", response_model=List[schemas.Complaint])
def read_complaints(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_complaints(db, skip=skip, limit=limit)

@router.post("/complaints", response_model=schemas.Complaint)
def create_complaint(complaint: schemas.ComplaintCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_complaint(db=db, complaint=complaint, user_id=current_user.id)

@router.put("/complaints/{complaint_id}/status", response_model=schemas.Complaint)
def update_complaint_status(
    complaint_id: int, 
    status_update: schemas.ComplaintStatusUpdate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Check if user is admin - using uppercase ADMIN as defined in Enum
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Ensure status is an Enum
    if isinstance(status_update.status, str):
        try:
            status_update.status = models.ComplaintStatus(status_update.status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    db_complaint = crud.update_complaint_status(
        db=db, 
        complaint_id=complaint_id, 
        status_update=status_update, 
        admin_id=current_user.id
    )
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return db_complaint

@router.post("/upload")
def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    os.makedirs("static/uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join("static/uploads", filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"/api/static/uploads/{filename}"}
