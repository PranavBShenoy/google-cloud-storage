from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from supabase import create_client
from pathlib import Path
import requests
import uuid

app = FastAPI()

# -----------------------
# CORS
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# SUPABASE CONFIG
# -----------------------
SUPABASE_URL = "https://ayqafhdzjjhnptoycbji.supabase.co"

SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# -----------------------
# STORAGE
# -----------------------
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# -----------------------
# AUTH VERIFY
# -----------------------
def get_user_id(auth_header: str | None):

    if not auth_header:
        return None

    token = auth_header.replace("Bearer ", "")

    r = requests.get(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": SUPABASE_ANON_KEY
        }
    )

    if r.status_code != 200:
        return None

    return r.json()["id"]


# -----------------------
# UPLOAD FILE
# -----------------------
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):

    user_id = get_user_id(authorization)

    if not user_id:
        raise HTTPException(status_code=401)

    user_folder = UPLOAD_DIR / user_id
    user_folder.mkdir(exist_ok=True)

    ext = Path(file.filename).suffix
    stored_name = f"{uuid.uuid4()}{ext}"

    path = user_folder / stored_name

    content = await file.read()

    with open(path, "wb") as f:
        f.write(content)

    supabase.table("files").insert({
        "user_id": user_id,
        "filename": file.filename,
        "stored_name": stored_name,
        "size_bytes": len(content)
    }).execute()

    return {"message": "uploaded"}


# -----------------------
# LIST FILES
# -----------------------
@app.get("/files")
async def get_files(authorization: str = Header(None)):

    user_id = get_user_id(authorization)

    if not user_id:
        raise HTTPException(status_code=401)

    res = supabase.table("files") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()

    return res.data


# -----------------------
# DOWNLOAD
# -----------------------
@app.get("/download/{name}")
async def download_file(name: str):

    for folder in UPLOAD_DIR.iterdir():

        path = folder / name

        if path.exists():
            return FileResponse(path)

    raise HTTPException(status_code=404)


# -----------------------
# DELETE
# -----------------------
@app.delete("/delete/{name}")
async def delete_file(name: str, authorization: str = Header(None)):

    user_id = get_user_id(authorization)

    if not user_id:
        raise HTTPException(status_code=401)

    path = UPLOAD_DIR / user_id / name

    if path.exists():
        path.unlink()

    supabase.table("files") \
        .delete() \
        .eq("stored_name", name) \
        .execute()

    return {"message": "deleted"}
