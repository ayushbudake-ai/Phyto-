import asyncio
import os
import ssl

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


def build_url() -> str:
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    name = os.getenv("DB_NAME")
    if not all([user, password, host, port, name]):
        raise RuntimeError("Missing DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME in .env")
    return f"mysql+aiomysql://{user}:{password}@{host}:{port}/{name}"


async def test():
    load_dotenv()
    ca = os.getenv("DB_SSL_CA")
    ssl_ctx = ssl.create_default_context(cafile=os.path.abspath(ca)) if ca else ssl.create_default_context()

    engine = create_async_engine(build_url(), connect_args={"ssl": ssl_ctx}, pool_pre_ping=True, pool_recycle=300)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT 'Connection successful!' AS status"))
        print(result.fetchone()[0])
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test())
