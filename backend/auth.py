from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError
from config import settings

def get_current_user(request: Request):
    """
    Dependency to validate JWT from Better Auth.
    Expects 'Authorization: Bearer <token>' header.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ")[1]
    
    try:
        # Better Auth uses HS256 by default with the secret
        payload = jwt.decode(
            token, 
            settings.BETTER_AUTH_SECRET, 
            algorithms=["HS256"],
            options={"verify_aud": False} # Better Auth might not set 'aud' by default
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub")
            
        return user_id
        
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
