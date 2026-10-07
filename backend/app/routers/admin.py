from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from pydantic import BaseModel
from sqlalchemy import func, select ,func
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

from app.services.cloudinary_service import (
    upload_product_image,
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



@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    product_count = db.scalar(
        select(func.count(Product.id))
    ) or 0

    category_count = db.scalar(
        select(func.count(Category.id))
    ) or 0

    order_count = db.scalar(
        select(func.count(Order.id))
    ) or 0

    pending_count = db.scalar(
        select(func.count(Order.id)).where(
            Order.order_status == "PENDING"
        )
    ) or 0

    paid_revenue = db.scalar(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(Order.payment_status == "PAID")
    ) or 0

    low_stock_products = db.scalars(
        select(Product)
        .where(Product.stock <= 5)
        .order_by(Product.stock.asc())
    ).all()

    return {
        "product_count": product_count,
        "category_count": category_count,
        "order_count": order_count,
        "pending_count": pending_count,
        "paid_revenue": float(paid_revenue),
        "low_stock_products": [
            {
                "id": product.id,
                "name": product.name,
                "stock": product.stock,
            }
            for product in low_stock_products
        ],
    }

    
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


@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    _: Annotated[
        User,
        Depends(require_admin),
    ] = None,
):
    if not file.content_type:
        raise HTTPException(
            status_code=400,
            detail="Unable to determine file type",
        )

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed",
        )

    # Maximum 5 MB
    max_size = 5 * 1024 * 1024

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 5 MB",
        )

    try:
        result = upload_product_image(
            file.file
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Image upload failed",
        )

    return result