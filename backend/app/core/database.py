from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from typing import AsyncGenerator

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit = False,
    autoflush=True,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

"""
[Client gửi Request tới]
        │
        ▼
1. FastAPI nhảy vào hàm get_db()
        │
2. async with AsyncSessionLocal() as session:  --> (MỞ PHIÊN ở đây)
        │
3. YIELD session ------------------------------> TẠM DỪNG get_db(), ĐƯA session CHO ROUTER DÙNG
        │                                              │
        │                                        Router làm việc:
        │                                        - await db.execute(select(...))
        │                                        - await db.commit()
        │                                        - Trả response về cho Client
        │                                              │
4. Router dùng xong <──────────────────────────────────┘
        │
5. FastAPI quay lại get_db() chạy tiếp phần sau yield:
   finally: await session.close() -------------> (ĐÓNG PHIÊN & TRẢ KẾT NỐI VỀ POOL)
"""