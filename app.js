"use strict";

const STORAGE_KEY = 'healthhub_appointments';

// --- STUDENT SIDE: BOOKING ---
function handleBooking(event) {
    event.preventDefault();

    const studentName = document.getElementById('studentName').value;
    const studentId = document.getElementById('studentId').value;
    const symptoms = document.getElementById('symptoms').value;
    const visitDate = document.getElementById('visitDate').value;

    const newAppointment = {
        id: Date.now(),
        name: studentName,
        studentId: studentId,
        symptoms: symptoms,
        date: visitDate,
        status: 'Pending', // Default status
        timestamp: new Date().toLocaleString()
    };

    saveToStorage(newAppointment);

    // If you have the modal code from before, keep using openModal(studentName, newAppointment.id);
    // Otherwise fallback to alert:
    if (typeof openModal === "function") {
        openModal(studentName, newAppointment.id);
    } else {
        alert(`Appointment Confirmed!\nRef ID: ${newAppointment.id}`);
    }
    
    document.getElementById('bookingForm').reset();
}

// --- ADMIN SIDE: DASHBOARD ---

function loadDashboard() {
    // Only run if we are on the admin page
    const queueContainer = document.getElementById('appointmentList');
    const historyContainer = document.getElementById('historyList');
    
    if (!queueContainer) return; 

    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // Separate Pending vs Completed
    const pendingApps = appointments.filter(a => a.status === 'Pending');
    const completedApps = appointments.filter(a => a.status === 'Completed');

    // Update Stats
    document.getElementById('totalCount').textContent = appointments.length;
    document.getElementById('pendingCount').textContent = pendingApps.length;

    // 1. Render Active Queue
    queueContainer.innerHTML = '';
    if (pendingApps.length === 0) {
        queueContainer.innerHTML = '<div class="p-4 text-center text-gray-400">No pending appointments.</div>';
    } else {
        pendingApps.forEach(appt => {
            const item = document.createElement('div');
            item.className = "p-4 hover:bg-blue-50 flex flex-col md:flex-row justify-between items-start md:items-center transition duration-150";
            item.innerHTML = `
                <div class="mb-2 md:mb-0">
                    <p class="font-bold text-gray-800 text-lg">${appt.name} <span class="text-sm font-normal text-gray-500">(${appt.studentId})</span></p>
                    <p class="text-gray-600">Reason: <span class="font-medium">${appt.symptoms}</span></p>
                    <p class="text-xs text-blue-600 font-semibold mt-1">📅 ${appt.date} | Ref: ${appt.id}</p>
                </div>
                <div>
                    <button onclick="markAsDone(${appt.id})" class="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded shadow hover:bg-green-600 transition">
                        ✓ Mark as Done
                    </button>
                </div>
            `;
            queueContainer.appendChild(item);
        });
    }

    // 2. Render History
    historyContainer.innerHTML = '';
    if (completedApps.length === 0) {
        historyContainer.innerHTML = '<div class="p-4 text-center text-gray-400">No history available.</div>';
    } else {
        // Show newest history first (reverse)
        completedApps.reverse().forEach(appt => {
            const item = document.createElement('div');
            item.className = "p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center opacity-75";
            item.innerHTML = `
                <div class="mb-2 md:mb-0">
                    <p class="font-bold text-gray-600">${appt.name} <span class="text-xs text-gray-400">(${appt.studentId})</span></p>
                    <p class="text-sm text-gray-500">${appt.symptoms}</p>
                    <p class="text-xs text-gray-400">Completed on: ${new Date().toLocaleDateString()}</p>
                </div>
                <div>
                    <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded border border-green-200">
                        COMPLETED
                    </span>
                </div>
            `;
            historyContainer.appendChild(item);
        });
    }
}

// --- NEW FUNCTION: MARK AS DONE ---
function markAsDone(id) {
    if(!confirm("Mark this patient as done? This will move them to History.")) return;

    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // Find the item and update status
    const updatedAppointments = appointments.map(appt => {
        if (appt.id === id) {
            return { ...appt, status: 'Completed' }; // Change status
        }
        return appt;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
    loadDashboard(); // Refresh UI
}

// --- TAB SWITCHING LOGIC ---
function switchTab(tabName) {
    const queueSection = document.getElementById('queueSection');
    const historySection = document.getElementById('historySection');
    const tabQueue = document.getElementById('tabQueue');
    const tabHistory = document.getElementById('tabHistory');

    if (tabName === 'queue') {
        queueSection.classList.remove('hidden');
        historySection.classList.add('hidden');
        
        // Update Button Styles
        tabQueue.className = "px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow transition";
        tabHistory.className = "px-4 py-2 bg-white text-gray-600 rounded-lg font-bold shadow hover:bg-gray-50 transition";
    } else {
        queueSection.classList.add('hidden');
        historySection.classList.remove('hidden');

        // Update Button Styles
        tabHistory.className = "px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow transition";
        tabQueue.className = "px-4 py-2 bg-white text-gray-600 rounded-lg font-bold shadow hover:bg-gray-50 transition";
    }
}

function saveToStorage(appointment) {
    const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    currentData.push(appointment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
}

// Init Booking Listener
if (document.getElementById('bookingForm')) {
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
}