document.addEventListener('DOMContentLoaded', () => {
    // --- Initial State ---
    let dataStore = [];
    let isSidebarOpen = true;
    // Tambahan: Staff Count disimpan di localStorage agar tidak reset
    let staffCount = localStorage.getItem('logistik_staff_count') || 14; 
    const STORAGE_KEY = 'logistik_scanner_data';

    // --- DOM Elements ---
    const inputResi = document.getElementById('inputResi');
    const inputTime = document.getElementById('inputTime');
    const inputDate = document.getElementById('inputDate');
    const staffInput = document.getElementById('staffCountInput');
    
    // --- Event Listeners ---
    document.getElementById('btnDownload').addEventListener('click', downloadCSV);
    document.getElementById('btnReset').addEventListener('click', clearData);
    document.getElementById('btnAdd').addEventListener('click', addData);
    document.getElementById('btnCollapse').addEventListener('click', toggleDashboard);
    document.getElementById('sidebarMiniContent').addEventListener('click', toggleDashboard);
    document.getElementById('toggleExpedition').addEventListener('click', () => toggleSection('expeditionContent', 'expChevron'));
    
    // Staff Input Change
    staffInput.value = staffCount;
    staffInput.addEventListener('change', (e) => {
        staffCount = e.target.value;
        localStorage.setItem('logistik_staff_count', staffCount);
        updateStats();
    });

    // Handle Enter Key on Input
    inputResi.addEventListener('keypress', (event) => {
        if (event.key === "Enter") addData();
    });

    // Setup Toggle for Shift Details
    document.querySelectorAll('.shift-toggle').forEach(el => {
        el.addEventListener('click', function() {
            toggleSubSection(this.dataset.target, this.dataset.chev);
        });
    });

    // --- Init ---
    loadFromLocal();
    setNow();
    setInterval(setNow, 1000);
    inputResi.focus();

    // --- Functions ---
    function toggleDashboard() {
        const sidebar = document.getElementById('dashboardSidebar');
        const fullContent = document.getElementById('sidebarFullContent');
        const miniContent = document.getElementById('sidebarMiniContent');
        
        isSidebarOpen = !isSidebarOpen;

        if (isSidebarOpen) {
            sidebar.classList.remove('w-10');
            sidebar.classList.add('w-80');
            fullContent.classList.remove('hidden');
            miniContent.classList.add('hidden');
        } else {
            sidebar.classList.remove('w-80');
            sidebar.classList.add('w-10');
            fullContent.classList.add('hidden');
            miniContent.classList.remove('hidden');
            miniContent.classList.add('flex');
        }
    }

    function saveToLocal() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataStore));
        } catch (e) { console.error(e); }
    }

    function loadFromLocal() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                dataStore = JSON.parse(savedData);
                renderTable();
                updateStats();
            }
        } catch (e) { console.error(e); }
    }

    function toggleSection(contentId, chevronId) {
        const content = document.getElementById(contentId);
        const chevron = document.getElementById(chevronId);
        content.classList.toggle('hidden');
        chevron.style.transform = content.classList.contains('hidden') ? 'rotate(-90deg)' : 'rotate(0deg)';
    }

    function toggleSubSection(contentId, chevronId) {
        const content = document.getElementById(contentId);
        const chevron = document.getElementById(chevronId);
        content.classList.toggle('collapsed');
        chevron.style.transform = content.classList.contains('collapsed') ? 'rotate(0deg)' : 'rotate(90deg)';
    }

    function setNow() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        if(inputTime) inputTime.value = `${hours}:${minutes}:${seconds}`;

        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        
        if(inputDate) inputDate.value = `${yyyy}-${mm}-${dd}`;
    }

    function formatDateID(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function addData() {
        const resi = inputResi.value.trim().toUpperCase();
        const timeStr = inputTime.value;
        const dateStr = inputDate.value;

        if (!resi) return; 

        // Cek Duplikat di saat input (Optional Warning)
        const isExist = dataStore.some(d => d.resi === resi);
        if(isExist) {
            // Kita bisa tambah suara 'beep error' disini nanti
            console.log("Duplicate detected");
        }

        const prefix = resi.substring(0, 2);
        let ekspedisi = "INSTANT/SAMEDAY";
        if (prefix === "SP") ekspedisi = "SPX";
        else if (prefix === "JT") ekspedisi = "JTR";
        else if (prefix === "20") ekspedisi = "JNT KARGO";
        else if (prefix === "JP") ekspedisi = "JNT EXPRESS";

        let shift = "Diluar Jam";
        let shiftCode = 0;
        if (timeStr) {
            const [h, m] = timeStr.split(':').map(Number);
            const tm = h * 60 + m;
            if (tm >= 8*60 && tm <= 12*60) { shift = "Shift 1"; shiftCode = 1; }
            else if (tm >= 13*60 && tm <= 17*60) { shift = "Shift 2"; shiftCode = 2; }
            else if (tm >= 18*60 && tm <= 20*60) { shift = "Shift 3"; shiftCode = 3; }
        }

        const newData = {
            id: Date.now(),
            resi,
            time: timeStr,
            date: dateStr,
            prefix,
            ekspedisi,
            shift,
            shiftCode
        };
        dataStore.unshift(newData); 

        saveToLocal();
        renderTable();
        updateStats();

        inputResi.value = "";
        setNow();
        inputResi.focus(); 
    }

    // Assign global delete function agar bisa dipanggil dari HTML string
    window.deleteRow = function(id) {
        dataStore = dataStore.filter(item => item.id !== id);
        saveToLocal();
        renderTable();
        updateStats();
    }

    function renderTable() {
        const tbody = document.getElementById('tableBody');
        const emptyState = document.getElementById('emptyState');
        
        // Hapus semua baris kecuali baris input (index 0)
        while (tbody.children.length > 1) {
            tbody.removeChild(tbody.lastChild);
        }

        if (dataStore.length > 0) {
            emptyState.style.display = 'none';
            
            const resiCounts = {};
            dataStore.forEach(item => {
                resiCounts[item.resi] = (resiCounts[item.resi] || 0) + 1;
            });

            dataStore.forEach((item, index) => {
                const row = document.createElement('tr');
                const num = dataStore.length - index; 
                
                const isDuplicate = resiCounts[item.resi] > 1;
                if (isDuplicate) row.classList.add('duplicate-row');
                
                row.innerHTML = `
                    <td class="text-center text-gray-500 border-r border-gray-200">${num}</td>
                    <td class="font-mono ${isDuplicate ? 'font-bold' : 'font-medium'} text-left pl-4">
                        ${item.resi}
                        ${isDuplicate ? '<i class="fas fa-exclamation-triangle ml-2 text-yellow-600" title="Resi Duplikat"></i>' : ''}
                    </td>
                    <td class="text-center">${item.time}</td>
                    <td class="text-center text-gray-600 font-medium text-xs">${formatDateID(item.date)}</td>
                    <td class="font-medium text-center">${item.ekspedisi}</td>
                    <td class="text-center">
                        <button onclick="deleteRow(${item.id})" class="text-red-400 hover:text-red-600 text-xs p-1">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            emptyState.style.display = 'block';
        }
    }

    function clearData() {
        if(confirm("Hapus semua data?")) {
            dataStore = [];
            saveToLocal();
            renderTable();
            updateStats();
        }
    }

    function formatDurationCustom(diffMins) {
        if (diffMins === null || diffMins < 0) return "-";
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        return `${h},${m.toString().padStart(2, '0')}`;
    }
    
    function minutesToTime(mins) {
        if (mins === null) return "-";
        const h = Math.floor(mins / 60).toString().padStart(2, '0');
        const m = (mins % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    }

    function updateStats() {
        const counts = { SPX: 0, JTR: 0, JNTK: 0, JNTE: 0, OTHER: 0 };
        const shiftCounts = { 1: 0, 2: 0, 3: 0, 0: 0 };
        const timeStats = { 1: { min: null, max: null }, 2: { min: null, max: null }, 3: { min: null, max: null } };
        const uniqueResis = new Set();

        dataStore.forEach(item => {
            uniqueResis.add(item.resi);
            if (item.ekspedisi === "SPX") counts.SPX++;
            else if (item.ekspedisi === "JTR") counts.JTR++;
            else if (item.ekspedisi === "JNT KARGO") counts.JNTK++;
            else if (item.ekspedisi === "JNT EXPRESS") counts.JNTE++;
            else counts.OTHER++;

            shiftCounts[item.shiftCode]++;

            if (item.shiftCode > 0) {
                const [h, m] = item.time.split(':').map(Number);
                const currentMins = h * 60 + m;
                let ts = timeStats[item.shiftCode];
                if (ts.min === null || currentMins < ts.min) ts.min = currentMins;
                if (ts.max === null || currentMins > ts.max) ts.max = currentMins;
            }
        });

        document.getElementById('totalCount').textContent = dataStore.length;
        document.getElementById('duplicateCount').textContent = dataStore.length - uniqueResis.size;

        document.getElementById('count-SPX').textContent = counts.SPX;
        document.getElementById('count-JTR').textContent = counts.JTR;
        document.getElementById('count-JNTK').textContent = counts.JNTK;
        document.getElementById('count-JNTE').textContent = counts.JNTE;
        document.getElementById('count-OTHER').textContent = counts.OTHER;
        
        let totalDurationMins = 0;
        // Staff count diambil dari variable global (yang bisa diedit user)
        const currentStaff = parseInt(staffCount) || 1;

        [1, 2, 3].forEach(code => {
            const ts = timeStats[code];
            const count = shiftCounts[code];
            
            const startStr = minutesToTime(ts.min);
            const endStr = minutesToTime(ts.max);
            document.getElementById(`time-range-${code}`).textContent = (ts.min !== null) ? `${startStr} - ${endStr}` : "-";
            
            document.getElementById(`count-shift-${code}`).textContent = `${count} Pkt`;

            let durText = "-";
            let speedText = "-";
            let scoreText = "-";

            if (ts.min !== null && ts.max !== null) {
                const diffMins = ts.max - ts.min;
                durText = formatDurationCustom(diffMins);
                totalDurationMins += diffMins;

                if (diffMins > 0) {
                    const durationHours = diffMins / 60;
                    const speedVal = Math.round(count / durationHours);
                    speedText = speedVal; 
                    scoreText = (speedVal / currentStaff).toFixed(2);
                } else if (count > 0) {
                    speedText = "Max"; 
                }
            }
            
            document.getElementById(`time-dur-${code}`).textContent = durText;
            document.getElementById(`speed-${code}`).textContent = speedText;
            document.getElementById(`score-${code}`).textContent = scoreText;
        });

        document.getElementById('total-duration-sum').textContent = formatDurationCustom(totalDurationMins);
        let avgSpeedTotal = "-";
        if (totalDurationMins > 0) {
            const totalHours = totalDurationMins / 60;
            avgSpeedTotal = Math.round(dataStore.length / totalHours);
        }
        document.getElementById('total-speed-avg').textContent = avgSpeedTotal;
    }

    function downloadCSV() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "No,Resi,Waktu,Tanggal,Ekspedisi\n";
        dataStore.forEach((item, index) => {
            const row = [
                dataStore.length - index,
                item.resi,
                item.time,
                formatDateID(item.date), 
                item.ekspedisi
            ].join(",");
            csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        link.setAttribute("download", `Rekap Scan ${dd}-${mm}-${yyyy}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
