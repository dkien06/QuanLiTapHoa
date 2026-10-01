import uuid
from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/api/v1/auth/login")
"""
Nó thò tay vào Header của Request, tìm xem có Authorization: Bearer <chuỗi_token> không. Nếu có thì rút cái <chuỗi_token> đó ra đưa cho hàm get_current_user
xử lý. Nếu không có thì ném ra lỗi 401.
"""

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """
    Dependency lấy thông tin User hiện tại từ JWT token gửi lên:
    1. Bóc token từ Header
    2. Giải mã và kiểm tra tính hợp lệ / thời hạn của token
    3. Truy vấn Database xem User có tồn tại và đang hoạt động không
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        
        token_data = TokenPayload(sub=user_id_str)
        user_id = uuid.UUID(token_data.sub) #code thừa nhưng mà để check xem hợp với cái schemas ko

    except jwt.ExpiredSignatureError:
        # Bắt riêng lỗi hết hạn
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token đã hết hạn sử dụng",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        # Bắt riêng lỗi sai chữ ký, token bị sửa đổi bậy bạ
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc sai chữ ký",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except ValueError:
        # Bắt lỗi không ép kiểu được sang UUID
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Định dạng ID người dùng trong token không hợp lệ"
        )


    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException (
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản này đã bị vô hiệu hóa"

        )

    return user

