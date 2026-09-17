import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Alterado de 'db' para 'gntech_mysql'
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:root@gntech_mysql:3306/gntech_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()