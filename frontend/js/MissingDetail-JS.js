console.log("MissingDetail-JS.js loaded");

// Pastikan user login terlebih dahulu
document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("user_id");

  if (!token || !userId) {
    alert("Kamu harus login terlebih dahulu.");
    window.location.href = "/frontend/login.html";
    return;
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const missingId = urlParams.get('missing_id')
    console.log("Missing ID dari URL:", missingId);
  
    if (!missingId) {
      document.getElementById('detailContainer').innerText = 'Data tidak ditemukan.';
    } else {
      fetch(`http://localhost:5000/missing-persons/${missingId}`)
        .then(res => res.json())
        .then(data => {
          console.log("Data dari server:", data);
          const person = Array.isArray(data) ? data[0] : data;
          document.getElementById('detailContainer').innerHTML = `
          <div class="detail-card">
            <div class="detail-img">
              <img src="http://localhost:5000/${person.photo_url}" alt="${person.full_name}">
            </div>
            <div class="detail-info">
              <h2>${person.full_name}</h2>
              <p><strong>Usia:</strong> ${person.age}</p>
              <p><strong>Jenis Kelamin:</strong> ${person.gender}</p>
              <p><strong>Tinggi Badan:</strong> ${person.height}</p>
              <p><strong>Berat Badan:</strong> ${person.weight}</p>
              <p><strong>Lokasi Terakhir:</strong> ${person.last_seen_location}</p>
              <p><strong>Tanggal Hilang:</strong> ${new Date(person.last_seen_date).toLocaleDateString('id-ID')}</p>
              <p><strong>Laporan Dibuat:</strong> ${new Date(person.created_at).toLocaleDateString('id-ID')}</p>
              <p><strong>Status:</strong> <span class="status-${person.status.toLowerCase()}">${person.status}</span></p>
            </div>
          </div>
        `;
        })
        .catch(error => {
          console.error("Gagal fetch detail:", error);
          document.getElementById('detailContainer').innerText = 'Gagal memuat data.';
        });
    }
  });


const token = sessionStorage.getItem("token");
const userId = sessionStorage.getItem("user_id");

// Ambil ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const missingId = urlParams.get("missing_id");

const form = document.getElementById("reportForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const fileInput = document.getElementById("evidence");
  const file = fileInput.files[0];

  if (!file || !description) {
    alert("Lengkapi semua data terlebih dahulu!");
    return;
  }

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("missing_id", missingId);
  formData.append("description", description);
  formData.append("photo", file);

  // Debug isi formData
  console.log("FormData yang akan dikirim:");
  console.log("user_id:", userId);
  console.log("missing_id:", missingId);
  console.log("description:", description);
  console.log("photo:", file);

  try {
    const response = await fetch("http://localhost:5000/reports", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log("Laporan berhasil dikirim:", responseData);
      alert("Laporan berhasil dikirim!");
      form.reset();
    } else {
      const errorData = await response.json();
      console.error("Server Error:", errorData);
      alert("Gagal kirim laporan: " + (errorData.message || "Terjadi kesalahan."));
    }
  } catch (err) {
    console.error("Error submitting report:", err);
    alert("Terjadi kesalahan saat mengirim laporan.");
  }
});
