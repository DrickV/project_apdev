"use strict";

// CONSTANTS
const STORAGE_KEY = 'healthhub_appointments';

// 1. Function to Handle Form Submission (Student Side)
function handleBooking(event) {
    event.preventDefault(); // Stop page reload

    // Capture values
    const studentName = document.getElementById('studentName').value;
    const studentId = document.getElementById('studentId').value;
    const symptoms = document.getElementById('symptoms').value;
    const visitDate = document.getElementById('visitDate').value;

    // Create appointment object 
    const newAppointment = {
        id: Date.now(), // Simple unique ID
        name: studentName,
        studentId: studentId,
        symptoms: symptoms,
        date: visitDate,
        status: 'Pending',
        timestamp: new Date().toLocaleString()
    };

    // Save to LocalStorage (The "Database" Downgrade)
    saveToStorage(newAppointment);

    // Downgraded Notification: Alert instead of SMS [cite: 17]
    alert(`Appointment Confirmed for ${studentName}!\nRef ID: ${newAppointment.id}`);
    
    // Reset form
    document.getElementById('bookingForm').reset();
}

// 2. Helper: Save Data
function saveToStorage(appointment) {
    const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    currentData.push(appointment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
}

// 3. Function to Load Dashboard (Admin Side)
function loadDashboard() {
    const listContainer = document.getElementById('appointmentList');
    const pendingEl = document.getElementById('pendingCount');
    const totalEl = document.getElementById('totalCount');
    
    if (!listContainer) return; // Exit if not on admin page

    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Update Stats 
    totalEl.textContent = appointments.length;
    pendingEl.textContent = appointments.filter(a => a.status === 'Pending').length;

    // Clear list
    listContainer.innerHTML = '';

    if (appointments.length === 0) {
        listContainer.innerHTML = '<div class="p-4 text-center text-gray-500">No appointments found.</div>';
        return;
    }

    // Render Items
    appointments.reverse().forEach(appt => {
        const item = document.createElement('div');
        item.className = "p-4 hover:bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center";
        
        item.innerHTML = `
            <div class="mb-2 md:mb-0">
                <p class="font-bold text-gray-800">${appt.name} <span class="text-xs text-gray-500">(${appt.studentId})</span></p>
                <p class="text-sm text-gray-600">Reason: ${appt.symptoms}</p>
                <p class="text-xs text-blue-600 font-semibold">📅 ${appt.date}</p>
            </div>
            <div>
                <button onclick="deleteAppointment(${appt.id})" class="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200">
                    Remove
                </button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// 4. Function to Delete Appointment
function deleteAppointment(id) {
    if(!confirm("Mark this visit as completed/removed?")) return;

    let appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    appointments = appointments.filter(appt => appt.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    
    loadDashboard(); // Refresh UI
}

// Event Listeners
if (document.getElementById('bookingForm')) {
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
}