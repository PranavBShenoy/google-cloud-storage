const SUPABASE_URL="https://ayqafhdzjjhnptoycbji.supabase.co"
const SUPABASE_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"

const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON)

let currentFolder="root"

// ✅ buttons FIX
function goUpload(){
    window.location.href="upload.html"
}

async function logout(){
    await sb.auth.signOut()
    window.location.href="login.html"
}

function filterFiles(){}

// ------------------------

async function loadUser(){
    const {data:{user}}=await sb.auth.getUser()

    if(!user){
        window.location.href="login.html"
        return
    }

    document.getElementById("name").innerText=user.email
    loadFiles()
}

async function loadFiles(){

    const {data}=await sb.auth.getSession()
    const token=data.session.access_token

    try {
        const res=await fetch(
            `https://google-cloud-storage-77cv.onrender.com/files?folder=${currentFolder}`,
            {
                headers:{Authorization:"Bearer "+token}
            }
        )

        const files=await res.json()

        const grid=document.getElementById("filesGrid")
        if(!grid) return

            grid.innerHTML=""

            files.forEach(file=>{
                const div=document.createElement("div")

                div.innerHTML=`
                <p>${file.filename}</p>
                <button onclick="downloadFile('${file.stored_name}')">Download</button>
                <button onclick="deleteFile('${file.stored_name}')">Delete</button>
                `

                grid.appendChild(div)
            })

    } catch(err){
        console.error("LOAD ERROR:", err)
    }
}

async function downloadFile(name){

    const {data}=await sb.auth.getSession()
    const token=data.session.access_token

    const res=await fetch(
        `https://google-cloud-storage-77cv.onrender.com/download/${name}?folder=${currentFolder}`,
        {
            headers:{Authorization:"Bearer "+token}
        }
    )

    const dataRes=await res.json()
    window.location.href=dataRes.url
}

async function deleteFile(name){

    const {data}=await sb.auth.getSession()
    const token=data.session.access_token

    await fetch(
        `https://google-cloud-storage-77cv.onrender.com/delete/${name}?folder=${currentFolder}`,
        {
            method:"DELETE",
            headers:{Authorization:"Bearer "+token}
        }
    )

    loadFiles()
}

loadUser()
