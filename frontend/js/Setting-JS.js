document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user_id");

    if (!token || !userId) {
        alert("Kamu harus login terlebih dahulu.");
        window.location.href = "/frontend/login.html";
        return;
    }

    fetchUserData(userId, token); // panggil data user
});

// Fungsi untuk ambil data user berdasarkan user_id
function fetchUserData(userId, token) {
    fetch(`http://localhost:5000/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            const user = data.user;
            document.getElementById('name').value = user.name;
            document.getElementById('email').value = user.email;
            document.getElementById('phone').value = user.phone_number;
        } else {
            alert("Gagal memuat data pengguna.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat memuat data pengguna.");
    });
}

// Handle update data user
document.getElementById("settingsForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("Kamu harus login terlebih dahulu.");
        return;
    }

    const updatedData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone_number: document.getElementById("phone").value
    };

    fetch("http://localhost:5000/users/me", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Data berhasil diperbarui.");
    })
    .catch(error => {
        console.error("Error saat update:", error);
        alert("Gagal menyimpan perubahan.");
    });
});

document.getElementById('history-btn').addEventListener('click', function() {
    window.location.href = 'ReportHistory.html';
})
