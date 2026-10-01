from datetime import datetime
from typing import Optional
from uuid import UUID
    
from pydantic import BaseModel, ConfigDict, Field
    
from app.models.enums import UserRole


"""
Schemas cho đăng nhập
"""
class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Tên đăng nhập")
    password: str = Field(..., min_length=6, description="Mật khẩu thô")

"""
Shemas cho token
"""
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None       # Lưu user_id (dạng chuỗi UUID)
    store_id: Optional[str] = None  # Lưu store_id của người dùng
    role: Optional[str] = None      # Vai trò (OWNER / STAFF)

class UserResponse(BaseModel):
    """
    Schema trả về thông tin người dùng (cho /auth/me hoặc sau khi login).
    Tuyệt đối KHÔNG trả về password_hash.
    """
    id: UUID
    store_id: UUID
    username: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime

    # Cấu hình Pydantic v2 cho phép đọc trực tiếp từ SQLAlchemy Model
    model_config = ConfigDict(from_attributes=True)