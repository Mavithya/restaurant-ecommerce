from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field , EmailStr


class OrderItemCreate(BaseModel):
    product_id: int = Field(
        gt=0,
    )

    quantity: int = Field(
        gt=0,
    )


class OrderCreate(BaseModel):
    customer_name: str = Field(
        min_length=2,
        max_length=100,
    )
    email: EmailStr


    phone: str = Field(
        min_length=7,
        max_length=30,
    )
    
    city: str = Field(
        default="Colombo",
        min_length=2,
        max_length=100,
    )

    delivery_address: str = Field(
        min_length=5,
        max_length=500,
    )

    payment_method: Literal[
        "PAYHERE",
        "WHATSAPP",
    ]

    items: list[OrderItemCreate] = Field(
        min_length=1,
    )


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    model_config = {
        "from_attributes": True
    }


class OrderResponse(BaseModel):
    id: int
    customer_name: str
    phone: str
    delivery_address: str
    total_amount: Decimal
    payment_method: str
    payment_status: str
    order_status: str

    items: list[OrderItemResponse] = []

    model_config = {
        "from_attributes": True
    }