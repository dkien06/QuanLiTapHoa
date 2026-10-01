from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import jwt
import bcrypt
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
        """
        Băm mật khẩu người dùng trước khi lưu vào Database.
        Hàm tự động sinh chuỗi salt ngẫu nhiên chống tấn công Rainbow Table.
        """
        # 1. Sinh salt ngẫu nhiên
        salt = bcrypt.gensalt()
        # 2. Băm mật khẩu kèm salt
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        # 3. Decode sang chuỗi str để lưu vào cột VARCHAR(255) trong PostgreSQL
        return hashed.decode("utf-8")

"""
Nhóm hàm xử lý jwt token
"""
def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
        Tạo và ký chữ ký số cho Access Token.
        
        :param data: Dữ liệu payload muốn nhét vào token (thường có 'sub': user_id, 'role', 'store_id')
        :param expires_delta: Thời hạn sống tùy chọn của token
        :return: Chuỗi JWT hoàn chỉnh dạng xxx.yyy.zzz
    """

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
         expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt
