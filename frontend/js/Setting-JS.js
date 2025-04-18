document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('Anda harus login untuk mengakses halaman ini.');
        window.location.href = 'login.html';
    } else {
        fetchUserData(token);
    }
});

function fetchUserData(token) {
    fetch(`http://localhost:5000/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Fetched Data:', data);
        document.getElementById('name').value = data.name;
        document.getElementById('email').value = data.email;
        document.getElementById('phone').value = data.phone_number;
    })
    .catch(error => {
        console.error('Gagal memuat data pengguna:', error);
        alert('Terjadi kesalahan saat memuat data pengguna.');
    });
}

document.getElementById('settingsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const token = sessionStorage.getItem('token');

    const updatedData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone_number: document.getElementById('phone').value
    };

    fetch(`http://localhost:5000/users/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (response.ok) {
            alert('Perubahan berhasil disimpan.');
        } else {
            throw new Error('Gagal menyimpan perubahan.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menyimpan perubahan.');
    });
});
