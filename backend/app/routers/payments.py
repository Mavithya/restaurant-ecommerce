from decimal import Decimal ,InvalidOperation

from fastapi import APIRouter, Depends, Form, HTTPException , status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.models.order import Order

from app.services.payment_service import (
    generate_payhere_hash,
    get_payhere_checkout_url,
    verify_payhere_notification,
)
from app.services.inventory_service import (
    release_order_inventory,
)

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


@router.post("/payhere/create")
def create_payhere_payment(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    if order.payment_method != "PAYHERE":
        raise HTTPException(
            status_code=400,
            detail="Order is not a PayHere order",
        )

    if order.payment_status != "PENDING":
        raise HTTPException(
            status_code=409,
            detail="Payment has already been processed",
        )

    amount = Decimal(
        str(order.total_amount)
    )

    order_id_string = str(order.id)

    payment_hash = generate_payhere_hash(
        order_id=order_id_string,
        amount=amount,
        currency="LKR",
    )

    name_parts = (
        order.customer_name
        .strip()
        .split()
    )

    first_name = (
        name_parts[0]
        if name_parts
        else order.customer_name
    )

    last_name = " ".join(
        name_parts[1:]
    )

    payload = {
        "merchant_id":
            settings.PAYHERE_MERCHANT_ID,

        "return_url": (
            f"{settings.FRONTEND_URL}"
            f"/payment/success"
            f"?order_id={order.id}"
        ),

        "cancel_url": (
            f"{settings.FRONTEND_URL}"
            f"/payment/cancel"
            f"?order_id={order.id}"
        ),

        "notify_url": (
            f"{settings.BACKEND_URL}"
            f"/api/payments/payhere/notify"
        ),

        "first_name": first_name,
        "last_name": last_name,
        "email": order.email,
        "phone": order.phone,

        "address":
            order.delivery_address,

        "city": order.city,
        "country": "Sri Lanka",

        "order_id": order_id_string,

        "items":
            f"Restaurant Order #{order.id}",

        "currency": "LKR",
        "amount": f"{amount:.2f}",

        "hash": payment_hash,
    }

    return {
        "checkout_url":
            get_payhere_checkout_url(),

        "payload": payload,
    }


# def release_order_inventory(
#     db: Session,
#     order: Order,
# ) -> None:

#     if order.inventory_released:
#         return

#     product_ids = [
#         item.product_id
#         for item in order.items
#     ]

#     if not product_ids:
#         order.inventory_released = True
#         return

#     products = db.scalars(
#         select(Product)
#         .where(Product.id.in_(product_ids))
#         .with_for_update()
#     ).all()

#     products_by_id = {
#         product.id: product
#         for product in products
#     }

#     for item in order.items:
#         product = products_by_id.get(
#             item.product_id
#         )

#         if product is None:
#             continue

#         product.stock += item.quantity
#         product.is_available = True

#     order.inventory_released = True



@router.post("/payhere/notify")
def payhere_notify(
    merchant_id: str = Form(...),
    order_id: str = Form(...),
    payment_id: str = Form(...),
    payhere_amount: str = Form(...),
    payhere_currency: str = Form(...),
    status_code: str = Form(...),
    md5sig: str = Form(...),
    db: Session = Depends(get_db),
):
    if merchant_id != settings.PAYHERE_MERCHANT_ID:
        raise HTTPException(
            status_code=400,
            detail="Invalid merchant ID",
        )

    is_valid = verify_payhere_notification(
        merchant_id=merchant_id,
        order_id=order_id,
        amount=payhere_amount,
        currency=payhere_currency,
        status_code=status_code,
        md5sig=md5sig,
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Invalid PayHere signature",
        )

    try:
        order_id_int = int(order_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID",
        )

    order = db.get(
        Order,
        order_id_int,
    )

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    if order.payment_method != "PAYHERE":
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method",
        )

    try:
        received_amount = Decimal(
            payhere_amount
        ).quantize(
            Decimal("0.01")
        )

        expected_amount = Decimal(
            str(order.total_amount)
        ).quantize(
            Decimal("0.01")
        )

    except InvalidOperation:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment amount",
        )

    if received_amount != expected_amount:
        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match order",
        )

    if payhere_currency != "LKR":
        raise HTTPException(
            status_code=400,
            detail="Invalid payment currency",
        )

    # Ignore stale notifications after payment
    # has already been confirmed.
    if order.payment_status == "PAID":
        return {
            "success": True,
            "order_id": order.id,
            "payment_status":
                order.payment_status,
        }

    order.payment_id = payment_id

    if status_code == "2":

        order.payment_status = "PAID"
        order.order_status = "CONFIRMED"

    elif status_code == "0":

        order.payment_status = "PENDING"
        order.order_status = "PENDING"

    elif status_code == "-1":

        order.payment_status = "CANCELLED"
        order.order_status = "CANCELLED"

        release_order_inventory(
            db,
            order,
        )

    elif status_code == "-2":

        order.payment_status = "FAILED"
        order.order_status = "CANCELLED"

        release_order_inventory(
            db,
            order,
        )

    elif status_code == "-3":

        order.payment_status = "CHARGEDBACK"
        order.order_status = "CANCELLED"

    else:
        raise HTTPException(
            status_code=400,
            detail="Unknown PayHere status code",
        )

    db.commit()

    return {
        "success": True,
        "order_id": order.id,
        "payment_status":
            order.payment_status,
        "order_status":
            order.order_status,
    }

@router.get("/payhere/status/{order_id}")
def get_payhere_payment_status(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "order_id": order.id,
        "payment_status": order.payment_status,
        "order_status": order.order_status,
    }