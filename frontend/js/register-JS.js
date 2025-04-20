document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

    if (!emailRegex.test(email)) {
      alert("Email harus menggunakan domain @gmail.com");
      return;
    }

    if (!strongPasswordRegex.test(password)) {
      alert("Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.");
      return;
    }

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registrasi berhasil!");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Gagal mendaftar");
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    }
  });

  document.getElementById("googleRegister").addEventListener("click", () => {
    window.location.href = "http://localhost:5000/auth/google";
  });
