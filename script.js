body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8f9fa;
}

/* Spreadsheet Table Styles */
.sheet-table {
    border-collapse: collapse;
    width: 100%;
    font-size: 13px;
}

.sheet-table th, .sheet-table td {
    border: 1px solid #d1d5db;
    padding: 6px 8px;
}

.sheet-table th {
    background-color: #f3f4f6;
    color: #374151;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
}

.sheet-table td {
    background-color: white;
    color: #1f2937;
}

/* Highlight untuk Baris Duplikat */
tr.duplicate-row td {
    background-color: #fee2e2 !important;
    color: #991b1b;
}
tr.duplicate-row:hover td {
    background-color: #fecaca !important;
}

/* Input Row Styling */
.input-cell input {
    width: 100%;
    padding: 4px 6px;
    border-radius: 4px;
    outline: none;
    font-size: 13px;
    text-transform: uppercase;
}

input[type="date"]:disabled::-webkit-calendar-picker-indicator,
input[type="time"]:disabled::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
}

.input-cell input[type="date"], 
.input-cell input[type="time"] {
    text-align: center;
    padding-right: 0;
}

/* Active Scanner Input */
.input-cell input:not(:disabled) {
    border: 2px solid #22c55e;
    background-color: #f0fdf4;
}

.sheet-table tr:hover td {
    background-color: #f9fafb;
}

/* Summary Box Styling */
.summary-box {
    font-size: 12px;
    border: 1px solid #d1d5db;
}

.summary-header {
    background-color: #e5e7eb;
    font-weight: bold;
    padding: 4px 8px;
}

.summary-row {
    padding: 3px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f3f4f6;
}

.summary-sub-header {
    background-color: #f9fafb;
    font-weight: 600;
    padding: 4px 8px;
    color: #4b5563;
    font-size: 11px;
    margin-top: 2px;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    transition: background-color 0.2s;
}

.summary-sub-header:hover {
    background-color: #eef2ff;
}

/* Animation */
.details-content {
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
    overflow: hidden;
    max-height: 500px;
    opacity: 1;
}

.details-content.collapsed {
    max-height: 0;
    opacity: 0;
    border: none;
}

#dashboardSidebar {
    transition: width 0.3s ease-in-out, padding 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.val-speed { font-weight: bold; color: #059669; }
.val-score { font-weight: bold; color: #2563eb; }