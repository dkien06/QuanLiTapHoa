from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Chuỗi kết nối SQL Server
# Cú pháp: mssql+pymssql://<Tên_đăng_nhập>:<Mật_khẩu>@<Tên_Server_hoặc_IP>/<Tên_Database>
# Ví dụ dưới đây dùng tài khoản mặc định 'sa'. Hãy thay đổi cho khớp với máy của bạn.
SQLALCHEMY_DATABASE_URL = "mssql+pymssql://sa:123456@localhost/pos_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()