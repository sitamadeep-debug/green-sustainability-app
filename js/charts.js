/* ==========================================================================
   EcoSustain Charts Module
   ========================================================================== */

let consumptionChart = null;
let carbonChart = null;
let wasteChart = null;

// Listen to UI state loaded or updated
window.addEventListener("ecoUIReady", () => {
    initDashboardCharts();
});

// Re-draw on theme switch
window.addEventListener("themeChanged", () => {
    initDashboardCharts();
});

// Also trigger on page switch to dashboard just in case of viewport issues
window.addEventListener("pageSwitched", (e) => {
    if (e.detail.page === "dashboard") {
        setTimeout(initDashboardCharts, 50);
    }
});

function initDashboardCharts() {
    const records = window.EcoState.records;
    if (records.length === 0) return;
    
    // Sort chronological: Oldest first for trends
    const monthsOrder = ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
    const sorted = [...records].sort((a, b) => {
        if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
        return monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month);
    });
    
    const labels = sorted.map(r => `${r.month.slice(0, 3)} '${r.year.slice(2)}`);
    
    // Theme configuration
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDark ? "#cbd5e1" : "#334155";
    const fontSettings = {
        family: "'Plus Jakarta Sans', sans-serif",
        size: 11
    };

    // Destory existing chart contexts
    if (consumptionChart) consumptionChart.destroy();
    if (carbonChart) carbonChart.destroy();
    if (wasteChart) wasteChart.destroy();

    // ---------------------------------------------------------
    // CHART 1: Resource Consumption Trends (Mixed Line/Bar)
    // ---------------------------------------------------------
    const consumptionCtx = document.getElementById("consumptionTrendsChart");
    if (consumptionCtx) {
        const elecData = sorted.map(r => r.electricity);
        const waterData = sorted.map(r => r.water);
        
        consumptionChart = new Chart(consumptionCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Electricity (kWh)',
                        data: elecData,
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderColor: '#10b981',
                        borderWidth: 1.5,
                        borderRadius: 6,
                        yAxisID: 'yElectricity',
                        order: 2
                    },
                    {
                        label: 'Water (m³)',
                        data: waterData,
                        type: 'line',
                        borderColor: '#06b6d4',
                        borderWidth: 3,
                        pointBackgroundColor: '#06b6d4',
                        pointBorderColor: isDark ? '#0f172a' : '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.35,
                        fill: false,
                        yAxisID: 'yWater',
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: fontSettings }
                    },
                    yElectricity: {
                        type: 'linear',
                        position: 'left',
                        grid: { color: gridColor },
                        ticks: { 
                            color: textColor, 
                            font: fontSettings,
                            callback: (v) => v + " kWh"
                        }
                    },
                    yWater: {
                        type: 'linear',
                        position: 'right',
                        grid: { display: false },
                        ticks: { 
                            color: textColor, 
                            font: fontSettings,
                            callback: (v) => v + " m³"
                        }
                    }
                }
            }
        });
    }

    // ---------------------------------------------------------
    // CHART 2: Carbon Footprint Breakdown (Doughnut)
    // ---------------------------------------------------------
    const carbonCtx = document.getElementById("carbonBreakdownChart");
    if (carbonCtx) {
        // Pick latest month data for composition breakdown
        const latest = sorted[sorted.length - 1];
        
        const electricityCO2 = parseFloat((latest.electricity * window.CO2_FACTORS.electricity).toFixed(1));
        const waterCO2 = parseFloat((latest.water * window.CO2_FACTORS.water).toFixed(1));
        const wasteCO2 = parseFloat((latest.wasteInorganic * window.CO2_FACTORS.landfillWaste).toFixed(1));
        const fuelCO2 = parseFloat(((latest.fuelType === "Petrol" ? window.CO2_FACTORS.gasoline : window.CO2_FACTORS.diesel) * latest.fuelQty).toFixed(1));
        
        carbonChart = new Chart(carbonCtx, {
            type: 'doughnut',
            data: {
                labels: ['Electricity', 'Water', 'Landfill Waste', 'Delivery Fuel'],
                datasets: [{
                    data: [electricityCO2, waterCO2, wasteCO2, fuelCO2],
                    backgroundColor: [
                        '#10b981', // Emerald
                        '#06b6d4', // Teal/Cyan
                        '#f59e0b', // Amber
                        '#ef4444'  // Coral Red
                    ],
                    borderWidth: isDark ? 3 : 2,
                    borderColor: isDark ? '#141e1b' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            font: fontSettings,
                            boxWidth: 12,
                            padding: 14
                        }
                    }
                },
                cutout: '68%'
            }
        });
    }

    // ---------------------------------------------------------
    // CHART 3: Waste Streams Analysis (Stacked Bar)
    // ---------------------------------------------------------
    const wasteCtx = document.getElementById("wasteAnalysisChart");
    if (wasteCtx) {
        const recycledData = sorted.map(r => r.wasteRecycled);
        const organicData = sorted.map(r => r.wasteOrganic);
        const inorganicData = sorted.map(r => r.wasteInorganic);
        
        wasteChart = new Chart(wasteCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Composted Organic',
                        data: organicData,
                        backgroundColor: '#10b981',
                        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
                    },
                    {
                        label: 'Recycled Inorganic',
                        data: recycledData,
                        backgroundColor: '#10b981',
                        opacity: 0.6,
                        backgroundColor: 'rgba(16, 185, 129, 0.4)'
                    },
                    {
                        label: 'Landfill Waste',
                        data: inorganicData,
                        backgroundColor: '#ef4444',
                        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { color: textColor, font: fontSettings }
                    },
                    y: {
                        stacked: true,
                        grid: { color: gridColor },
                        ticks: { 
                            color: textColor, 
                            font: fontSettings,
                            callback: (v) => v + " kg"
                        }
                    }
                }
            }
        });
    }
}
