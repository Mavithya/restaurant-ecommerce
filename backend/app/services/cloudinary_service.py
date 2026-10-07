import cloudinary
import cloudinary.uploader

from app.core.config import settings


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_product_image(file):
    result = cloudinary.uploader.upload(
        file,
        folder="kora/products",
        resource_type="image",
    )

    return {
        "secure_url": result["secure_url"],
        "public_id": result["public_id"],
    }