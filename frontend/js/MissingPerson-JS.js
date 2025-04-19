// Menampilkan angka usia saat slider digeser
const ageRange = document.getElementById('ageRange');
const ageValue = document.getElementById('ageValue');

ageRange.addEventListener('input', () => {
    ageValue.textContent = ageRange.value;
});
 // Nilai default
 ageValue.textContent = ageRange.value;

async function fetchMissingPersons() {
  try {
    const response = await fetch("http://localhost:5000/missing-persons");
    const data = await response.json();
    const container = document.getElementById("missingPersonsList");
    container.innerHTML = "";

    data.forEach((person) => {
      console.log(person); // ← Cek apakah ada missing_id
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="http://localhost:5000/${person.photo_url}" alt="Foto ${person.full_name}">
        <h3>${person.full_name}</h3>
        <p><strong>Usia:</strong> ${person.age} tahun</p>
        <p><strong>Jenis Kelamin:</strong> ${person.gender}</p>
        <p><strong>Terakhir terlihat:</strong> ${person.last_seen_location}</p>
        <p><strong>Pada:</strong> ${new Date(person.last_seen_date).toISOString().split('T')[0]}</p>
        <p><strong>Status:</strong>${person.status}</p>
      `;

      card.addEventListener("click", () => {
        window.location.href = `MissingDetail.html?missing_id=${person.missing_id}`;
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching missing persons:", error);
  }
}

// Cek apakah user sudah login (token & nama tersedia)
const token = sessionStorage.getItem('token');
const name = sessionStorage.getItem('name');
const userCard = document.getElementById('userCard');

if (token && name) {
userCard.innerHTML = `
  <h3 style="text-align: center; margin-bottom: 1em;">Welcome, ${name}</h3>
  <button onclick="logout()" style="width: 100%; padding: 10px; background-color: #FFB6B6; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Logout</button>
`;
} else {
userCard.innerHTML = `
  <h3 style="text-align: center; margin-bottom: 1em;">Join Finder User</h3>
  <a href="register.html">
    <button style="width: 100%; padding: 10px; background-color: #C3E4FF; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Register</button>
  </a>
  <p style="text-align: center; margin-top: 1em;">
    Already a user? <a href="login.html" style="color: #007BFF; text-decoration: none;">Login</a>
  </p>
`;
}

// Fungsi Logout
function logout() {
sessionStorage.removeItem('token');
sessionStorage.removeItem('name');
window.location.reload();
}

fetchMissingPersons();