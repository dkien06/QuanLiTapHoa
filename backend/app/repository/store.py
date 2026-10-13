from sqlalchemy.ext.asyncio import AsyncSession
from app.models.store import Store

class StoreRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_store(self, store: Store) -> Store:
        self.db.add(store)
        await self.db.flush()
        await self.db.refresh(store)
        return store