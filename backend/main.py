from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import requests
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# -----------------------
# CORS
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://google-cloud-storage-sand.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# SUPABASE
# -----------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# -----------------------
# AUTH
# -----------------------
def get_user_id(auth_header):
    if not auth_header:
        return None
    token = auth_header.split(" ")[1]

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
# UPLOAD
# -----------------------
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form(None),
    authorization: str = Header(None)
):
    user_id = get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401)

    if not folder:
        folder = "root"

    ext = file.filename.split(".")[-1]
    stored_name = f"{uuid.uuid4()}.{ext}"

    content = await file.read()
    path = f"{user_id}/{folder}/{stored_name}"

    # ✅ upload
    res = supabase.storage.from_("files").upload(
        path,
        content,
        {"content-type": file.content_type}
    )

    # ❗ CRITICAL FIX
    if isinstance(res, dict) and res.get("error"):
        raise HTTPException(status_code=500, detail=res["error"])

    # save DB
    supabase.table("files").insert({
        "user_id": user_id,
        "filename": file.filename,
        "stored_name": stored_name,
        "folder": folder,
        "size_bytes": len(content)
    }).execute()

    return {"message": "uploaded"}

# -----------------------
# FILES
# -----------------------
@app.get("/files")
async def get_files(folder: str = "root", authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401)

    res = supabase.table("files") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("folder", folder) \
        .execute()

    return res.data

# -----------------------
# DOWNLOAD
# -----------------------
@app.get("/download/{name}")
async def download_file(name: str, folder: str = "root", authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401)

    path = f"{user_id}/{folder}/{name}"

    try:
        res = supabase.storage.from_("files").create_signed_url(path, 60)
        return {"url": res["signedURL"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------
# DELETE
# -----------------------
@app.delete("/delete/{name}")
async def delete_file(name: str, folder: str = "root", authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401)

    path = f"{user_id}/{folder}/{name}"

    supabase.storage.from_("files").remove([path])

    supabase.table("files") \
        .delete() \
        .eq("stored_name", name) \
        .execute()

    return {"message": "deleted"}
