from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

# Change this to a random string in production!
SECRET_KEY = "STUDY_DASH_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Using "pbkdf2_sha256" alongside "bcrypt" can sometimes help with compatibility 
# but keeping bcrypt is fine as long as we truncate the password.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    # FIX: Truncate to 72 characters to prevent the Bcrypt ValueError crash
    return pwd_context.hash(password[:72])

def verify_password(plain_password, hashed_password):
    # FIX: Also truncate here so it matches the hashed version
    return pwd_context.verify(plain_password[:72], hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    # Use datetime.now(datetime.UTC) if you get a deprecation warning for utcnow
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)