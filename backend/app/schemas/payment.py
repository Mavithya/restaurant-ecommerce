from pydantic import BaseModel, EmailStr


class PayHereCreateResponse(BaseModel):
    checkout_url: str
    payload: dict


class PayHereCustomer(BaseModel):
    first_name: str
    last_name: str = ""
    email: EmailStr
    phone: str
    address: str
    city: str = "Colombo"
    country: str = "Sri Lanka"