import hashlib
from decimal import Decimal

from app.core.config import settings


def md5_upper(value: str) -> str:
    return hashlib.md5(
        value.encode("utf-8")
    ).hexdigest().upper()


def format_amount(amount: Decimal) -> str:
    return f"{amount:.2f}"


def generate_payhere_hash(
    order_id: str,
    amount: Decimal,
    currency: str = "LKR"
) -> str:

    amount_formatted = format_amount(amount)

    hashed_secret = md5_upper(
        settings.PAYHERE_MERCHANT_SECRET
    )

    raw_string = (
        settings.PAYHERE_MERCHANT_ID
        + order_id
        + amount_formatted
        + currency
        + hashed_secret
    )

    return md5_upper(raw_string)


def verify_payhere_notification(
    merchant_id: str,
    order_id: str,
    amount: str,
    currency: str,
    status_code: str,
    md5sig: str
) -> bool:

    hashed_secret = md5_upper(
        settings.PAYHERE_MERCHANT_SECRET
    )

    raw_string = (
        merchant_id
        + order_id
        + amount
        + currency
        + status_code
        + hashed_secret
    )

    expected_signature = md5_upper(raw_string)

    return expected_signature == md5sig.upper()


def get_payhere_checkout_url() -> str:

    if settings.PAYHERE_SANDBOX:
        return "https://sandbox.payhere.lk/pay/checkout"

    return "https://www.payhere.lk/pay/checkout"