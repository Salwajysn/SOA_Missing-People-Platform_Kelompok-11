const missingPersonCard = document.getElementById('missing-person-card');
const foundPersonCard = document.getElementById('found-person-card');
const reportCard = document.getElementById('report-card');
const claimCard = document.getElementById('claim-card');

const missingPersonBtn = document.getElementById('missing-person-btn');
const foundPersonBtn = document.getElementById('found-person-btn');
const reportBtn = document.getElementById('report-btn');
const claimBtn = document.getElementById('claim-btn');

const user_id = localStorage.getItem("user_id");

document.addEventListener('DOMContentLoaded', missingPerson);

missingPersonBtn.addEventListener('click', missingPerson);

foundPersonBtn.addEventListener('click', foundPerson);

reportBtn.addEventListener('click', report);

claimBtn.addEventListener('click', claim);

async function missingPerson(){
    try{
        missingPersonCard.classList.remove('hidden');
        foundPersonCard.classList.add('hidden');
        reportCard.classList.add('hidden');
        claimCard.classList.add('hidden');
        
        missingPersonBtn.classList.add('sidebar-btn-active');
        foundPersonBtn.classList.remove('sidebar-btn-active');
        reportBtn.classList.remove('sidebar-btn-active');
        claimBtn.classList.remove('sidebar-btn-active');
        
        const tbody = document.getElementById("missing-person-table").getElementsByTagName("tbody")[0];
    
        const missingPersonResult = await axios.get(`http://localhost:5000/missing-persons/logs/${user_id}`,  {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = missingPersonResult.data;

        // kalo belum ada data di found user
        if (data.message) {
            const table =  document.getElementById("missing-person-table");
            table.innerHTML = '';
            console.log(data.message);
            const messageText = document.createElement('p');
            
            messageText.textContent = data.message;
            table.appendChild(messageText);
            return;
        }
        
        tbody.innerHTML = '';

        data.forEach((item) => {
            // new row
            const newRow = document.createElement("tr");

            // Full Name
            const full_name = document.createElement("td");
            full_name.textContent = item.full_name;  

            // Age
            const created_at = document.createElement("td");
            created_at.textContent = item.created_at.split('T')[0];  

            // Status
            const status = document.createElement("td");
            status.textContent = item.status;  

            const buttonCells = document.createElement("td");
            const button = document.createElement("button");
            button.textContent = "See Details";
            button.classList.add("btn-reset");
            button.addEventListener('click', () => {
                sessionStorage.setItem("selected", "missing_person");
                sessionStorage.setItem("selectedId", item.missing_id);
                window.location.href = "detail.html";
            })
            buttonCells.appendChild(button);

            newRow.appendChild(full_name);
            newRow.appendChild(status);
            newRow.appendChild(created_at);
            newRow.appendChild(buttonCells);

            tbody.appendChild(newRow);
        })

        console.log(missingPersonResult.data);
    }catch(error){
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
}

async function foundPerson() {
    try{
        foundPersonCard.classList.remove('hidden');
        missingPersonCard.classList.add('hidden');
        reportCard.classList.add('hidden');
        claimCard.classList.add('hidden');
        
        foundPersonBtn.classList.add('sidebar-btn-active');
        missingPersonBtn.classList.remove('sidebar-btn-active');
        reportBtn.classList.remove('sidebar-btn-active');
        claimBtn.classList.remove('sidebar-btn-active');

        const tbody = document.getElementById("found-person-table").getElementsByTagName("tbody")[0];

        const foundPersonResult = await axios.get(`http://localhost:5000/found-persons/logs/${user_id}`,  {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = foundPersonResult.data;

        // kalo belum ada data di found user
        if (data.message) {
            const table =  document.getElementById("found-person-table");
            table.innerHTML = '';
            console.log(data.message);
            const messageText = document.createElement('p');
            
            messageText.textContent = data.message;
            table.appendChild(messageText);
            return;
        }

        tbody.innerHTML = '';
        
        data.forEach((item) => {
            // new row
            const newRow = document.createElement("tr");

            // Full Name
            const found_location = document.createElement("td");
            found_location.textContent = item.found_location;  

            // Status
            const status = document.createElement("td");
            status.textContent = item.status;  
            
            // Age
            const created_at = document.createElement("td");
            created_at.textContent = item.created_at.split('T')[0];  

            const buttonCells = document.createElement("td");
            const button = document.createElement("button");
            button.textContent = "See Details";
            button.classList.add("btn-reset");
            button.addEventListener('click', () => {
                sessionStorage.setItem("selected", "found_person");
                sessionStorage.setItem("selectedId", item.found_id);
                window.location.href = "detail.html";
            })
            buttonCells.appendChild(button);

            newRow.appendChild(found_location);
            newRow.appendChild(status);
            newRow.appendChild(created_at);
            newRow.appendChild(buttonCells);

            tbody.appendChild(newRow);
        })

        console.log(data);
    }catch(error){
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
}

async function report() {
    try{
        reportCard.classList.remove('hidden');
        claimCard.classList.add('hidden');
        missingPersonCard.classList.add('hidden');
        foundPersonCard.classList.add('hidden');

        reportBtn.classList.add('sidebar-btn-active');
        claimBtn.classList.remove('sidebar-btn-active');
        missingPersonBtn.classList.remove('sidebar-btn-active');
        foundPersonBtn.classList.remove('sidebar-btn-active');

        const tbody = document.getElementById("report-table").getElementsByTagName("tbody")[0];
    
        const reportResult = await axios.get(`http://localhost:5000/reports/logs/${user_id}`,  {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = reportResult.data;
        
        // kalo belum ada data di found user
        if (data.message) {
            const table =  document.getElementById("report-table");
            table.innerHTML = '';
            console.log(data.message);
            const messageText = document.createElement('p');
            
            messageText.textContent = data.message;
            table.appendChild(messageText);
            return;
        }
        
        tbody.innerHTML = '';
        
        data.forEach((item) => {
            // new row
            const newRow = document.createElement("tr");

            // Full Name
            const description = document.createElement("td");
            const description_text = item.description.split(" ").slice(0, 5).join(" ") + "...";
            description.textContent = description_text;  

            // Status
            const status = document.createElement("td");
            status.textContent = item.status;  
            
            // Age
            const created_at = document.createElement("td");
            created_at.textContent = item.report_date.split('T')[0];  

            const buttonCells = document.createElement("td");
            const button = document.createElement("button");
            button.textContent = "See Details";
            button.classList.add("btn-reset");
            button.addEventListener('click', () => {
                sessionStorage.setItem("selected", "report");
                sessionStorage.setItem("selectedId", item.report_id);
                window.location.href = "detail.html";
            })
            buttonCells.appendChild(button);

            newRow.appendChild(description);
            newRow.appendChild(status);
            newRow.appendChild(created_at);
            newRow.appendChild(buttonCells);

            tbody.appendChild(newRow);
        })

        console.log(data);
    }catch(error){
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
}

async function claim(){
    try{
        claimCard.classList.remove('hidden');
        reportCard.classList.add('hidden');
        missingPersonCard.classList.add('hidden');
        foundPersonCard.classList.add('hidden');

        claimBtn.classList.add('sidebar-btn-active');
        reportBtn.classList.remove('sidebar-btn-active');
        missingPersonBtn.classList.remove('sidebar-btn-active');
        foundPersonBtn.classList.remove('sidebar-btn-active');

        const tbody = document.getElementById("claim-table").getElementsByTagName("tbody")[0];
    
        const claimResult = await axios.get(`http://localhost:5000/claims/logs/${user_id}`,  {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = claimResult.data;

        // kalo belum ada data di found user
        if (data.message) {
            const table =  document.getElementById("claim-table");
            table.innerHTML = '';
            console.log(data.message);
            const messageText = document.createElement('p');
            
            messageText.textContent = data.message;
            table.appendChild(messageText);
            return;
        }
        
        tbody.innerHTML = '';

        data.forEach((item) => {
            // new row
            const newRow = document.createElement("tr");

            // Full Name
            const relationship = document.createElement("td");
            relationship.textContent = item.relationship;  

            // Age
            const created_at = document.createElement("td");
            created_at.textContent = item.created_at.split('T')[0];  

            // Status
            const status = document.createElement("td");
            status.textContent = item.status;  

            const buttonCells = document.createElement("td");
            const button = document.createElement("button");
            button.textContent = "See Details";
            button.classList.add("btn-reset");
            button.addEventListener('click', () => {
                sessionStorage.setItem("selected", "claim");
                sessionStorage.setItem("selectedId", item.claim_id);
                window.location.href = "detail.html";
            })
            buttonCells.appendChild(button);

            newRow.appendChild(relationship);
            newRow.appendChild(status);
            newRow.appendChild(created_at);
            newRow.appendChild(buttonCells);

            tbody.appendChild(newRow);
        })

        console.log(claimResult.data);
    }catch(error){
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
}

