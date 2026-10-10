/* ==========================================================================
   EcoSustain Sector Benchmarking Module
   ========================================================================== */

let radarChart = null;
let barBenchmarkChart = null;

// Industry benchmark averages (Standardized indices out of 100)
// Format: [Energy, Water, Circularity, Waste, Logistics]
const SECTOR_BENCHMARKS = {
    "Culinary (F&B)": {
        radar: [60, 50, 45, 55, 65],
        carbonAvg: 600.0, // Monthly average kg CO2e
        descriptions: "Outstanding! You outperform 85% of Culinary businesses in water conservation."
    },
    "Fashion & Textile": {
        radar: [55, 45, 60, 40, 70],
        carbonAvg: 720.0,
        descriptions: "Superb! Your textile circularity is 20% higher than the national industry average."
    },
    "Crafts & Furniture": {
        radar: [70, 75, 40, 65, 50],
        carbonAvg: 480.0,
        descriptions: "Terrific! Wood waste recycling offsets put you in the top 10% of local craftsmen."
    },
    "Retail & Services": {
        radar: [50, 70, 50, 50, 80],
        carbonAvg: 540.0,
        descriptions: "Excellent! Efficient courier bundling sets you far ahead of standard retail models."
    },
    "Micro Manufacturing": {
        radar: [40, 55, 35, 60, 45],
        carbonAvg: 850.0,
        descriptions: "Good effort! Swapping motor gears can launch your machine efficiency past the 60% mark."
    }
};

window.renderBenchmarkingModule = function() {
    initBenchmarkingCharts();
};

// Re-draw on theme switch
window.addEventListener("themeChanged", () => {
    initBenchmarkingCharts();
});

// Re-draw on page switched
window.addEventListener("pageSwitched", (e) => {
    if (e.detail.page === "benchmarking") {
        setTimeout(initBenchmarkingCharts, 50);
    }
});

function initBenchmarkingCharts() {
    const sector = window.EcoState.profile.sector || "Culinary (F&B)";
    const sectorData = SECTOR_BENCHMARKS[sector] || SECTOR_BENCHMARKS["Culinary (F&B)"];
    
    // Set text sector label
    document.getElementById("benchmarking-sector-display").textContent = sector;
    
    const records = window.EcoState.records;
    if (records.length === 0) return;
    
    // Sort chronological: Latest first
    const monthsOrder = ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
    const sorted = [...records].sort((a, b) => {
        if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
        return monthsOrder.indexOf(b.month) - monthsOrder.indexOf(a.month);
    });
    
    const latest = sorted[0];
    
    // Calculate dynamic entity indices (0 - 100) based on actual logs
    // Lower utility values = Higher efficiency indexes!
    const energyIndex = Math.max(10, Math.min(100, 100 - (latest.electricity / 6.0)));
    const waterIndex = Math.max(10, Math.min(100, 100 - (latest.water * 3.5)));
    
    const wasteTotal = latest.wasteOrganic + latest.wasteInorganic + latest.wasteRecycled;
    const wasteIndex = Math.max(10, Math.min(100, wasteTotal > 0 ? (100 - (latest.wasteInorganic / wasteTotal) * 100) : 50));
    
    // Circularity boosted by recyclables + implemented innovations count
    const activeInnoBonus = window.EcoState.innovations.filter(i => i.status === "Implemented").length * 8;
    const circularIndex = Math.max(10, Math.min(100, (wasteTotal > 0 ? (latest.wasteRecycled / wasteTotal) * 100 : 30) + activeInnoBonus));
    
    const logisticsIndex = Math.max(10, Math.min(100, 100 - (latest.fuelQty * 2.0)));
    
    const myPillars = [
        parseFloat(energyIndex.toFixed(0)),
        parseFloat(waterIndex.toFixed(0)),
        parseFloat(circularIndex.toFixed(0)),
        parseFloat(wasteIndex.toFixed(0)),
        parseFloat(logisticsIndex.toFixed(0))
    ];
    
    // Set dynamic sector standing ranking
    // Calculate overall average standing comparison
    const myAverage = myPillars.reduce((a,b) => a+b, 0) / 5;
    const sectorAverage = sectorData.radar.reduce((a,b) => a+b, 0) / 5;
    
    const rankText = document.getElementById("sector-rank-text");
    const rankDesc = document.getElementById("sector-rank-desc");
    
    const diffPct = myAverage - sectorAverage;
    if (diffPct > 15) {
        rankText.textContent = "Top 10%";
        rankText.className = "text-success";
        rankDesc.textContent = sectorData.descriptions;
    } else if (diffPct > 5) {
        rankText.textContent = "Top 25%";
        rankText.className = "text-success";
        rankDesc.textContent = `Great! Your green efforts score 15% above standard ${sector.split(" ")[0]} benchmarks.`;
    } else if (diffPct > -5) {
        rankText.textContent = "Average";
        rankText.className = "text-accent";
        rankDesc.textContent = `On par with sector competitors. Switch planned innovations to active status to leap ahead!`;
    } else {
        rankText.textContent = "Below Average";
        rankText.className = "text-danger";
        rankDesc.textContent = `Flagged carbon potentials detected. Check Smart Recommendations for quick efficiency wins!`;
    }

    // Chart styling setup
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
    const textColor = isDark ? "#cbd5e1" : "#334155";
    const fontSettings = { family: "'Plus Jakarta Sans', sans-serif", size: 10 };
    
    // Destroy previous chart contexts
    if (radarChart) radarChart.destroy();
    if (barBenchmarkChart) barBenchmarkChart.destroy();

    // ---------------------------------------------------------
    // CHART 1: Radar Pillar Index Comparison
    // ---------------------------------------------------------
    const radarCtx = document.getElementById("radarBenchmarkChart");
    if (radarCtx) {
        radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Energy Efficiency', 'Water Conservation', 'Material Circularity', 'Waste Reduction', 'Logistics Footprint'],
                datasets: [
                    {
                        label: 'My Business Performance',
                        data: myPillars,
                        backgroundColor: 'rgba(16, 185, 129, 0.25)',
                        borderColor: '#10b981',
                        borderWidth: 2,
                        pointBackgroundColor: '#10b981'
                    },
                    {
                        label: `${sector} Sector Average`,
                        data: sectorData.radar,
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        pointBackgroundColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, font: fontSettings, boxWidth: 12 }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: { color: textColor, font: fontSettings },
                        ticks: {
                            display: false, // Hide numeric values to look cleaner
                            max: 100,
                            min: 0,
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    // ---------------------------------------------------------
    // CHART 2: Carbon Comparison Bar Chart
    // ---------------------------------------------------------
    const barCtx = document.getElementById("barBenchmarkChart");
    if (barCtx) {
        barBenchmarkChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Sector Avg', 'My Emissions'],
                datasets: [{
                    data: [sectorData.carbonAvg, latest.emissions],
                    backgroundColor: [
                        isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                        latest.emissions <= sectorData.carbonAvg ? '#10b981' : '#ef4444'
                    ],
                    borderRadius: 8,
                    borderWidth: 0
                }]
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
                    y: {
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
