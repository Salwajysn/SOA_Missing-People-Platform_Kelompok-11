const ageRange = document.getElementById('ageRange');
const ageValue = document.getElementById('ageValue');

ageRange.addEventListener('input', () => {
  ageValue.textContent = ageRange.value;
});
ageValue.textContent = ageRange.value;

async function fetchFoundPersons() {
  try {
    const response = await fetch("http://localhost:5000/found-persons");
    const data = await response.json();
    const container = document.getElementById("foundPersonsList");
    container.innerHTML = "";

    data.forEach((person) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="http://localhost:5000/${person.photo_url}">
        <p><strong>Lokasi:</strong> ${person.found_location}</p>
        <p><strong>Tanggal Ditemukan:</strong> ${new Date(person.found_date).toISOString().split('T')[0]}</p>
        <p><strong>Deskripsi:</strong> ${person.description}</p>
        <p>Status: <strong>${person.status}</strong></p>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching found persons:", error);
  }
}

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

function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('name');
  window.location.reload();
}

fetchFoundPersons();
