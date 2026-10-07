from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Order
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import create_order
from app.services.whatsapp_service import (
    build_whatsapp_url,
)

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"],
)


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_order(
    order_data: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return create_order(
            db=db,
            order_data=order_data,
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create order",
        )


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order


@router.get(
    "/{order_id}/whatsapp",
)
def get_whatsapp_order_link(
    order_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.payment_method != "WHATSAPP":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This order does not use WhatsApp",
        )

    try:
        whatsapp_url = build_whatsapp_url(order)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    return {
        "order_id": order.id,
        "whatsapp_url": whatsapp_url,
    }