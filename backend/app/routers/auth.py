import json
import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

def load_config():
    """Load credentials from config.json"""
    config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config.json')
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        return config.get('credentials', {})
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Config file not found"
        )

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Simple login endpoint that validates against config credentials"""
    credentials = load_config()
    
    if (request.username == credentials.get('username') and 
        request.password == credentials.get('password')):
        # Return a simple token (username in this case)
        # In production, you'd use JWT tokens
        return LoginResponse(
            access_token=request.username,
            token_type="bearer"
        )
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@router.get("/validate")
async def validate_token(token: str):
    """Validate if a token is still valid (for now, any non-empty token is valid)"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return {"valid": True, "user": token}
