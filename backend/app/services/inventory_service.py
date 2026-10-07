from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Order, Product


def release_order_inventory(
    db: Session,
    order: Order,
) -> None:

    # Prevent restoring the same order twice.
    if order.inventory_released:
        return

    product_ids = [
        item.product_id
        for item in order.items
    ]

    if not product_ids:
        order.inventory_released = True
        return

    products = db.scalars(
        select(Product)
        .where(Product.id.in_(product_ids))
        .with_for_update()
    ).all()

    products_by_id = {
        product.id: product
        for product in products
    }

    for item in order.items:

        product = products_by_id.get(
            item.product_id
        )

        if product is None:
            continue

        product.stock += item.quantity

        # A restored product can become available again.
        product.is_available = True

    order.inventory_released = True