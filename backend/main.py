from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from pathlib import Path
import requests
import uuid


app = FastAPI(title="Upload API with Supabase Auth")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = "https://ayqafhdzjjhnptoycbji.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

def get_user_id(auth_header: str | None):
    if not auth_header:
        return None

    token = auth_header.replace("Bearer ", "").strip()

    r = requests.get(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": SUPABASE_ANON_KEY
        }
    )

    print("SUPABASE STATUS:", r.status_code)
    print("SUPABASE BODY:", r.text)

    if r.status_code != 200:
        return None

    user = r.json()
    return user["id"]

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    authorization: str = Header(None, alias="Authorization")
):
    print("AUTH HEADER RECEIVED:", authorization)  # 👈 here

    user_id = get_user_id(authorization)
    if not user_id:
        raise HTTPException(401, "Unauthorized")
    user_dir = UPLOAD_DIR / user_id
    user_dir.mkdir(exist_ok=True)

    ext = Path(file.filename).suffix.lower()
    stored_name = f"{uuid.uuid4()}{ext}"
    full_path = user_dir / stored_name

    content = await file.read()
    full_path.write_bytes(content)

    supabase.table("files").insert({
        "user_id": user_id,
        "filename": file.filename,
        "stored_name": stored_name,
        "size_bytes": len(content)
    }).execute()

    return {"message": "uploaded"}
