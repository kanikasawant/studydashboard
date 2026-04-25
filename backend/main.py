from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import func
import re

# Importing your local project files
import models
import database
import auth

app = FastAPI()

# 1. CORS Setup: This allows your React (Vite) frontend to talk to this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (Vercel previews, local, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Database Initialization: Creates the .db file and tables on startup
models.Base.metadata.create_all(bind=database.engine)

# 3. Data Validation Schema
class UserSchema(BaseModel):
    username: str
    password: str


def validate_password_strength(password: str):
    errors = []

    if len(password) < 8:
        errors.append("at least 8 characters")
    if not re.search(r"[A-Z]", password):
        errors.append("one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("one number")
    if not re.search(r"[^A-Za-z0-9]", password):
        errors.append("one special character")

    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain " + ", ".join(errors),
        )

# --- API ENDPOINTS ---

@app.post("/signup")
def signup(user: UserSchema, db: Session = Depends(database.get_db)):
    username = user.username.strip().lower()
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username cannot be empty",
        )

    validate_password_strength(user.password)

    # Check if user already exists
    db_user = db.query(models.User).filter(func.lower(models.User.username) == username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username is already taken. Please choose another one."
        )
    
    # Hash the password and save the user
    new_user = models.User(
        username=username, 
        hashed_password=auth.hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/login")
def login(user: UserSchema, db: Session = Depends(database.get_db)):
    username = user.username.strip().lower()

    # Find the user by username
    db_user = db.query(models.User).filter(func.lower(models.User.username) == username).first()
    
    # Check password
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
    
    # Generate the JWT Token (The "VIP Pass")
    access_token = auth.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Root path just to check if server is alive
@app.get("/")
def read_root():
    return {"status": "StudyDash Backend is running!"}