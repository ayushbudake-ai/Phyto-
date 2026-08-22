import os

flutter_base = r"f:\phyto\phyto_flutter\lib"
backend_base = r"f:\phyto\phyto_backend"

# --- Flutter Setup ---
flutter_dirs = [
    "core/constants", "core/theme", "core/router",
    "data/models", "data/services", "data/repositories",
    "presentation/providers", "presentation/pages/customer",
    "presentation/pages/nursery", "presentation/pages/delivery",
    "presentation/widgets/chatbot", "presentation/widgets/common"
]

for d in flutter_dirs:
    os.makedirs(os.path.join(flutter_base, d), exist_ok=True)

flutter_files = {
    "core/constants/app_colors.dart": "",
    "core/constants/api_endpoints.dart": "",
    "core/constants/app_strings.dart": "",
    "core/theme/app_theme.dart": "import 'package:flutter/material.dart';\n\nfinal appTheme = ThemeData(primaryColor: const Color(0xFF2D6A4F), scaffoldBackgroundColor: Colors.white);",
    "core/router/app_router.dart": "import 'package:go_router/go_router.dart';\n\nfinal appRouter = GoRouter(routes: []);",
    "data/models/user_model.dart": "class UserModel {}",
    "data/models/product_model.dart": "class ProductModel {}",
    "data/models/order_model.dart": "class OrderModel {}",
    "data/models/cart_model.dart": "class CartModel {}",
    "data/services/api_service.dart": "class ApiService {}",
    "data/services/firebase_service.dart": "class FirebaseService {}",
    "data/services/storage_service.dart": "class StorageService {}",
    "data/repositories/auth_repo.dart": "class AuthRepo {}",
    "data/repositories/product_repo.dart": "class ProductRepo {}",
    "data/repositories/order_repo.dart": "class OrderRepo {}",
    "data/repositories/cart_repo.dart": "class CartRepo {}",
    "presentation/providers/auth_provider.dart": "",
    "presentation/providers/product_provider.dart": "",
    "presentation/providers/cart_provider.dart": "",
    "presentation/providers/order_provider.dart": "",
    "presentation/providers/filter_provider.dart": "",
}

pages_and_widgets = [
    "presentation/pages/home_page.dart", "presentation/pages/shop_page.dart",
    "presentation/pages/product_detail_page.dart", "presentation/pages/cart_page.dart",
    "presentation/pages/checkout_page.dart", "presentation/pages/login_page.dart",
    "presentation/pages/signup_page.dart", "presentation/pages/customer/dashboard_page.dart",
    "presentation/pages/customer/order_tracking_page.dart", "presentation/pages/nursery/nursery_dashboard.dart",
    "presentation/pages/nursery/manage_products.dart", "presentation/pages/nursery/nursery_orders.dart",
    "presentation/pages/delivery/delivery_dashboard.dart", "presentation/pages/delivery/delivery_detail.dart",
    "presentation/widgets/chatbot/chatbot_fab.dart", "presentation/widgets/common/phyto_button.dart",
    "presentation/widgets/common/phyto_app_bar.dart", "presentation/widgets/common/loading_skeleton.dart"
]

stub_template = """import 'package:flutter/material.dart';

class {name} extends StatelessWidget {{
  const {name}({{super.key}});

  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(title: const Text('{name}')),
      body: const Center(child: Text('{name}')),
    );
  }}
}}
"""

def to_class_name(filename):
    name = filename.split('/')[-1].replace('.dart', '')
    return ''.join(word.title() for word in name.split('_'))

for p in pages_and_widgets:
    flutter_files[p] = stub_template.format(name=to_class_name(p))

for f, content in flutter_files.items():
    with open(os.path.join(flutter_base, f), "w") as file:
        file.write(content)


# --- Backend Setup ---
backend_dirs = [
    "app/models", "app/schemas", "app/routers",
    "app/services", "app/middleware", "alembic"
]

for d in backend_dirs:
    os.makedirs(os.path.join(backend_base, d), exist_ok=True)

backend_files = {
    "app/__init__.py": "",
    "app/models/__init__.py": "",
    "app/schemas/__init__.py": "",
    "app/routers/__init__.py": "",
    "app/services/__init__.py": "",
    "app/middleware/__init__.py": "",
    "app/routers/auth.py": "from fastapi import APIRouter\nrouter = APIRouter()",
    "app/routers/users.py": "from fastapi import APIRouter\nrouter = APIRouter()",
    "app/routers/products.py": "from fastapi import APIRouter\nrouter = APIRouter()",
    "app/routers/orders.py": "from fastapi import APIRouter\nrouter = APIRouter()",
    "app/routers/cart.py": "from fastapi import APIRouter\nrouter = APIRouter()",
    "app/routers/nursery.py": "from fastapi import APIRouter\nrouter = APIRouter()",
    "app/services/firebase_admin.py": "",
    "app/services/firebase_realtime.py": "",
    "app/services/image_service.py": "",
    "app/middleware/auth_middleware.py": "",
    "requirements.txt": "fastapi\nuvicorn\nsqlalchemy\naiomysql\npymysql\nalembic\nfirebase-admin\npython-dotenv\npydantic[email]\npython-multipart\nhttpx",
    "Dockerfile": "FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
    ".env": "# Database and Firebase secrets",
    "app/main.py": "from fastapi import FastAPI\nfrom app.routers import auth, users, products, orders, cart, nursery\n\napp = FastAPI(title='Phyto API')\n\napp.include_router(auth.router, prefix='/auth', tags=['auth'])\napp.include_router(users.router, prefix='/users', tags=['users'])\napp.include_router(products.router, prefix='/products', tags=['products'])\napp.include_router(orders.router, prefix='/orders', tags=['orders'])\napp.include_router(cart.router, prefix='/cart', tags=['cart'])\napp.include_router(nursery.router, prefix='/nursery', tags=['nursery'])\n\n@app.get('/')\ndef read_root():\n    return {'message': 'Welcome to Phyto API'}",
    "app/config.py": "from pydantic_settings import BaseSettings\n\nclass Settings(BaseSettings):\n    DATABASE_URL: str = 'mysql+aiomysql://user:password@localhost/phyto'\n    class Config:\n        env_file = '.env'\n\nsettings = Settings()",
    "app/database.py": "from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker\nfrom sqlalchemy.orm import declarative_base\nfrom app.config import settings\n\nengine = create_async_engine(settings.DATABASE_URL, echo=True)\nSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)\nBase = declarative_base()",
}

for f, content in backend_files.items():
    with open(os.path.join(backend_base, f), "w") as file:
        file.write(content)

print("Scaffolding completed successfully.")
