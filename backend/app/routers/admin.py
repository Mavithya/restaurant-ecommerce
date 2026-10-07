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


@router.get("/test")
def admin_test(
    current_user: Annotated[
        User,
        Depends(require_admin),
    ],
):
    return {
        "message": "Admin access granted",
        "user": current_user.email,
        "role": current_user.role,
    }


@router.get("/dashboard")
def get_dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[
        User,
        Depends(require_admin),
    ],
):
    total_products = db.scalar(
        select(func.count(Product.id))
    ) or 0

    active_products = db.scalar(
        select(func.count(Product.id))
        .where(Product.is_available.is_(True))
    ) or 0

    low_stock_products = db.scalar(
        select(func.count(Product.id))
        .where(
            Product.stock <= 5,
            Product.is_available.is_(True),
        )
    ) or 0

    total_categories = db.scalar(
        select(func.count(Category.id))
    ) or 0

    total_orders = db.scalar(
        select(func.count(Order.id))
    ) or 0

    pending_orders = db.scalar(
        select(func.count(Order.id))
        .where(
            Order.order_status == "PENDING"
        )
    ) or 0

    paid_revenue = db.scalar(
        select(func.coalesce(
            func.sum(Order.total_amount),
            0,
        ))
        .where(
            Order.payment_status == "PAID"
        )
    )

    return {
        "total_products": total_products,
        "active_products": active_products,
        "low_stock_products": low_stock_products,
        "total_categories": total_categories,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "paid_revenue": paid_revenue,
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