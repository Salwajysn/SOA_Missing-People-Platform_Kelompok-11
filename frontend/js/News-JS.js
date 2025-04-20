const API_URL = 'http://localhost:5000/news';
const PLACEHOLDER_IMAGE = 'img/placeholder2.png';

let allNewsData = [];
let currentPageMap = {
  'all-news': 1,
  'missing-news': 1,
  'found-news': 1
};
const itemsPerPage = 6;
let currentTab = 'all-news';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await axios.get(API_URL);
    allNewsData = response.data;

    renderCurrentTab();
    renderHotNews(allNewsData);
    handleTabs(allNewsData);
  } catch (error) {
    console.error('Error fetching news:', error);
  }
});

// Search Bar
document.getElementById('search-input').addEventListener('input', () => {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filtered = allNewsData.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    );
    currentPageMap[currentTab] = 1; // Reset halaman ke 1 saat search
    const section = document.getElementById(currentTab);
    renderCards(filtered, 1, section);
  });

function renderCurrentTab() {
  const section = document.getElementById(currentTab);
  section.classList.remove('hidden');

  const filteredData = filterDataByTab(currentTab);
  renderCards(filteredData, currentPageMap[currentTab], section);
}

function filterDataByTab(tabName) {
  if (tabName === 'missing-news') return allNewsData.filter(n => n.category === 'missing');
  if (tabName === 'found-news') return allNewsData.filter(n => n.category === 'found');
  return allNewsData;
}

function renderCards(newsData, page = 1, sectionElement) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = newsData.slice(start, end);

  const cards = pageItems.map(item => `
    <div class="news-card" onclick="openModal('${encodeURIComponent(JSON.stringify(item))}')">
      <!-- Gunakan item.image_url untuk menampilkan gambar -->
      <img src="http://localhost:5000/${item.image_url}" alt="${item.title}">
      <div class="news-info">
        <h3>${item.title}</h3>
        <p>${item.description.slice(0, 80)}...</p>
        <span class="author">By: ${item.author}</span>
        <span class="date">${new Date(item.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');

  sectionElement.innerHTML = `
    <div class="card-grid">
      ${cards}
    </div>
    <div class="pagination" id="pagination-${sectionElement.id}"></div>
  `;

  renderPagination(newsData.length, page, sectionElement.id);
}

function renderPagination(totalItems, page, tabKey) {
  const pagination = document.getElementById(`pagination-${tabKey}`);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  pagination.innerHTML = '';

  const prevButton = `<button ${page === 1 ? 'disabled' : ''} onclick="changePage('${tabKey}', ${page - 1})">Previous</button>`;
  const nextButton = `<button ${page === totalPages ? 'disabled' : ''} onclick="changePage('${tabKey}', ${page + 1})">Next</button>`;

  pagination.innerHTML = `${prevButton} <span>Halaman ${page} dari ${totalPages}</span> ${nextButton}`;
}

function changePage(tab, newPage) {
  currentPageMap[tab] = newPage;
  const section = document.getElementById(tab);
  const filteredData = filterDataByTab(tab);
  renderCards(filteredData, newPage, section);
}

function renderHotNews(newsData) {
  const container = document.getElementById('hot-news-list');
  container.innerHTML = ''; // kosongkan jika tidak ingin menampilkan
}

function handleTabs(allData) {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      sections.forEach(s => s.classList.add('hidden'));

      currentTab = btn.dataset.tab;
      renderCurrentTab();
    });
  });
}

// Modal
window.openModal = function (dataString) {
  const data = JSON.parse(decodeURIComponent(dataString));
  document.getElementById('modal-image').src = `http://localhost:5000/${data.image_url}`;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-author-date').textContent = `By: ${data.author || 'Unknown'} • ${new Date(data.created_at).toLocaleDateString()}`;
  document.getElementById('modal-description').textContent = data.description;

  document.getElementById('newsModal').classList.remove('hidden');
};

window.closeModal = function () {
  document.getElementById('newsModal').classList.add('hidden');
};

// Fungsi untuk membuka modal tambah berita
function openAddNewsModal() {
  document.getElementById('addNewsModal').classList.remove('hidden');
}

// Fungsi untuk menutup modal tambah berita
function closeAddNewsModal() {
  document.getElementById('addNewsModal').classList.add('hidden');
}

// Fungsi untuk menambahkan news baru ke database dan muncul di halaman News
async function submitNewNews() {
  const title = document.getElementById('new-title').value.trim();
  const author = document.getElementById('new-author').value.trim();
  const category = document.getElementById('new-category').value;
  const description = document.getElementById('new-description').value.trim();
  const image_url = document.getElementById('new-image').files[0]; // Ambil file gambar

  // Pastikan file gambar ada dan memiliki ekstensi yang valid
  if (!image_url) {
    alert('Harap pilih gambar.');
    return;
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(image_url.type)) {
    alert('Harap pilih gambar dengan format JPG, PNG, atau GIF.');
    return;
  }

  // Validasi data
  if (!title || !author || !category || !image_url || !description) {
    alert("Semua field harus diisi.");
    return;
  }

  const token = sessionStorage.getItem('token'); // Ambil token dari sessionStorage
  const userId = sessionStorage.getItem("user_id");


  if (!token) {
    alert('Anda perlu login untuk menambahkan berita.');
    window.location.href = 'login.html';  // Redirect ke halaman login
    return;
  }  

console.log("Token yang dikirim:", token); // Log token untuk memeriksa apakah benar ada

  const formData = new FormData();
  formData.append('title', title);
  formData.append('author', author);
  formData.append('category', category);
  formData.append('description', description);
  formData.append('image_url', image_url); // Pastikan gambar ada dalam formData
  console.log("FormData yang dikirim:", formData); // Log FormData untuk memeriksa isinya

  try {
    const response = await axios.post('http://localhost:5000/news', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Mengatur agar server tahu ini adalah form data
        Authorization: `Bearer ${token}` // Menambahkan token pada header
      }
    });

    alert('Berita berhasil ditambahkan.');
    location.reload(); // Reload halaman setelah berita berhasil ditambahkan
  } catch (err) {
    console.error('Error submitting news:', err);
    alert('Gagal menambahkan berita.');
  }
}


// Fungsi untuk menampilkan preview gambar yang dipilih
function previewImage() {
  const file = document.getElementById('new-image').files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const imagePreview = document.getElementById('image-preview');
    imagePreview.src = event.target.result;
    imagePreview.style.display = 'block';  // Menampilkan gambar setelah dipilih
  }
  
  if (file) {
    reader.readAsDataURL(file);  // Membaca file gambar
  }
}
