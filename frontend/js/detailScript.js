const reportContainer = document.getElementById('detail-report');
const claimContainer = document.getElementById('detail-claim');
const foundPersonContainer = document.getElementById('detail-found-person');
const missingPersonContainer = document.getElementById('detail-missing-person');

addEventListener('DOMContentLoaded', function() {
    const selected = sessionStorage.getItem('selected');
    const selectedId = sessionStorage.getItem('selectedId');
    switch(selected){
        case 'missing_person':
            missingPerson(selectedId);
            break;
        case 'found_person':
            foundPerson(selectedId);
            break;
        case 'report':
            report(selectedId);
            break;
        case 'claim':
            claim(selectedId);
            break;
    }

    console.log(selected, selectedId);
})

async function missingPerson(missingId) {
    try{
        const response = await fetch(`http://localhost:5000/missing-persons/details/${missingId}`);
        const data = await response.json();
    
        // debug
        console.log(data);
        missingPersonContainer.classList.remove('hidden');
        reportContainer.classList.remove('hidden');
        claimContainer.classList.add('hidden');
        foundPersonContainer.classList.add('hidden');

        // Missing Person Details
        missingPersonContainer.querySelector("#full_name").textContent = data.full_name;
        missingPersonContainer.querySelector("#age").textContent = data.age;
        missingPersonContainer.querySelector("#gender").textContent = data.gender;
        missingPersonContainer.querySelector("#height").textContent = data.height;
        missingPersonContainer.querySelector("#weight").textContent = data.weight;
        missingPersonContainer.querySelector("#last_seen_location").textContent = data.last_seen_location;
        missingPersonContainer.querySelector("#last_seen_date").textContent = data.last_seen_date;
        missingPersonContainer.querySelector("#status").textContent = data.missing_status;
        missingPersonContainer.querySelector("#created_at").textContent = data.created_at;
        missingPersonContainer.querySelector("#photo_url").src = `http://localhost:5000/${data.photo_url}`;
        
        // Report Details
        
        if(data.report_status !== null) {
            reportContainer.querySelector("#description").textContent = data.description;
            reportContainer.querySelector("#report_created_at").textContent = data.report_date;
            reportContainer.querySelector("#report_status").textContent = data.report_status;
        }else{
            const massage = document.createElement('p');
            massage.textContent = "No one has reported the missing person you submitted yet.";
            
            reportContainer.innerHTML = "";
            reportContainer.appendChild(massage);
        }
    }catch(error) {
        console.error('Error fetching missing person details:', error);
    }
}

async function foundPerson(foundId) {
    try{
        const response = await fetch(`http://localhost:5000/found-persons/details/${foundId}`);
        const data = await response.json();
    
        // debug
        console.log(data);
        foundPersonContainer.classList.remove('hidden');
        claimContainer.classList.remove('hidden');
        reportContainer.classList.add('hidden');
        missingPersonContainer.classList.add('hidden');

        // Found Person Details
        // data = found_location, description, status, created_at, photo_url
        foundPersonContainer.querySelector("#found_location").textContent = data.found_location;
        foundPersonContainer.querySelector("#description").textContent = data.description;
        foundPersonContainer.querySelector("#status").textContent = data.found_status;
        foundPersonContainer.querySelector("#created_at").textContent = data.found_date.split("T")[0];
        foundPersonContainer.querySelector("#photo_url").src = `http://localhost:5000/${data.found_photo_url}`;

        if(data.claim_status !== null) {
            claimContainer.querySelector("#created_at").textContent = data.claim_date.split("T")[0];
            claimContainer.querySelector("#status").textContent = data.claim_status;
            claimContainer.querySelector("#found_location").textContent = data.found_location;
            claimContainer.querySelector("#photo_url").src = `http://localhost:5000/${data.claim_photo_url}`;
            claimContainer.querySelector("#relationship").textContent = data.relationship;
        }else{
            const massage = document.createElement('p');
            massage.textContent = "No one has claimed the found person you submitted yet.";
            
            claimContainer.innerHTML = "";
            claimContainer.appendChild(massage);
        }
    }catch(error) {
        console.error('Error fetching found person details:', error);
    }
}

async function report(reportId) {
    try{
        const response = await fetch(`http://localhost:5000/reports/details/${reportId}`);
        const data = await response.json();
        
        reportContainer.classList.remove('hidden');
        missingPersonContainer.classList.remove('hidden');
        claimContainer.classList.add('hidden');
        foundPersonContainer.classList.add('hidden');

        // debug
        console.log(data);
        

        // Missing Person Details
        missingPersonContainer.querySelector("#full_name").textContent = data.full_name;
        missingPersonContainer.querySelector("#age").textContent = data.age;
        missingPersonContainer.querySelector("#gender").textContent = data.gender;
        missingPersonContainer.querySelector("#height").textContent = data.height;
        missingPersonContainer.querySelector("#weight").textContent = data.weight;
        missingPersonContainer.querySelector("#last_seen_location").textContent = data.last_seen_location;
        missingPersonContainer.querySelector("#last_seen_date").textContent = data.last_seen_date.split("T")[0];
        missingPersonContainer.querySelector("#status").textContent = data.missing_status;
        missingPersonContainer.querySelector("#created_at").textContent = data.created_at.split("T")[0];
        missingPersonContainer.querySelector("#photo_url").src = `http://localhost:5000/${data.photo_url}`;
        
        // Report Details
        reportContainer.querySelector("#description").textContent = data.description;
        reportContainer.querySelector("#report_created_at").textContent = data.report_date;
        reportContainer.querySelector("#report_status").textContent = data.report_status;
        reportContainer.querySelector("#photo_url").src = `http://localhost:5000/${data.report_photo_url}`;
        console.log(data);
    }catch(error) {
        console.error('Error fetching report details:', error);
    }
}

async function claim(claimId) {
    try{
        const response = await fetch(`http://localhost:5000/claims/details/${claimId}`);
        const data = await response.json();
    
        // debug
        console.log(data);
        claimContainer.classList.remove('hidden');
        foundPersonContainer.classList.remove('hidden');
        reportContainer.classList.add('hidden');
        missingPersonContainer.classList.add('hidden');

        // Claim Details
        claimContainer.querySelector("#created_at").textContent = data.claim_date.split("T")[0];
        claimContainer.querySelector("#status").textContent = data.claim_status;
        claimContainer.querySelector("#found_location").textContent = data.found_location;
        claimContainer.querySelector("#photo_url").src = `http://localhost:5000/${data.claim_photo_url}`;
        claimContainer.querySelector("#relationship").textContent = data.relationship;

        // Found Person Details
        foundPersonContainer.querySelector("#found_location").textContent = data.found_location;
        foundPersonContainer.querySelector("#description").textContent = data.description;
        foundPersonContainer.querySelector("#status").textContent = data.found_status;
        foundPersonContainer.querySelector("#created_at").textContent = data.found_date.split("T")[0];
        foundPersonContainer.querySelector("#photo_url").src = `http://localhost:5000/${data.found_photo_url}`;
    }catch(error) {
        console.error('Error fetching claim details:', error);
    }
}
