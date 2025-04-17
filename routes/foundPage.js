document.addEventListener("DOMContentLoaded", async () => {
    const foundContainer = document.getElementById("found-container");
  
    // Fungsi untuk fetch data dari API
    async function fetchFoundPersons() {
      try {
        const response = await axios.get("http://localhost:3000/api/found");
        return response.data; // Pastikan API mengembalikan array data
      } catch (error) {
        console.error("Error fetching found persons:", error);
        return [];
      }
    }
  
    // Fungsi untuk render kartu
    function renderCards(data) {
      const cardsContainer = document.createElement("div");
      cardsContainer.classList.add("found-cards");
  
      data.forEach(person => {
        const card = document.createElement("div");
        card.classList.add("person-card");
  
        card.innerHTML = `
          <img src="${person.photo_url || 'img/user.png'}" alt="person">
          <h4>${person.found_id}</h4>
          <p><strong>Ditemukan di:</strong> ${person.found_location}</p>
          <p><strong>Pada:</strong> ${person.found_date}</p>
          <p><strong>Status:</strong> ${person.status}</p>
          <p><strong>Deskripsi:</strong> ${person.description || 'Tidak ada deskripsi.'}</p>
        `;
  
        card.addEventListener("click", () => openModal(person));
        cardsContainer.appendChild(card);
      });
  
      foundContainer.innerHTML = ""; // Clear existing content
      foundContainer.appendChild(cardsContainer);
    }
  
    // Fungsi untuk membuka modal
    function openModal(person) {
      const modal = document.getElementById("person-modal");
      document.getElementById("modal-name").innerText = person.found_id;
      document.getElementById("modal-age").innerText = "N/A"; // Ganti jika ada data umur
      document.getElementById("modal-gender").innerText = "N/A"; // Ganti jika ada data gender
      document.getElementById("modal-location").innerText = person.found_location;
      document.getElementById("modal-date").innerText = person.found_date;
      document.getElementById("modal-status").innerText = person.status;
      document.getElementById("modal-description").innerText = person.description || "Tidak ada deskripsi.";
      modal.style.display = "block";
    }
  
    // Fetch dan render kartu
    const data = await fetchFoundPersons();
    renderCards(data);
  });
  
