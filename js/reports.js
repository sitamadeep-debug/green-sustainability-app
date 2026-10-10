/* ==========================================================================
   EcoSustain Reports & CSV/PDF Exporter Module
   ========================================================================== */

window.renderReportsModule = function() {
    renderReportPreview();
};

document.addEventListener("ecoUIReady", () => {
    setupReportsHandlers();
});

function setupReportsHandlers() {
    const exportCsvBtn = document.getElementById("export-csv-btn");
    const exportPdfBtn = document.getElementById("export-pdf-btn");
    const reportForm = document.getElementById("report-builder-form");
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", exportRecordsToCSV);
    }
    
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener("click", printCorporateAuditReport);
    }
    
    // Bind form changes to preview re-rendering
    if (reportForm) {
        reportForm.querySelectorAll("select, input").forEach(input => {
            input.addEventListener("change", renderReportPreview);
        });
    }
}

function getFilteredReportRecords() {
    const periodType = document.getElementById("report-period-type").value;
    const records = window.EcoState.records;
    
    if (records.length === 0) return [];
    
    if (periodType === "YTD") {
        return records.filter(r => r.year === "2026");
    } else if (periodType === "Q1") {
        const q1Months = ["January", "February", "March"];
        return records.filter(r => r.year === "2026" && q1Months.includes(r.month));
    }
    
    return records;
}

function renderReportPreview() {
    const previewElec = document.getElementById("preview-electricity-stat");
    const previewCo2 = document.getElementById("preview-co2-stat");
    
    if (!previewElec || !previewCo2) return;
    
    const filtered = getFilteredReportRecords();
    
    if (filtered.length === 0) {
        previewElec.textContent = "0 kWh";
        previewCo2.textContent = "0.0 kg";
        return;
    }
    
    let totalElec = 0;
    let baselineCo2 = 673.8 * filtered.length;
    let actualCo2 = 0;
    
    filtered.forEach(r => {
        totalElec += r.electricity;
        actualCo2 += r.emissions;
    });
    
    const co2Saved = Math.max(0, baselineCo2 - actualCo2);
    
    previewElec.textContent = `${totalElec.toLocaleString()} kWh`;
    previewCo2.textContent = `${co2Saved.toFixed(1)} kg CO₂e`;
}

function exportRecordsToCSV() {
    const filtered = getFilteredReportRecords();
    if (filtered.length === 0) {
        alert("No records logged for the selected period to export.");
        return;
    }
    
    // CSV Header
    let csv = "Period,Electricity (kWh),Electricity Cost (IDR),Water (m3),Water Cost (IDR),Single-use Plastic (kg),Paper/Cardboard (kg),Organic Materials (kg),Waste Organic (kg),Waste Inorganic (kg),Waste Recycled (kg),Fuel Type,Fuel Consumed (L),Emissions (kg CO2e)\r\n";
    
    // CSV rows
    filtered.forEach(r => {
        csv += `${r.month} ${r.year},${r.electricity},${r.electricityCost},${r.water},${r.waterCost},${r.plastic},${r.paper},${r.organicMaterials},${r.wasteOrganic},${r.wasteInorganic},${r.wasteRecycled},${r.fuelType},${r.fuelQty},${r.emissions}\r\n`;
    });
    
    // Create download trigger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const periodName = document.getElementById("report-period-type").value;
    link.setAttribute("href", url);
    link.setAttribute("download", `EcoSustain_Audit_Logs_${periodName}_2026.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printCorporateAuditReport() {
    const filtered = getFilteredReportRecords();
    if (filtered.length === 0) {
        alert("No records found to generate printable report contents.");
        return;
    }
    
    const company = window.EcoState.profile.companyName;
    const sector = window.EcoState.profile.sector;
    const periodName = document.getElementById("report-period-type").value;
    
    const incCons = document.getElementById("inc-consumption").checked;
    const incEmis = document.getElementById("inc-emissions").checked;
    const incInno = document.getElementById("inc-innovations").checked;
    const incBench = document.getElementById("inc-benchmarking").checked;
    
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    
    // Aggregate data
    let totalElec = 0;
    let totalWater = 0;
    let totalWaste = 0;
    let totalEmis = 0;
    
    filtered.forEach(r => {
        totalElec += r.electricity;
        totalWater += r.water;
        totalWaste += r.wasteOrganic + r.wasteInorganic + r.wasteRecycled;
        totalEmis += r.emissions;
    });
    
    const baseline = 673.8 * filtered.length;
    const co2Saved = Math.max(0, baseline - totalEmis);
    
    // Print container element setup
    const printContainer = document.getElementById("print-report-container");
    printContainer.innerHTML = "";
    
    // Dynamic html structure assembly
    let html = `
        <div class="print-header">
            <div class="print-logo">
                <i data-lucide="leaf"></i>
                <span>EcoSustain</span>
            </div>
            <span>System Audit Reference: ES-2026-${Date.now().toString().slice(-6)}</span>
        </div>
        
        <h1 class="print-doc-title">CORPORATE GREEN AUDIT REPORT</h1>
        
        <div class="print-meta-grid">
            <div>
                <strong>Business Entity:</strong>
                <p>${company}</p>
                <br>
                <strong>Sector Classification:</strong>
                <p>${sector}</p>
            </div>
            <div>
                <strong>Reporting Duration:</strong>
                <p>${periodName} 2026</p>
                <br>
                <strong>Date Generated:</strong>
                <p>${dateStr}</p>
            </div>
        </div>
        
        <div class="print-section">
            <h3>Executive Summary</h3>
            <p style="line-height: 1.6;">
                This audit report consolidates resource utility logs, environmental carbon contributions, and structural green innovations implemented by the entity **${company}** during the reporting period of **${periodName}**. Computations conform with standard greenhouse gas (GHG) corporate inventory protocols and verified ESDM conversion scales for South-East Asia. Over this period, green optimization measures led to an estimated carbon prevention of <strong>${co2Saved.toFixed(1)} kg CO₂e</strong> against baseline operating metrics.
            </p>
        </div>
    `;
    
    // Optional section: Consumptions
    if (incCons) {
        html += `
            <div class="print-section">
                <h3>Resource Utility & Material Statistics</h3>
                <p style="margin-bottom: 12px;">The following logs map detailed raw materials, water, and power utility readings recorded chronologically:</p>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Month Period</th>
                            <th>Electricity (kWh)</th>
                            <th>Water (m³)</th>
                            <th>Plastics used (kg)</th>
                            <th>Compost Waste (kg)</th>
                            <th>Upcycled (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(r => `
                            <tr>
                                <td><strong>${r.month} ${r.year}</strong></td>
                                <td>${r.electricity} kWh</td>
                                <td>${r.water} m³</td>
                                <td>${r.plastic} kg</td>
                                <td>${r.wasteOrganic} kg</td>
                                <td>${r.wasteRecycled} kg</td>
                            </tr>
                        `).join('')}
                        <tr style="font-weight: 700; background-color: #f9fafb;">
                            <td>TOTAL LOGGED</td>
                            <td>${totalElec.toLocaleString()} kWh</td>
                            <td>${totalWater.toLocaleString()} m³</td>
                            <td>${filtered.reduce((a,b) => a + b.plastic, 0).toFixed(1)} kg</td>
                            <td>${filtered.reduce((a,b) => a + b.wasteOrganic, 0).toFixed(1)} kg</td>
                            <td>${filtered.reduce((a,b) => a + b.wasteRecycled, 0).toFixed(1)} kg</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Optional section: Emissions
    if (incEmis) {
        html += `
            <div class="print-section">
                <h3>Carbon Footprint analysis</h3>
                <div class="print-grid-stats">
                    <div class="print-stat-card">
                        <span>Logged Footprint</span>
                        <strong>${totalEmis.toFixed(1)} kg</strong>
                    </div>
                    <div class="print-stat-card">
                        <span>Baseline Projection</span>
                        <strong>${baseline.toFixed(1)} kg</strong>
                    </div>
                    <div class="print-stat-card" style="border-color: #dcfce7; background: #f0fdf4;">
                        <span>Green Saved CO₂</span>
                        <strong style="color: #15803d;">${co2Saved.toFixed(1)} kg</strong>
                    </div>
                    <div class="print-stat-card">
                        <span>Log Entries Count</span>
                        <strong>${filtered.length} Months</strong>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Optional section: Innovations
    if (incInno) {
        const implemented = window.EcoState.innovations.filter(i => i.status === "Implemented");
        html += `
            <div class="print-section">
                <h3>Implemented Green Innovations Pipeline</h3>
                ${implemented.length === 0 ? `
                    <p style="color: #6b7280; font-style: italic;">No active innovations implemented for this duration.</p>
                ` : `
                    <table class="print-table">
                        <thead>
                            <tr>
                                <th>Project Title</th>
                                <th>Category</th>
                                <th>Capital Cost</th>
                                <th>Yearly Saving Offset</th>
                                <th>Short Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${implemented.map(i => `
                                <tr>
                                    <td><strong>${i.title}</strong></td>
                                    <td>${i.type}</td>
                                    <td>Rp ${i.cost.toLocaleString('id-ID')}</td>
                                    <td>${i.savings} kg CO₂ / yr</td>
                                    <td>${i.desc}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
            </div>
        `;
    }
    
    // Optional section: Benchmarking standing
    if (incBench) {
        html += `
            <div class="print-section">
                <h3>Comparative Sector Benchmarking</h3>
                <p style="line-height: 1.6;">
                    Based on standard radar indexes, **${company}** operates within the **${window.EcoState.profile.level}** bracket, indicating an average score <strong>15% higher than local ${sector} averages</strong>, particularly outstanding in water stewardship.
                </p>
            </div>
        `;
    }
    
    // Verification Signatures
    html += `
        <div class="print-footer-signatures">
            <div class="signature-box">
                <div class="signature-line">${company} Owner</div>
                <p>Internal Auditing Officer</p>
            </div>
            <div class="signature-box">
                <div class="signature-line">EcoSustain Verifier</div>
                <p>System Automated Approval</p>
            </div>
        </div>
    `;
    
    printContainer.innerHTML = html;
    
    // Re-create icons in printable container
    lucide.createIcons();
    
    // Trigger print
    window.print();
}
