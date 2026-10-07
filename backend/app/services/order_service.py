from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Order, OrderItem, Product
from app.schemas.order import OrderCreate


DELIVERY_FEE = Decimal("300.00")


def create_order(
    db: Session,
    order_data: OrderCreate,
):
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart cannot be empty",
        )

    # Prevent the same product from appearing multiple times.
    product_quantities: dict[int, int] = {}

    for item in order_data.items:
        product_quantities[item.product_id] = (
            product_quantities.get(item.product_id, 0)
            + item.quantity
        )

    product_ids = list(product_quantities.keys())

    # Lock the selected product rows during this transaction.
    products = db.scalars(
        select(Product)
        .where(Product.id.in_(product_ids))
        .with_for_update()
    ).all()

    products_by_id = {
        product.id: product
        for product in products
    }

    # Make sure every requested product exists.
    for product_id in product_ids:
        if product_id not in products_by_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Product {product_id} not found"
                ),
            )

    subtotal = Decimal("0.00")

    order_item_data = []

    # Validate stock and calculate prices from database.
    for product_id, quantity in product_quantities.items():
        product = products_by_id[product_id]

        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"{product.name} is currently unavailable"
                ),
            )

        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Only {product.stock} unit(s) of "
                    f"{product.name} are available"
                ),
            )

        unit_price = Decimal(product.price)
        item_subtotal = unit_price * quantity

        subtotal += item_subtotal

        order_item_data.append(
            {
                "product": product,
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": item_subtotal,
            }
        )

    total_amount = subtotal + DELIVERY_FEE

    # Create order.
    order = Order(
        customer_name=order_data.customer_name.strip(),
        phone=order_data.phone.strip(),
        delivery_address=order_data.delivery_address.strip(),
        total_amount=total_amount,
        payment_method=order_data.payment_method,
        payment_status="PENDING",
        order_status="PENDING",
    )

    db.add(order)

    # Flush so the order ID is generated before adding items.
    db.flush()

    # Create order items and reduce stock.
    for item_data in order_item_data:
        product = item_data["product"]
        quantity = item_data["quantity"]

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )

        db.add(order_item)

        product.stock -= quantity

        if product.stock == 0:
            product.is_available = False

    db.commit()
    db.refresh(order)

    # Load order items before returning.
    order.items

    return order