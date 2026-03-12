const SUPABASE_URL = "https://ayqafhdzjjhnptoycbji.supabase.co"
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON)

let filesCache = []

async function loadUser() {

const { data: { user } } = await sb.auth.getUser()

if (!user) {
window.location.href = "login.html"
return
}

const name = user.user_metadata?.name || user.email
document.getElementById("name").innerText = name

loadFiles()
}

async function logout() {
await sb.auth.signOut()
window.location.href = "login.html"
}

function goUpload(){
window.location.href = "upload.html"
}

async function loadFiles(){

const { data } = await sb.auth.getSession()
const token = data.session.access_token

const res = await fetch("http://127.0.0.1:9000/files",{
headers:{
Authorization:"Bearer "+token
}
})

const files = await res.json()

filesCache = files

renderFiles(files)

}

function renderFiles(files){

const table = document.getElementById("filesTable")

if(!table) return

table.innerHTML = ""

files.forEach(file=>{

const row = document.createElement("tr")

row.innerHTML = `
<td>${file.filename}</td>
<td>${(file.size_bytes/1024).toFixed(1)} KB</td>

<td>

<button onclick="downloadFile('${file.stored_name}')">
Download
</button>

<button onclick="deleteFile('${file.stored_name}')">
Delete
</button>

<button onclick="shareFile('${file.stored_name}')">
Share
</button>

</td>
`

table.appendChild(row)

})

}

function filterFiles(){

const q = document.getElementById("search").value.toLowerCase()

const filtered = filesCache.filter(f =>
f.filename.toLowerCase().includes(q)
)

renderFiles(filtered)

}

function downloadFile(name){

window.open(`http://127.0.0.1:9000/download/${name}`)

}

async function deleteFile(name){

if(!confirm("Delete file?")) return

const { data } = await sb.auth.getSession()
const token = data.session.access_token

await fetch(`http://127.0.0.1:9000/delete/${name}`,{
method:"DELETE",
headers:{
Authorization:"Bearer "+token
}
})

loadFiles()

}

function shareFile(name){

const link = `http://127.0.0.1:9000/download/${name}`

const whatsapp = `https://wa.me/?text=${encodeURIComponent(link)}`

window.open(whatsapp)

}

loadUser()