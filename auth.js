const SUPABASE_URL = "https://ayqafhdzjjhnptoycbji.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWFmaGR6ampobnB0b3ljYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjQyNjQsImV4cCI6MjA4NzYwMDI2NH0.qHJkU3y-MmQzu22UvMVDASaK0a3Fi3ytImS3XZFtWRA";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

async function signup() {
  const name = document.getElementById("signup_name").value;
  const email = document.getElementById("signup_email").value;
  const pass = document.getElementById("signup_pass").value;

  const { error } = await sb.auth.signUp({
    email,
    password: pass,
    options: { data: { name } }
  });

  document.getElementById("msg").innerText =
  error ? error.message : "Signup success. Check email.";
}

async function login() {
  const email = document.getElementById("login_email").value;
  const pass = document.getElementById("login_pass").value;

  const { error } = await sb.auth.signInWithPassword({
    email,
    password: pass
  });

  if (error) {
    document.getElementById("msg").innerText = error.message;
    return;
  }

  // ✅ DO NOT store token manually
  // Supabase already stores session internally

  window.location.href = "dashboard.html";
}
