const SUPABASE_URL = "https://ayqafhdzjjhnptoycbji.supabase.co"
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON)

let files = []
let currentFolder = "root"

const input = document.getElementById("fileInput")
const list = document.getElementById("fileList")
const uploadBtn = document.getElementById("uploadBtn")
const folderInput = document.getElementById("folderInput")

// ✅ folder handling
folderInput.addEventListener("input", e => {
    currentFolder = e.target.value.trim() || "root"
})

// ✅ file select
input.addEventListener("change", e => {
    files = files.concat(Array.from(e.target.files))
    renderFiles()
})

// ✅ render files
function renderFiles() {
    list.innerHTML = ""

    files.forEach((file, i) => {
        const div = document.createElement("div")
        div.className = "file"

        div.innerHTML = `
        <span>${file.name}</span>
        <button onclick="removeFile(${i})">❌</button>
        `

        list.appendChild(div)
    })
}

// ✅ remove file
function removeFile(i) {
    files.splice(i, 1)
    renderFiles()
}

// ✅ upload
uploadBtn.addEventListener("click", uploadFiles)

async function uploadFiles() {

    if (files.length === 0) {
        alert("Select files first")
        return
    }

    const { data: { session } } = await sb.auth.getSession()

    if (!session) {
        alert("Login expired")
        window.location.href = "login.html"
        return
    }

    const token = session.access_token

    try {

        for (const file of files) {

            const formData = new FormData()
            formData.append("file", file)
                formData.append("folder", currentFolder || "root")

                    const res = await fetch(
                        "https://google-cloud-storage-77cv.onrender.com/upload",
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            body: formData
                        }
                    )

                    if (!res.ok) {
                        const err = await res.text()
                        console.error("Upload failed:", err)
                        alert("Upload failed ❌")
                        return
                    }
        }

        alert("Upload successful ✅")
        window.location.href = "dashboard.html"

    } catch (err) {
        console.error("ERROR:", err)
        alert("Something went wrong ❌")
    }
}
