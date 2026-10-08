import sys
from sqlalchemy import select
from app.db.database import SessionLocal, init_db
from app.core.security import get_password_hash
from app.models import User, Category, Product

def seed():
    print("Initializing Database tables on Supabase/PostgreSQL...")
    init_db()
    db = SessionLocal()

    try:
        # 1. Seed Admin User
        admin_email = "admin@kora.com"
        admin = db.scalar(select(User).where(User.email == admin_email))
        if not admin:
            admin = User(
                name="KORA Admin",
                email=admin_email,
                password_hash=get_password_hash("admin123"),
                role="ADMIN",
            )
            db.add(admin)
            print(f"[SUCCESS] Admin user created: {admin_email} / admin123")
        else:
            print(f"[INFO] Admin user '{admin_email}' already exists.")

        # 2. Seed Categories
        category_data = [
            {"name": "Rice & Biryani", "description": "Authentic fragrant rice dishes and aromatic biryanis."},
            {"name": "Kottu Specialities", "description": "Hot wok-fried kottu with spices and fresh vegetables."},
            {"name": "Curries & Mains", "description": "Rich, slow-cooked curries crafted with fresh herbs."},
            {"name": "Desserts", "description": "Traditional sweet treats and house-made desserts."},
            {"name": "Beverages", "description": "Chilled juices, cooling lassis, and refreshing drinks."},
        ]

        categories_map = {}
        for cat in category_data:
            existing = db.scalar(select(Category).where(Category.name == cat["name"]))
            if not existing:
                existing = Category(name=cat["name"], description=cat["description"])
                db.add(existing)
                db.flush()
                print(f"[SUCCESS] Created category: {cat['name']}")
            else:
                print(f"[INFO] Category '{cat['name']}' already exists.")
            categories_map[cat["name"]] = existing

        # 3. Seed Products
        product_data = [
            {
                "name": "Chicken Fried Rice",
                "description": "Wok-tossed basmati rice with tender chicken, fresh veggies and fried egg.",
                "price": 1650.00,
                "stock": 25,
                "category_name": "Rice & Biryani",
                "image_url": "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465484/kora/products/seed_chicken_fried_rice.jpg",
                "is_available": True,
            },
            {
                "name": "Mutton Biryani",
                "description": "Slow-cooked aromatic basmati rice layered with succulent spiced mutton pieces.",
                "price": 2450.00,
                "stock": 15,
                "category_name": "Rice & Biryani",
                "image_url": "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465486/kora/products/seed_mutton_biryani.jpg",
                "is_available": True,
            },
            {
                "name": "Cheese Chicken Kottu",
                "description": "Wok-shredded roti tossed with roasted chicken, fresh vegetables and melted cheese.",
                "price": 1850.00,
                "stock": 20,
                "category_name": "Kottu Specialities",
                "image_url": "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465488/kora/products/seed_cheese_chicken_kottu.jpg",
                "is_available": True,
            },
            {
                "name": "Butter Chicken Masala",
                "description": "Tender chicken pieces cooked in a rich, buttery tomato gravy with aromatic spices.",
                "price": 1750.00,
                "stock": 18,
                "category_name": "Curries & Mains",
                "image_url": "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465489/kora/products/seed_butter_chicken.jpg",
                "is_available": True,
            },
            {
                "name": "Mango Lassi",
                "description": "Refreshing and creamy yogurt drink blended with ripe Alphonso mangoes.",
                "price": 750.00,
                "stock": 30,
                "category_name": "Beverages",
                "image_url": "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465491/kora/products/seed_mango_lassi.jpg",
                "is_available": True,
            },
            {
                "name": "Watalappan",
                "description": "Traditional Sri Lankan steamed coconut custard pudding made with kithul jaggery and cardamom.",
                "price": 650.00,
                "stock": 12,
                "category_name": "Desserts",
                "image_url": "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465492/kora/products/seed_watalappan.jpg",
                "is_available": True,
            },
        ]

        for prod in product_data:
            cat = categories_map.get(prod["category_name"])
            if not cat:
                continue
            existing_prod = db.scalar(select(Product).where(Product.name == prod["name"]))
            if not existing_prod:
                new_prod = Product(
                    name=prod["name"],
                    description=prod["description"],
                    price=prod["price"],
                    stock=prod["stock"],
                    category_id=cat.id,
                    image_url=prod["image_url"],
                    is_available=prod["is_available"],
                )
                db.add(new_prod)
                print(f"[SUCCESS] Created product: {prod['name']}")
            else:
                print(f"[INFO] Product '{prod['name']}' already exists.")

        db.commit()
        print("\n[COMPLETE] Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
