from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.repository.user import UserRepository
from app.repository.store import StoreRepository
from app.services.auth import AuthService
from app.schemas.auth import (
    RegisterOwnerRequest,
    UserLogin,
    Token,
    UserResponse,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency khởi tạo AuthService từ DB Session"""
    user_repo = UserRepository(db)
    store_repo = StoreRepository(db)
    return AuthService(user_repo=user_repo, store_repo=store_repo)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterOwnerRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Đăng ký mở tiệm mới (Tạo Store + Tài khoản Owner cùng lúc)
    """
    return await auth_service.register_owner(data)


@router.post("/login", response_model=Token)
async def login(
    data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Đăng nhập bằng username và password, nhận về JWT Token
    """
    return await auth_service.login(data)


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Lấy thông tin tài khoản hiện tại từ Token gửi ở Header
    """
    return current_user
