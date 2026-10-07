from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import require_admin
from app.db.database import get_db
from app.models import (
    Category,
    Order,
    OrderItem,
    Product,
    User,
)
from app.services.inventory_service import (
    release_order_inventory,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)

class OrderStatusUpdate(BaseModel):
    status: Literal[
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
    ]

@router.get("/orders")
def get_admin_orders(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    _: Annotated[
        User,
        Depends(require_admin),
    ],
):
    orders = db.scalars(
        select(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.product)
        )
        .order_by(
            Order.created_at.desc()
        )
    ).unique().all()

    return orders



@router.patch(
    "/orders/{order_id}/status"
)
def update_admin_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    _: Annotated[
        User,
        Depends(require_admin),
    ],
):
    order = db.get(
        Order,
        order_id,
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    current_status = order.order_status
    new_status = status_data.status

    # A cancelled order cannot be reopened.
    if (
        current_status == "CANCELLED"
        and new_status != "CANCELLED"
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cancelled orders cannot be reopened",
        )

    # Delivered orders cannot move backwards.
    if (
        current_status == "DELIVERED"
        and new_status not in {
            "DELIVERED",
            "CANCELLED",
        }
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Delivered orders cannot move backwards",
        )

    # Don't silently cancel a paid online payment.
    # A real refund process would be required.
    if (
        new_status == "CANCELLED"
        and order.payment_status == "PAID"
        and current_status != "CANCELLED"
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Paid orders cannot be cancelled "
                "from the admin panel without a refund process"
            ),
        )

    # Restore inventory exactly once.
    if (
        new_status == "CANCELLED"
        and current_status != "CANCELLED"
    ):
        release_order_inventory(
            db,
            order,
        )

    order.order_status = new_status

    db.commit()
    db.refresh(order)

    return {
        "message":
            "Order status updated successfully",
        "order_id":
            order.id,
        "order_status":
            order.order_status,
        "inventory_released":
            order.inventory_released,
    }
    
@router.get("/orders")
def get_admin_orders(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[
        User,
        Depends(require_admin),
    ],
):
    orders = db.scalars(
        select(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.product)
        )
        .order_by(Order.created_at.desc())
    ).unique().all()

    return orders


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[
        User,
        Depends(require_admin),
    ],
):
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    new_status = status_data.status

    if (
        order.order_status == "CANCELLED"
        and new_status != "CANCELLED"
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cancelled orders cannot be reopened",
        )

    if (
        order.order_status == "DELIVERED"
        and new_status not in {
            "DELIVERED",
            "CANCELLED",
        }
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Delivered orders cannot move backwards",
        )

    order.order_status = new_status

    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "order_status": order.order_status,
    }