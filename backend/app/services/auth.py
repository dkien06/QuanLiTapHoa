from fastapi import HTTPException, status

from app.models.enums import UserRole
from app.models.store import Store
from app.models.user import User
from app.repository.user import UserRepository
from app.repository.store import StoreRepository
from app.core.security import verify_password,get_password_hash, create_access_token
from app.schemas.auth import UserLogin, Token, RegisterOwnerRequest, StaffCreate

class AuthService:
    def __init__(self, user_repo: UserRepository, store_repo: StoreRepository):
        self.store_repo = store_repo
        self.user_repo = user_repo

    async def register_owner(self, data: RegisterOwnerRequest) -> Token:
        """
        Nghiệp vụ Đăng ký mở tiệm mới:
        1. Kiểm tra username đã tồn tại chưa
        2. Tạo Store mới và flush() để lấy ID của Store
        3. Băm mật khẩu và tạo User với vai trò OWNER thuộc Store vừa tạo
        4. Commit giao dịch (đảm bảo tính toàn vẹn ACID)
        5. Tự động sinh Access Token để Chủ quán đăng nhập luôn
        """

        existing_user = await self.user_repo.get_user_by_name(data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ten dang nhap da duoc su dung"
            )

        new_store = Store(
            name=data.store_name,
            store_type=data.store_type,
            phone=data.store_phone,
            address=data.store_address,
        )

        created_store = await self.store_repo.create_store(new_store)


        hashed_password = get_password_hash(password=data.password)

        owner_user = User(
            store_id=created_store.id,
            username=data.username,
            password_hash=hashed_password,
            full_name=data.full_name,
            phone=data.phone,
            role=UserRole.OWNER,
            is_active=True,
        )

        created_user = await self.user_repo.create_user(owner_user)

        await self.user_repo.db.commit()

        return self._generate_token(user=created_user)

    async def create_staff(self, data: StaffCreate, owner: User) -> User:
        """
        Chủ cửa hàng tạo tài khoản nhân viên thuộc cùng cửa hàng.
        """
        existing_user = await self.user_repo.get_user_by_name(data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên đăng nhập đã được sử dụng"
            )

        staff_user = User(
            store_id=owner.store_id,
            username=data.username,
            password_hash=get_password_hash(data.password),
            full_name=data.full_name,
            phone=data.phone,
            role=UserRole.STAFF,
            is_active=True,
        )

        created_staff = await self.user_repo.create_user(staff_user)
        await self.user_repo.db.commit()

        return created_staff

    async def authenticate_user(self, username: str, password: str)->User:
        user = await self.user_repo.get_user_by_name(username=username)

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ten dang nhap hoac mat khau khong chinh xac",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tai khoan bi vo hieu hoa"
            )

        return user

    async def login(self, login_data: UserLogin) -> Token:
        user = await self.authenticate_user(login_data.username, login_data.password)
        return self._generate_token(user)

    def _generate_token(self, user: User)->Token:
        token_payload = {
            "sub": str(user.id),
            "store_id": str(user.store_id),
            "role": user.role.value,
        }
        access_token = create_access_token(data=token_payload)
        return Token(access_token=access_token, token_type="bearer")

        

