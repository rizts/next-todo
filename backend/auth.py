import httpx
import jwt
from fastapi import Request, HTTPException
from config import settings

# Cache untuk JWKS agar tidak fetch setiap request
_jwks_cache = None

async def get_jwks():
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    
    # Use INTERNAL_AUTH_URL if provided (e.g. for Docker internal networking)
    # otherwise fallback to FRONTEND_URL
    base_url = settings.INTERNAL_AUTH_URL or settings.FRONTEND_URL
    
    try:
        async with httpx.AsyncClient() as client:
            jwks_url = f"{base_url}/api/auth/jwks"
            print(f"DEBUG: Fetching JWKS from {jwks_url}")
            response = await client.get(jwks_url)
            response.raise_for_status()
            _jwks_cache = response.json()
            return _jwks_cache
    except Exception as e:
        print(f"Failed to fetch JWKS from {base_url}: {e}")
        return None

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = auth_header.split(" ")[1]
    jwks_data = await get_jwks()
    
    if not jwks_data:
        raise HTTPException(status_code=500, detail="Internal Server Error: Could not verify token (JWKS missing)")

    try:
        # Ambil header untuk mencari key yang tepat
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        # PyJWT handles JWKS via PyJWKSet
        jwks = jwt.PyJWKSet.from_dict(jwks_data)
        
        try:
            # Cari key yang sesuai secara manual di list jwks.keys
            signing_key = next((k for k in jwks.keys if k.key_id == kid), None)
            if not signing_key:
                raise Exception(f"Key {kid} not found")
        except Exception:
            # Jika tidak ketemu, coba refresh JWKS sekali lagi
            global _jwks_cache
            _jwks_cache = None 
            jwks_data = await get_jwks()
            jwks = jwt.PyJWKSet.from_dict(jwks_data)
            signing_key = next((k for k in jwks.keys if k.key_id == kid), None)
            if not signing_key:
                raise HTTPException(status_code=401, detail=f"Invalid token: Key {kid} not found in JWKS")

        # Verifikasi menggunakan Public Key
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "RS256", "HS256"],
            options={"verify_aud": False}
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub")
            
        return user_id
        
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")
