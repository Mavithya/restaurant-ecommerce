from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.database import get_db
from app.models import Category, Product, User
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)


router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


@router.get(
    "",
    response_model=list[ProductResponse],
)
def get_products(
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(
        default=None,
        max_length=100,
    ),
    category_id: int | None = Query(
        default=None,
        gt=0,
    ),
    available_only: bool = False,
):
    query = select(Product)

    if search:
        search_pattern = f"%{search.strip()}%"

        query = query.where(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
            )
        )

    if category_id is not None:
        query = query.where(
            Product.category_id == category_id
        )

    if available_only:
        query = query.where(
            Product.is_available.is_(True),
            Product.stock > 0,
        )

    query = query.order_by(Product.created_at.desc())

    return db.scalars(query).all()


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_data: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    category = db.get(
        Category,
        product_data.category_id,
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        category_id=product_data.category_id,
        stock=product_data.stock,
        image_url=product_data.image_url,
        is_available=product_data.is_available,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    update_data = product_data.model_dump(
        exclude_unset=True,
    )

    if "category_id" in update_data:
        category = db.get(
            Category,
            update_data["category_id"],
        )

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@router.delete(
    "/{product_id}",
)
def delete_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    if product.order_items:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Cannot delete a product that has existing orders. "
                "Set is_available to false instead."
            ),
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }