from database import engine
import models

def reset_db():
    print("Memulai pembersihan data...")
    # Menghapus tabel todos saja (agar data user/auth tidak hilang)
    # Jika ingin menghapus SEMUA tabel, gunakan models.Base.metadata.drop_all(bind=engine)
    try:
        # Kita gunakan koneksi langsung untuk DELETE agar lebih cepat
        with engine.connect() as connection:
            connection.execute(models.Todo.__table__.delete())
            connection.commit()
        print("Data todos berhasil dikosongkan!")
    except Exception as e:
        print(f"Gagal mengosongkan data: {e}")

if __name__ == "__main__":
    reset_db()
