from decimal import Decimal

from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.order import Order
from app.schemas.payment import PayHereCustomer
from app.services.payment_service import (
    generate_payhere_hash,
    get_payhere_checkout_url,
    verify_payhere_notification,
)


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


@router.post("/payhere/create")
def create_payhere_payment(
    order_id: int,
    customer: PayHereCustomer,
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

    if order.payment_method != "PAYHERE":
        raise HTTPException(
            status_code=400,
            detail="Order is not a PayHere order"
        )

    amount = Decimal(str(order.total_amount))

    order_id_string = str(order.id)

    payment_hash = generate_payhere_hash(
        order_id=order_id_string,
        amount=amount,
        currency="LKR"
    )

    payload = {
        "merchant_id": settings.PAYHERE_MERCHANT_ID,

        "return_url": (
            f"{settings.FRONTEND_URL}"
            f"/payment/success?order_id={order.id}"
        ),

        "cancel_url": (
            f"{settings.FRONTEND_URL}"
            f"/payment/cancel?order_id={order.id}"
        ),

        "notify_url": (
            f"{settings.BACKEND_URL}"
            f"/api/payments/payhere/notify"
        ),

        "first_name": customer.first_name,
        "last_name": customer.last_name,
        "email": customer.email,
        "phone": customer.phone,

        "address": customer.address,
        "city": customer.city,
        "country": customer.country,

        "order_id": order_id_string,
        "items": f"Restaurant Order #{order.id}",

        "currency": "LKR",
        "amount": f"{amount:.2f}",

        "hash": payment_hash,
    }

    return {
        "checkout_url": get_payhere_checkout_url(),
        "payload": payload,
    }


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

    # Verify that notification came from our merchant
    if merchant_id != settings.PAYHERE_MERCHANT_ID:
        raise HTTPException(
            status_code=400,
            detail="Invalid merchant ID"
        )

    # Verify PayHere checksum
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
            detail="Invalid PayHere signature"
        )

    order = db.query(Order).filter(
        Order.id == int(order_id)
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # Successful payment
    if status_code == "2":
        order.payment_status = "PAID"
        order.order_status = "CONFIRMED"

    # Pending
    elif status_code == "0":
        order.payment_status = "PENDING"

    # Cancelled
    elif status_code == "-1":
        order.payment_status = "CANCELLED"

    # Failed
    elif status_code == "-2":
        order.payment_status = "FAILED"

    # Chargedback
    elif status_code == "-3":
        order.payment_status = "CHARGEDBACK"

    db.commit()

    return {
        "success": True,
        "order_id": order.id,
        "payment_status": order.payment_status,
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