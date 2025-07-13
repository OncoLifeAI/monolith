from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from authlib.integrations.httpx_client import AsyncOAuth2Client
from authlib.oidc.core import CodeIDToken
import os
from dotenv import load_dotenv
import httpx
from itsdangerous import URLSafeTimedSerializer
import json

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# Create router instead of app
router = APIRouter(prefix="/auth", tags=["authentication"])

# Session management using signed cookies
SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')
serializer = URLSafeTimedSerializer(SECRET_KEY)

# OAuth2 client configuration
COGNITO_AUTHORITY = os.getenv('COGNITO_AUTHORITY')
COGNITO_CLIENT_ID = os.getenv('COGNITO_CLIENT_ID')
COGNITO_CLIENT_SECRET = os.getenv('COGNITO_CLIENT_SECRET')
COGNITO_METADATA_URL = os.getenv('COGNITO_METADATA_URL')
FRONTEND_URL = os.getenv('FRONTEND_URL')

# Helper functions for session management
def get_session_data(request: Request):
    """Extract session data from signed cookie"""
    session_cookie = request.cookies.get('session')
    if not session_cookie:
        return {}
    try:
        return serializer.loads(session_cookie, max_age=3600)  # 1 hour expiry
    except:
        return {}

def create_session_cookie(data: dict):
    """Create signed session cookie"""
    return serializer.dumps(data)

async def get_oauth_client():
    """Get OAuth2 client with metadata"""
    async with httpx.AsyncClient() as client:
        metadata_response = await client.get(COGNITO_METADATA_URL)
        metadata = metadata_response.json()
        
        return AsyncOAuth2Client(
            client_id=COGNITO_CLIENT_ID,
            client_secret=COGNITO_CLIENT_SECRET,
            authorization_endpoint=metadata['authorization_endpoint'],
            token_endpoint=metadata['token_endpoint'],
            userinfo_endpoint=metadata['userinfo_endpoint'],
        )

@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    session_data = get_session_data(request)
    user = session_data.get('user')
    
    if user:
        return f'Hello, {user["email"]}. <a href="/auth/logout">Logout</a>'
    else:
        return f'Welcome! Please <a href="/auth/login">Login</a>.'

@router.get("/login")
async def login(request: Request):
    oauth_client = await get_oauth_client()
    
    # Generate authorization URL
    authorization_url, state = oauth_client.create_authorization_url(
        url=oauth_client.authorization_endpoint,
        redirect_uri=f"{request.base_url}auth/authorize",
        scope="email openid phone"
    )
    
    # Store state in session for security
    response = RedirectResponse(url=authorization_url)
    session_data = {'oauth_state': state}
    response.set_cookie(
        key="session",
        value=create_session_cookie(session_data),
        httponly=True,
        secure=True,
        samesite='lax'
    )
    
    return response

@router.get("/authorize")
async def authorize(request: Request, code: str = None, state: str = None):
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")
    
    session_data = get_session_data(request)
    stored_state = session_data.get('oauth_state')
    
    if not stored_state or stored_state != state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    oauth_client = await get_oauth_client()
    
    # Exchange code for token
    token_response = await oauth_client.fetch_token(
        url=oauth_client.token_endpoint,
        code=code,
        redirect_uri=f"{request.base_url}auth/authorize"
    )
    
    # Get user info
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            oauth_client.userinfo_endpoint,
            headers={'Authorization': f"Bearer {token_response['access_token']}"}
        )
        user_info = userinfo_response.json()
    
    # Store user in session
    session_data['user'] = user_info
    session_data.pop('oauth_state', None)  # Remove state after use
    
    response = RedirectResponse(url="/auth/")
    response.set_cookie(
        key="session",
        value=create_session_cookie(session_data),
        httponly=True,
        secure=True,
        samesite='lax'
    )
    
    return response

@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/auth/")
    response.delete_cookie("session")
    return response