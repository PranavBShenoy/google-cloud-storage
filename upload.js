// Supabase client (shared)
const supabaseClient = window.supabase.createClient(
  "https://ayqafhdzjjhnptoycbji.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA"
);

// Button binding
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("uploadBtn").addEventListener("click", uploadFile);
});

async function uploadFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Select file");

  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) return alert("Not logged in");

  const token = data.session.access_token;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:9000/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: formData,
  });

  const text = await res.text();
  if (!res.ok) return alert("Upload failed: " + text);

  alert("Uploaded ✅");
}
