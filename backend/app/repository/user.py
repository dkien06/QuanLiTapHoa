from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        query = select(User).options(joinedload(User.store)).where(User.id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_by_name(self, username: str):
        query = select(User).where(User.username == username)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_store_id(self, store_id: UUID):
        query = select(User).where(User.store_id == store_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())


    async def create_user(self, user: User):
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user