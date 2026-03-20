const SUPABASE_URL = "https://ayqafhdzjjhnptoycbji.supabase.co"
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON)

let files = []
let currentFolder = "root"

const input = document.getElementById("fileInput")
const list = document.getElementById("fileList")
const uploadBtn = document.getElementById("uploadBtn")
const folderInput = document.getElementById("folderInput")

folderInput.addEventListener("input", e => {
    currentFolder = e.target.value || "root"
})

input.addEventListener("change", e => {
    files = files.concat(Array.from(e.target.files))
    renderFiles()
})

function renderFiles() {
    list.innerHTML = ""
    files.forEach((file, i) => {
        const div = document.createElement("div")
        div.innerHTML = `${file.name} <button onclick="removeFile(${i})">❌</button>`
        list.appendChild(div)
    })
}

function removeFile(i) {
    files.splice(i, 1)
    renderFiles()
}

uploadBtn.addEventListener("click", uploadFiles)

async function uploadFiles() {

    const { data: { session } } = await sb.auth.getSession()
    const token = session.access_token

    for (const file of files) {

        const formData = new FormData()
        formData.append("file", file)
            formData.append("folder", currentFolder)

                await fetch("https://google-cloud-storage-77cv.onrender.com/upload", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                })
    }

    alert("Uploaded")
    window.location.href = "dashboard.html"
}
