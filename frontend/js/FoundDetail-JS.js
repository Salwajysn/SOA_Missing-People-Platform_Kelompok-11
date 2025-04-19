console.log("FoundDetail-JS.js loaded");

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
    const foundId = urlParams.get('found_id')
    console.log("foundID dari URL:", foundId);
  
    if (!foundId) {
      document.getElementById('detailContainer').innerText = 'Data tidak ditemukan.';
    } else {
        console.log("Mulai fetch detail...");
        fetch(`http://localhost:5000/found-persons/${foundId}`)
        .then(res => res.json())
        .then(data => {
          console.log("Data dari server:", data);
          const person = Array.isArray(data) ? data[0] : data;
  
          document.getElementById("detailContainer").innerHTML = `
            <div class="detail-card">
              <div class="detail-img">
                <img src="http://localhost:5000/${person.photo_url}" alt="Foto orang ditemukan">
              </div>
              <div class="detail-info">
                <p><strong>Lokasi:</strong> ${person.found_location}</p>
                <p><strong>Tanggal Ditemukan:</strong> ${new Date(person.found_date).toLocaleDateString('id-ID')}</p>
                <p><strong>Deskripsi:</strong> ${person.description}</p>
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
const foundId = urlParams.get("found_id");

// Handle Form Submit
const form = document.getElementById("reportForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const description = document.getElementById("description").value;
    const relationship = document.getElementById("relationship").value;
    const fileInput = document.getElementById("evidence");
    const file = fileInput.files[0];

    if (!file || !description || !relationship) {
      alert("Lengkapi semua data terlebih dahulu!");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("found_id", foundId);
    formData.append("description", description);
    formData.append("relationship", relationship);
    formData.append("photo", file);

    // Debug isi formData
    console.log("FormData yang akan dikirim:");
    console.log("user_id:", userId);
    console.log("found_id:", foundId);
    console.log("description:", description);
    console.log("relationship:", relationship);
    console.log("photo:", file);

    try {
      const response = await fetch("http://localhost:5000/claims", {
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

