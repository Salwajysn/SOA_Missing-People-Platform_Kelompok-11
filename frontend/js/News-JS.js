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
      <img src="${item.image_url || PLACEHOLDER_IMAGE}" alt="${item.title}">
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
  document.getElementById('modal-image').src = data.image_url || PLACEHOLDER_IMAGE;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-author-date').textContent = `By: ${data.author || 'Unknown'} • ${new Date(data.created_at).toLocaleDateString()}`;
  document.getElementById('modal-description').textContent = data.description;

  document.getElementById('newsModal').classList.remove('hidden');
};

window.closeModal = function () {
  document.getElementById('newsModal').classList.add('hidden');
};


let currentEditingNews = null;

function openModal(dataString) {
  const data = JSON.parse(decodeURIComponent(dataString));
  currentEditingNews = data;

  document.getElementById('modal-image').src = data.image_url || PLACEHOLDER_IMAGE;
  document.getElementById('modal-title').value = data.title;
  document.getElementById('modal-description').value = data.description;
  document.getElementById('modal-author-date').textContent = `By: ${data.author || 'Unknown'} • ${new Date(data.created_at).toLocaleDateString()}`;

  document.getElementById('newsModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('newsModal').classList.add('hidden');
  currentEditingNews = null;
}

async function handleUpdateNews() {
  if (!currentEditingNews) return;

  const updatedTitle = document.getElementById('modal-title').value.trim();
  const updatedDescription = document.getElementById('modal-description').value.trim();

  try {
    await axios.put(`${API_URL}/${currentEditingNews.news_id}`, {
      title: updatedTitle,
      description: updatedDescription,
      image_url: currentEditingNews.image_url,
      author: currentEditingNews.author,
      category: currentEditingNews.category
    });

    alert('Berita berhasil diperbarui.');
    location.reload();
  } catch (err) {
    console.error(err);
    alert('Gagal memperbarui berita.');
  }
}

async function handleDeleteNewsFromModal() {
  if (!currentEditingNews) return;

  const confirmDelete = confirm('Apakah Anda yakin ingin menghapus berita ini?');
  if (!confirmDelete) return;

  try {
    await axios.delete(`${API_URL}/${currentEditingNews.news_id}`);
    alert('Berita berhasil dihapus.');
    location.reload();
  } catch (err) {
    console.error(err);
    alert('Gagal menghapus berita.');
  }
}
