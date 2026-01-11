"use strict";

const STORAGE_KEY = 'healthhub_appointments';

// --- STUDENT SIDE: BOOKING ---
function handleBooking(event) {
    event.preventDefault();

    const studentName = document.getElementById('studentName').value;
    const studentId = document.getElementById('studentId').value;
    const symptoms = document.getElementById('symptoms').value;
    const visitDate = document.getElementById('visitDate').value;
    const studentDept = document.getElementById('studentDept').value;

    // 1. ID FORMAT VALIDATION
    const idPattern = /^\d{4}-\d{4}-[A-Ea-e]$/;
    if (!idPattern.test(studentId)) {
        alert("Invalid Student ID!\n\nFormat must be: YYYY-NNNN-L\nExample: 2023-1234-A");
        return; 
    }

    // 2. DUPLICATE CHECK
    const existingAppointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const isDuplicate = existingAppointments.find(appt => 
        appt.studentId === studentId.toUpperCase() && appt.status === 'Pending'
    );

    if (isDuplicate) {
        alert(`Request Failed!\n\nStudent ID ${studentId.toUpperCase()} already has a pending appointment.`);
        return; 
    }

    // Create new appointment object
    const newAppointment = {
        id: Date.now(),
        name: studentName,
        studentId: studentId.toUpperCase(),
        department: studentDept, 
        symptoms: symptoms,
        date: visitDate,
        status: 'Pending',
        timestamp: new Date().toLocaleString()
    };

    saveToStorage(newAppointment);

    if (typeof openModal === "function") {
        openModal(studentName, newAppointment.id);
    } else {
        alert(`Appointment Confirmed!\nRef ID: ${newAppointment.id}`);
    }
    
    document.getElementById('bookingForm').reset();
}

// --- ADMIN SIDE: DASHBOARD ---

// 1. Updated Mark as Done (With Notes)
function markAsDone(id) {
    const diagnosis = prompt("Enter Diagnosis / Treatment Given:\n(e.g., Given Paracetamol, Rested for 1hr)");
    
    if (diagnosis === null) return; // Cancelled
    if (diagnosis.trim() === "") {
        alert("You must enter a diagnosis/note to complete the visit.");
        return;
    }

    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    const updatedAppointments = appointments.map(appt => {
        if (appt.id === id) { 
            return { 
                ...appt, 
                status: 'Completed', 
                notes: diagnosis 
            }; 
        }
        return appt;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
    loadDashboard(); 
}

// 2. Main Dashboard Loader
function loadDashboard() {
    const queueContainer = document.getElementById('appointmentList');
    const historyContainer = document.getElementById('historyList');
    
    if (!queueContainer) return; 

    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    const pendingApps = appointments.filter(a => a.status === 'Pending');
    const completedApps = appointments.filter(a => a.status === 'Completed');

    document.getElementById('totalCount').textContent = appointments.length;
    document.getElementById('pendingCount').textContent = pendingApps.length;

    // Render Active Queue
    queueContainer.innerHTML = '';
    if (pendingApps.length === 0) {
        queueContainer.innerHTML = '<div class="p-4 text-center text-gray-400">No pending appointments.</div>';
    } else {
        pendingApps.forEach(appt => {
            const item = document.createElement('div');
            item.className = "p-4 hover:bg-blue-50 flex flex-col md:flex-row justify-between items-start md:items-center transition duration-150 border-b border-gray-100";
            
            item.innerHTML = `
                <div class="mb-2 md:mb-0">
                    <div class="flex items-center gap-2">
                        <p class="font-bold text-blue-900 text-lg">${appt.name}</p>
                        <span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded border border-yellow-300">
                            ${appt.department || 'N/A'}
                        </span>
                    </div>
                    <p class="text-sm text-gray-500 font-mono">ID: ${appt.studentId}</p>
                    <p class="text-gray-700 mt-1">Reason: <span class="font-medium">${appt.symptoms}</span></p>
                    <p class="text-xs text-blue-600 font-semibold mt-1">📅 ${appt.date}</p>
                </div>
                <div class="mt-2 md:mt-0">
                    <button onclick="markAsDone(${appt.id})" class="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded shadow hover:bg-green-600 transition">
                        ✓ Mark as Done
                    </button>
                </div>
            `;
            queueContainer.appendChild(item);
        });
    }

    // Render History
    historyContainer.innerHTML = '';
    if (completedApps.length === 0) {
        historyContainer.innerHTML = '<div class="p-4 text-center text-gray-400">No history available.</div>';
    } else {
        completedApps.reverse().forEach(appt => {
            const item = document.createElement('div');
            item.className = "history-item p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100";
            
            item.innerHTML = `
                <div class="mb-2 md:mb-0 w-full">
                    <div class="flex justify-between">
                        <p class="font-bold text-gray-700">${appt.name} <span class="text-xs text-gray-400">(${appt.studentId})</span></p>
                        <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">COMPLETED</span>
                    </div>
                    <p class="text-xs text-gray-500 mb-1">Dept: ${appt.department || 'N/A'}</p>
                    
                    <div class="mt-2 bg-white p-2 rounded border-l-4 border-green-500 text-sm text-gray-600">
                        <span class="font-bold text-gray-800">Diagnosis/Rx:</span> ${appt.notes || "No notes recorded."}
                    </div>
                    
                    <p class="text-xs text-gray-400 mt-1">Date: ${appt.date}</p>
                </div>
            `;
            historyContainer.appendChild(item);
        });
    }
}

// 3. Search Filter
function filterHistory() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const historyContainer = document.getElementById('historyList');
    const items = historyContainer.getElementsByClassName('history-item');

    for (let i = 0; i < items.length; i++) {
        const textValue = items[i].textContent || items[i].innerText;
        if (textValue.toUpperCase().indexOf(filter) > -1) {
            items[i].style.display = "";
        } else {
            items[i].style.display = "none";
        }
    }
}

// 4. Export to CSV Feature
function exportToCSV() {
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    if (appointments.length === 0) {
        alert("No data to export!");
        return;
    }

    // Create Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Student Name,Student ID,Department,Symptoms,Status,Date,Notes\n";

    // Add Rows
    appointments.forEach(row => {
        // Clean data (remove commas so CSV doesn't break)
        const cleanName = row.name.replace(/,/g, "");
        const cleanSymptoms = row.symptoms.replace(/,/g, " ");
        const cleanNotes = (row.notes || "").replace(/,/g, " ");

        csvContent += `${row.id},${cleanName},${row.studentId},${row.department},${cleanSymptoms},${row.status},${row.date},${cleanNotes}\n`;
    });

    // Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "healthhub_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 5. Analytics Feature
function loadAnalytics() {
    const container = document.getElementById('analyticsContainer');
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    if (appointments.length === 0) {
        container.innerHTML = "<p>No data available for analysis.</p>";
        return;
    }

    // Count by Department
    const deptCounts = {};
    appointments.forEach(appt => {
        const dept = appt.department || "Unknown";
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    // Render
    container.innerHTML = '';
    const maxVal = Math.max(...Object.values(deptCounts)); 

    for (const [dept, count] of Object.entries(deptCounts)) {
        const percentage = (count / appointments.length) * 100;
        
        const barHTML = `
            <div>
                <div class="flex justify-between text-sm font-bold text-gray-700 mb-1">
                    <span>${dept}</span>
                    <span>${count} students</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4">
                    <div class="bg-blue-900 h-4 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', barHTML);
    }
}

// 6. Tab Switching Logic (CORRECT VERSION)
function switchTab(tabName) {
    const queueSection = document.getElementById('queueSection');
    const historySection = document.getElementById('historySection');
    const analyticsSection = document.getElementById('analyticsSection');

    const tabQueue = document.getElementById('tabQueue');
    const tabHistory = document.getElementById('tabHistory');
    const tabAnalytics = document.getElementById('tabAnalytics');

    // Hide All
    queueSection.classList.add('hidden');
    historySection.classList.add('hidden');
    if(analyticsSection) analyticsSection.classList.add('hidden');

    // Reset Buttons
    const inactiveClass = "px-4 py-2 bg-white text-gray-600 rounded-t-lg font-bold shadow hover:bg-gray-50 border-b-2 border-transparent transition";
    const activeClass = "px-4 py-2 bg-blue-900 text-white rounded-t-lg font-bold shadow border-b-2 border-blue-900 transition";

    tabQueue.className = inactiveClass;
    tabHistory.className = inactiveClass;
    if(tabAnalytics) tabAnalytics.className = inactiveClass;

    // Show Selected
    if (tabName === 'queue') {
        queueSection.classList.remove('hidden');
        tabQueue.className = activeClass;
    } else if (tabName === 'history') {
        historySection.classList.remove('hidden');
        tabHistory.className = activeClass;
    } else if (tabName === 'analytics') {
        analyticsSection.classList.remove('hidden');
        tabAnalytics.className = activeClass;
        loadAnalytics(); 
    }
}

function saveToStorage(appointment) {
    const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    currentData.push(appointment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
}

if (document.getElementById('bookingForm')) {
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
}c