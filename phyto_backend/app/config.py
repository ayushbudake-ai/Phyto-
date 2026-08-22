from typing import Optional
from urllib.parse import quote_plus
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MySQL connection parameters (preferred for cloud / local MySQL)
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: int = 3306
    DB_NAME: str = "phyto"
    DB_SSL_CA: Optional[str] = None

    # Legacy full URL fallback
    MYSQL_URL: Optional[str] = None

    # MongoDB Atlas
    MONGODB_URL: Optional[str] = None
    MONGODB_DB_NAME: str = "phyto_db"

    # Security & App
    SECRET_KEY: str = "dev-secret-key-change-in-production-1234567890"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,https://phyto.web.app"

    # External APIs
    TREFLE_API_TOKEN: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    @property
    def DATABASE_URL(self) -> str:
        if self.MYSQL_URL:
            return self.MYSQL_URL

        if self.DB_USER or self.DB_PASSWORD or self.DB_HOST:
            user = quote_plus(self.DB_USER) if self.DB_USER else "root"
            password = f":{quote_plus(self.DB_PASSWORD)}" if self.DB_PASSWORD else ""
            host = self.DB_HOST or "localhost"
            port = self.DB_PORT or 3306
            db = self.DB_NAME or "phyto"

            url = f"mysql+aiomysql://{user}{password}@{host}:{port}/{db}"
            if self.DB_SSL_CA:
                url += f"?ssl_ca={self.DB_SSL_CA}"
            return url

        # Default local persistent SQLite database for seamless development
        return "sqlite+aiosqlite:///phyto.db"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()