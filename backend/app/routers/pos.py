from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repository.order import OrderRepository
from app.services.order import OrderService
from app.schemas.order import CheckoutRequest, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders & POS Checkout"])

async def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    order_repo = OrderRepository(db)
    return OrderService(order_repo)

@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def checkout_order(
    data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service)
):
    return await order_service.checkout(current_user, data)
    