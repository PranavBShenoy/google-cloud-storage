from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
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
# AUTH VERIFY
# -----------------------

def get_user_id(auth_header: str | None):
    if not auth_header:
        return None

    parts = auth_header.split(" ")
    if len(parts) != 2:
        return None

    token = parts[1]

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
# UPLOAD (Supabase Storage)
# -----------------------

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), authorization: str = Header(None)):

    user_id = get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401)

    ext = file.filename.split(".")[-1]
    stored_name = f"{uuid.uuid4()}.{ext}"

    content = await file.read()

    supabase.storage.from_("files").upload(
        f"{user_id}/{stored_name}",
        content,
        {"content-type": file.content_type}
    )

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
# DOWNLOAD (SIGNED URL)
# -----------------------

@app.get("/download/{name}")
async def download_file(name: str, authorization: str = Header(None)):

    user_id = get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401)

    res = supabase.storage.from_("files").create_signed_url(
        f"{user_id}/{name}", 60
    )

    return {"url": res["signedURL"]}

# -----------------------
# DELETE
# -----------------------

@app.delete("/delete/{name}")
async def delete_file(name: str, authorization: str = Header(None)):

    user_id = get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401)

    supabase.storage.from_("files").remove([f"{user_id}/{name}"])

    supabase.table("files") \
        .delete() \
        .eq("stored_name", name) \
        .execute()

    return {"message": "deleted"}
