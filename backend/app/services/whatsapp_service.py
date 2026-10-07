from decimal import Decimal
from urllib.parse import quote

from app.core.config import settings
from app.models import Order


def format_money(value: Decimal) -> str:
    return f"Rs. {Decimal(value):,.2f}"


def build_whatsapp_message(order: Order) -> str:
    lines: list[str] = []

    lines.append(
        f"🍽️ *Restaurant Order #{order.id}*"
    )

    lines.append("")
    lines.append("*Customer Details*")
    lines.append(
        f"Name: {order.customer_name}"
    )
    lines.append(
        f"Phone: {order.phone}"
    )
    lines.append(
        f"Email: {order.email}"
    )
    lines.append(
        f"City: {order.city}"
    )
    lines.append(
        f"Address: {order.delivery_address}"
    )

    lines.append("")
    lines.append("*Order Items*")

    subtotal = Decimal("0.00")

    for index, item in enumerate(
        order.items,
        start=1,
    ):
        product_name = (
            item.product.name
            if item.product
            else f"Product #{item.product_id}"
        )

        item_subtotal = Decimal(
            str(item.subtotal)
        )

        subtotal += item_subtotal

        lines.append(
            f"{index}. {product_name} "
            f"× {item.quantity} — "
            f"{format_money(item_subtotal)}"
        )

    delivery_fee = (
        Decimal(str(order.total_amount))
        - subtotal
    )

    lines.append("")
    lines.append(
        f"Subtotal: {format_money(subtotal)}"
    )
    lines.append(
        f"Delivery: {format_money(delivery_fee)}"
    )
    lines.append(
        f"*Total: {format_money(order.total_amount)}*"
    )

    lines.append("")
    lines.append(
        "Payment Method: WhatsApp"
    )
    lines.append(
        "Payment Status: Not required"
    )
    lines.append("")
    lines.append(
        "Please confirm this order. Thank you!"
    )

    return "\n".join(lines)


def build_whatsapp_url(order: Order) -> str:
    number = (
        settings.WHATSAPP_NUMBER
        .replace("+", "")
        .replace(" ", "")
        .replace("-", "")
        .replace("(", "")
        .replace(")", "")
    )

    if not number:
        raise ValueError(
            "WHATSAPP_NUMBER is not configured"
        )

    message = build_whatsapp_message(order)

    encoded_message = quote(
        message,
        safe="",
    )

    return (
        f"https://wa.me/"
        f"{number}"
        f"?text={encoded_message}"
    )