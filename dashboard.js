const SUPABASE_URL="https://ayqafhdzjjhnptoycbji.supabase.co"
const SUPABASE_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"

const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON)

let filesCache=[]

async function loadUser(){
    const {data:{user}}=await sb.auth.getUser()

    if(!user){
        window.location.href="login.html"
        return
    }

    document.getElementById("name").innerText=user.email
    loadFiles()
}

async function logout(){
    await sb.auth.signOut()
    window.location.href="login.html"
}

function goUpload(){
    window.location.href="upload.html"
}

async function loadFiles(){

    const {data}=await sb.auth.getSession()
    const token=data.session.access_token

    const res=await fetch(
        "https://google-cloud-storage-77cv.onrender.com/files",
        {
            headers:{Authorization:"Bearer "+token}
        }
    )

    const files=await res.json()
    filesCache=files
    renderFiles(files)
}

function shorten(name){
    if(name.length<20) return name
        return name.substring(0,17)+"..."
}

function renderFiles(files){

    const grid=document.getElementById("filesGrid")
    grid.innerHTML=""

    files.forEach(file=>{

        const card=document.createElement("div")
        card.className="card"

        card.innerHTML=`
        <p title="${file.filename}">
        ${shorten(file.filename)}
        </p>

        <div class="actions">
        <button onclick="downloadFile('${file.stored_name}')">Download</button>
        <button onclick="deleteFile('${file.stored_name}')">Delete</button>
        <button onclick="shareFile('${file.stored_name}')">Share</button>
        </div>
        `

        grid.appendChild(card)
    })
}

function filterFiles(){
    const q=document.getElementById("search").value.toLowerCase()
    const filtered=filesCache.filter(f =>
    f.filename.toLowerCase().includes(q)
    )
    renderFiles(filtered)
}

async function downloadFile(name){

    const {data}=await sb.auth.getSession()
    const token=data.session.access_token

    const res=await fetch(
        `https://google-cloud-storage-77cv.onrender.com/download/${name}`,
        {
            headers:{Authorization:"Bearer "+token}
        }
    )

    const dataRes=await res.json()
    window.location.href=dataRes.url
}

async function deleteFile(name){

    if(!confirm("Delete file?")) return

        const {data}=await sb.auth.getSession()
        const token=data.session.access_token

        await fetch(
            `https://google-cloud-storage-77cv.onrender.com/delete/${name}`,
            {
                method:"DELETE",
                headers:{Authorization:"Bearer "+token}
            }
        )

        loadFiles()
}

async function shareFile(name){

    const {data}=await sb.auth.getSession()
    const token=data.session.access_token

    const res=await fetch(
        `https://google-cloud-storage-77cv.onrender.com/download/${name}`,
        {
            headers:{Authorization:"Bearer "+token}
        }
    )

    const dataRes=await res.json()

    navigator.clipboard.writeText(dataRes.url)
    alert("Link copied!")
}

loadUser()
