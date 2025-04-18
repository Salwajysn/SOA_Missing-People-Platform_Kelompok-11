const missingPersonForm = document.getElementById('missing-person-form');
const foundPersonForm = document.getElementById('found-person-form');

const missingPersonFormBtn = document.getElementById('missing-person-form-btn');
const foundPersonFormBtn = document.getElementById('found-person-form-btn');

document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Kamu harus login terlebih dahulu.');
    window.location.href = '/frontend/login.html';
    return;
  }

  missingPersonForm.classList.remove('hidden');
  foundPersonForm.classList.add('hidden');

  missingPersonFormBtn.classList.add('sidebar-btn-active');
  foundPersonFormBtn.classList.remove('sidebar-btn-active');
});

missingPersonFormBtn.addEventListener('click', function () {
  missingPersonForm.classList.remove('hidden');
  foundPersonForm.classList.add('hidden');

  missingPersonFormBtn.classList.add('sidebar-btn-active');
  foundPersonFormBtn.classList.remove('sidebar-btn-active');

  foundPersonForm.reset();
});

foundPersonFormBtn.addEventListener('click', function () {
  foundPersonForm.classList.remove('hidden');
  missingPersonForm.classList.add('hidden');

  foundPersonFormBtn.classList.add('sidebar-btn-active');
  missingPersonFormBtn.classList.remove('sidebar-btn-active');

  missingPersonForm.reset();
});;

document.getElementById('missing-person-img').addEventListener('change', function () {
  const photoPreview = document.getElementById('missing-person-preview');
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      photoPreview.src = e.target.result;
      photoPreview.classList.remove('hidden'); // tampilkan gambar
    }

    reader.readAsDataURL(file); // konversi file jadi base64
  } else {
    photoPreview.src = "#";
    photoPreview.classList.add('hidden'); // sembunyikan gambar jika batal pilih
  }
})

document.getElementById('found-person-img').addEventListener('change', function () {
  const photoPreview = document.getElementById('found-person-preview');
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      photoPreview.src = e.target.result;
      photoPreview.classList.remove('hidden'); // tampilkan gambar
    }

    reader.readAsDataURL(file); // konversi file jadi base64
  } else {
    photoPreview.src = "#";
    photoPreview.classList.add('hidden'); // sembunyikan gambar jika batal pilih
  }
})

document.getElementById('missing-person-form').addEventListener('submit', async function (e) {
  try{
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const missingPersonData = {
      full_name: formData.get('full_name'),
      age: formData.get('age'),
      gender: formData.get('gender'),
      height: formData.get('height'),
      weight: formData.get('weight'),
      last_seen_location: formData.get('last_seen_location'),
      last_seen_date: formData.get('last_seen_date'),
      photo_url: formData.get('photo_url')
    };

    // debug
    console.log(missingPersonData);
    
    const token = sessionStorage.getItem('token');
    const missingPersonResult = await axios.post('http://localhost:5000/missing-persons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    //debug
    console.log(missingPersonResult.data);
    alert(missingPersonResult.data.message);
  }catch (error) {
    if (error.response) {
      console.error('Server responded with an error:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      alert(`Error ${error.response.status}: ${error.response.data.error || 'Terjadi kesalahan pada server.'}`);
    } else if (error.request) {
      console.error('No response received from server.');
      console.error(error.request);
      alert('Tidak ada respon dari server. Pastikan server berjalan.');
    } else {
      console.error('Error setting up request:', error.message);
      alert(`Request error: ${error.message}`);
    }
  }
});

document.getElementById('found-person-form').addEventListener('submit', async function (e) {
  try{
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // found_location, found_date, description
    const foundPersonData = {
      found_location: formData.get('found_location'),
      found_date: formData.get('found_date'),
      description: formData.get('description'),
      photo_url: formData.get('photo_url'),
    };

    // debug
    console.log(foundPersonData);
    
    const token = sessionStorage.getItem('token');
    const foundPersonResult = await axios.post('http://localhost:5000/found-persons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    //debug
    console.log(foundPersonResult.data);
    alert(foundPersonResult.data.message);
  }catch (error) {
    if (error.response) {
      console.error('Server responded with an error:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      alert(`Error ${error.response.status}: ${error.response.data.error || 'Terjadi kesalahan pada server.'}`);
    } else if (error.request) {
      console.error('No response received from server.');
      console.error(error.request);
      alert('Tidak ada respon dari server. Pastikan server berjalan.');
    } else {
      console.error('Error setting up request:', error.message);
      alert(`Request error: ${error.message}`);
    }
  }
});