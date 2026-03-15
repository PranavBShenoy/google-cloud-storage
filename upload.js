const SUPABASE_URL = "https://ayqafhdzjjhnptoycbji.supabase.co"
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON)

let files = []

const drop = document.getElementById("drop")
const input = document.getElementById("fileInput")
const list = document.getElementById("fileList")
const uploadBtn = document.getElementById("uploadBtn")

document.addEventListener("dragover", e => e.preventDefault())
document.addEventListener("drop", e => e.preventDefault())

input.addEventListener("change", e => {
    const selected = Array.from(e.target.files)
    files = files.concat(selected)
    renderFiles()
})

drop.addEventListener("dragover", e => {
    e.preventDefault()
    drop.style.borderColor = "#22c55e"
})

drop.addEventListener("dragleave", () => {
    drop.style.borderColor = "#38bdf8"
})

drop.addEventListener("drop", e => {
    e.preventDefault()

    const dropped = Array.from(e.dataTransfer.files)

    files = files.concat(dropped)

    renderFiles()

    drop.style.borderColor = "#38bdf8"
})

function renderFiles() {

    list.innerHTML = ""

    files.forEach((file, i) => {

        const div = document.createElement("div")
        div.className = "file"

        div.innerHTML = `
        <span>${file.name} ${(file.size / 1024).toFixed(1)} KB</span>
        <button onclick="removeFile(${i})">❌</button>
        `

        list.appendChild(div)

    })
}

function removeFile(i) {
    files.splice(i, 1)
    renderFiles()
}

uploadBtn.addEventListener("click", uploadFiles)

async function uploadFiles() {

    if (files.length === 0) {
        alert("Select files first")
        return
    }

    // get current session
    const { data: { session } } = await sb.auth.getSession()

    if (!session) {
        alert("Login expired. Please login again.")
        window.location.href = "login.html"
        return
    }

    const token = session.access_token

    try {

        for (const file of files) {

            const formData = new FormData()
            formData.append("file", file)

                const res = await fetch("https://google-cloud-storage-77cv.onrender.com/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                })

                if (!res.ok) {

                    const err = await res.text()
                    console.error("Upload error:", err)

                    alert("Upload failed")
                    return
                }

        }

        alert("Upload successful")
        window.location.href = "dashboard.html"

    } catch (err) {

        console.error(err)
        alert("Upload failed")

    }
}
