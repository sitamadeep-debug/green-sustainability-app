/* ==========================================================================
   EcoSustain Core App & State Manager
   ========================================================================== */

// Global state namespace
window.EcoState = {
    profile: {
        companyName: "GlowOrganic Cafe",
        sector: "Culinary (F&B)",
        points: 40,
        level: "Green Rookie"
    },
    records: [],
    innovations: [],
    targets: [],
    notifications: [],
    
    // Seed and Save functions
    saveState() {
        localStorage.setItem("ecosustain_state", JSON.stringify({
            profile: this.profile,
            records: this.records,
            innovations: this.innovations,
            targets: this.targets,
            notifications: this.notifications
        }));
        
        // Trigger event for other modules to know state has changed
        window.dispatchEvent(new Event("stateUpdated"));
    },
    
    loadState() {
        const saved = localStorage.getItem("ecosustain_state");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.profile = parsed.profile || this.profile;
                this.records = parsed.records || this.records;
                this.innovations = parsed.innovations || this.innovations;
                this.targets = parsed.targets || this.targets;
                this.notifications = parsed.notifications || this.notifications;
            } catch (e) {
                console.error("Error parsing saved state", e);
                this.seedDefaultData();
            }
        } else {
            this.seedDefaultData();
        }
    },
    
    seedDefaultData() {
        // Clear existing
        localStorage.removeItem("ecosustain_state");
        
        this.profile = {
            companyName: "GlowOrganic Cafe",
            sector: "Culinary (F&B)",
            points: 45,
            level: "Green Innovator"
        };
        
        // Seed Records
        this.records = [
            {
                year: "2025",
                month: "December",
                electricity: 480,
                electricityCost: 720000,
                water: 24.5,
                waterCost: 196000,
                plastic: 18.0,
                paper: 50.0,
                organicMaterials: 130.0,
                wasteOrganic: 95.0,
                wasteInorganic: 38.0,
                wasteRecycled: 22.0,
                fuelType: "Petrol",
                fuelQty: 45.0,
                emissions: 673.8 // Calculated emissions
            },
            {
                year: "2026",
                month: "January",
                electricity: 450,
                electricityCost: 675000,
                water: 22.0,
                waterCost: 176000,
                plastic: 16.0,
                paper: 48.0,
                organicMaterials: 140.0,
                wasteOrganic: 92.0,
                wasteInorganic: 32.0,
                wasteRecycled: 28.0,
                fuelType: "Petrol",
                fuelQty: 40.0,
                emissions: 620.4
            },
            {
                year: "2026",
                month: "February",
                electricity: 410,
                electricityCost: 615000,
                water: 19.5,
                waterCost: 156000,
                plastic: 14.5,
                paper: 42.0,
                organicMaterials: 145.0,
                wasteOrganic: 88.0,
                wasteInorganic: 28.0,
                wasteRecycled: 34.0,
                fuelType: "Petrol",
                fuelQty: 38.0,
                emissions: 566.2
            },
            {
                year: "2026",
                month: "March",
                electricity: 380,
                electricityCost: 570000,
                water: 17.0,
                waterCost: 136000,
                plastic: 12.0,
                paper: 46.0,
                organicMaterials: 150.0,
                wasteOrganic: 82.0,
                wasteInorganic: 24.0,
                wasteRecycled: 38.0,
                fuelType: "Petrol",
                fuelQty: 35.0,
                emissions: 522.6
            },
            {
                year: "2026",
                month: "April",
                electricity: 360,
                electricityCost: 540000,
                water: 16.2,
                waterCost: 129600,
                plastic: 10.5,
                paper: 44.0,
                organicMaterials: 160.0,
                wasteOrganic: 80.0,
                wasteInorganic: 20.0,
                wasteRecycled: 42.0,
                fuelType: "Petrol",
                fuelQty: 32.0,
                emissions: 491.5
            }
        ];
        
        // Seed Innovations
        this.innovations = [
            {
                id: "inno-1",
                title: "LED Swapping",
                type: "Process",
                cost: 850000,
                savings: 105.0,
                status: "Implemented",
                desc: "Replaced 18 high-energy fluorescent tubes in our dining hall and kitchen with highly efficient Philips LED lamps, decreasing daily lighting electricity demand by 40%."
            },
            {
                id: "inno-2",
                title: "Cassava Packaging Bags",
                type: "Product",
                cost: 1200000,
                savings: 65.0,
                status: "Implemented",
                desc: "Transitioned takeout carriers from single-use plastics to native Indonesian cassava bag packaging which decomposes naturally in standard composting systems within 180 days."
            },
            {
                id: "inno-3",
                title: "Organic Kitchen Composting",
                type: "Material",
                cost: 450000,
                savings: 80.0,
                status: "In Progress",
                desc: "Initiated a partnership with local organic waste managers. Re-allocating coffee grounds and raw kitchen peelings into fertilizer compost instead of sending to standard city landfills."
            }
        ];
        
        // Seed Targets
        this.targets = [
            {
                id: "target-1",
                metric: "Electricity",
                val: 350.0,
                month: "May",
                achieved: false
            },
            {
                id: "target-2",
                metric: "Plastic",
                val: 8.0,
                month: "May",
                achieved: false
            }
        ];
        
        // Seed Notifications
        this.notifications = [
            {
                id: "notif-1",
                type: "info",
                text: "Welcome to EcoSustain! Start logging your resources to compute your carbon scores.",
                time: "2026-05-21 09:00"
            },
            {
                id: "notif-2",
                type: "success",
                text: "Congratulations! Swapping to Cassava Bags decreased plastic waste by 30%. You earned +10 points!",
                time: "2026-05-21 11:30"
            }
        ];
        
        this.saveState();
    }
};

// Standard Conversion factors
window.CO2_FACTORS = {
    electricity: 0.87,          // kg CO2e / kWh
    water: 0.34,                // kg CO2e / m3
    gasoline: 2.31,             // kg CO2e / Liter
    diesel: 2.68,               // kg CO2e / Liter
    landfillWaste: 0.50,        // kg CO2e / kg
    recycledWasteOffset: -0.20  // kg CO2 offset / kg (environmental credit!)
};

// Calculate emissions for a specific record
window.calculateEmissions = function(rec) {
    let sum = 0;
    sum += rec.electricity * window.CO2_FACTORS.electricity;
    sum += rec.water * window.CO2_FACTORS.water;
    sum += rec.wasteInorganic * window.CO2_FACTORS.landfillWaste;
    sum += rec.wasteRecycled * window.CO2_FACTORS.recycledWasteOffset;
    
    if (rec.fuelType === "Petrol") {
        sum += rec.fuelQty * window.CO2_FACTORS.gasoline;
    } else if (rec.fuelType === "Diesel") {
        sum += rec.fuelQty * window.CO2_FACTORS.diesel;
    }
    
    return parseFloat(sum.toFixed(1));
};

// Document load initializer
document.addEventListener("DOMContentLoaded", () => {
    // Load local storage or default seed data
    window.EcoState.loadState();
    
    // Initialize standard lucide icons
    lucide.createIcons();
    
    // Core Navigation / SPA Router
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".module-section");
    const pageTitle = document.getElementById("page-title");
    
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.getAttribute("data-target");
            
            // Toggle active links
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            
            // Toggle visible sections
            sections.forEach(sec => {
                sec.classList.remove("active");
                if (sec.id === target) {
                    sec.classList.add("active");
                }
            });
            
            // Update Page Title
            let readableTitle = link.querySelector("span").textContent;
            if (target === "dashboard") readableTitle = "Sustainability Dashboard";
            pageTitle.textContent = readableTitle;
            document.title = `EcoSustain | ${readableTitle}`;
            
            // Close mobile sidebar on navigate
            document.getElementById("sidebar").classList.remove("active");
            
            // Dispatch a page-switch event for modules to redraw charts
            window.dispatchEvent(new CustomEvent("pageSwitched", { detail: { page: target } }));
        });
    });
    
    // Hamburger / Mobile Navigation trigger
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mobileCloseBtn = document.getElementById("mobile-close-btn");
    const sidebar = document.getElementById("sidebar");
    
    hamburgerBtn.addEventListener("click", () => {
        sidebar.classList.add("active");
    });
    
    mobileCloseBtn.addEventListener("click", () => {
        sidebar.classList.remove("active");
    });
    
    // Theme toggle logic (Light / Dark)
    const themeToggleBtn = document.getElementById("theme-toggle");
    const root = document.documentElement;
    
    // Set theme on load
    const savedTheme = localStorage.getItem("ecosustain_theme") || "dark";
    root.setAttribute("data-theme", savedTheme);
    
    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = root.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", newTheme);
        localStorage.setItem("ecosustain_theme", newTheme);
        
        // Dispatch theme changed event for Chart redrawings
        window.dispatchEvent(new Event("themeChanged"));
    });
    
    // Profile Edit Modal logic
    const editProfileBtn = document.getElementById("edit-profile-btn");
    const profileModal = document.getElementById("profile-modal");
    const editProfileForm = document.getElementById("edit-profile-form");
    const companyInput = document.getElementById("profile-company-input");
    const sectorInput = document.getElementById("profile-sector-input");
    
    editProfileBtn.addEventListener("click", () => {
        companyInput.value = window.EcoState.profile.companyName;
        sectorInput.value = window.EcoState.profile.sector;
        profileModal.classList.add("active");
    });
    
    editProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        window.EcoState.profile.companyName = companyInput.value;
        window.EcoState.profile.sector = sectorInput.value;
        
        window.EcoState.saveState();
        
        profileModal.classList.remove("active");
        renderUI();
    });
    
    // Notifications Dropdown toggle
    const notificationBtn = document.getElementById("notification-btn");
    const notificationDropdown = document.getElementById("notification-dropdown");
    const clearNotifBtn = document.getElementById("clear-notif-btn");
    
    notificationBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle("active");
    });
    
    document.addEventListener("click", () => {
        notificationDropdown.classList.remove("active");
    });
    
    notificationDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });
    
    clearNotifBtn.addEventListener("click", () => {
        window.EcoState.notifications = [];
        window.EcoState.saveState();
        renderNotifications();
    });
    
    // Green Data Input Form submit
    const greenDataForm = document.getElementById("green-data-form");
    greenDataForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const year = document.getElementById("input-year").value;
        const month = document.getElementById("input-month").value;
        
        const record = {
            year,
            month,
            electricity: parseFloat(document.getElementById("input-electricity").value),
            electricityCost: parseFloat(document.getElementById("input-electricity-cost").value),
            water: parseFloat(document.getElementById("input-water").value),
            waterCost: parseFloat(document.getElementById("input-water-cost").value),
            plastic: parseFloat(document.getElementById("input-plastic").value),
            paper: parseFloat(document.getElementById("input-paper").value),
            organicMaterials: parseFloat(document.getElementById("input-organic-materials").value),
            wasteOrganic: parseFloat(document.getElementById("input-waste-organic").value),
            wasteInorganic: parseFloat(document.getElementById("input-waste-inorganic").value),
            wasteRecycled: parseFloat(document.getElementById("input-waste-recycled").value),
            fuelType: document.getElementById("input-fuel-type").value,
            fuelQty: parseFloat(document.getElementById("input-fuel-qty").value)
        };
        
        record.emissions = window.calculateEmissions(record);
        
        // Check if a record already exists for this period and replace, otherwise add
        const existingIdx = window.EcoState.records.findIndex(r => r.year === year && r.month === month);
        if (existingIdx !== -1) {
            window.EcoState.records[existingIdx] = record;
            addNotification("info", `Replaced data log for ${month} ${year}.`);
        } else {
            window.EcoState.records.push(record);
            // Award experience points for logging data!
            window.EcoState.profile.points += 15;
            addNotification("success", `Logged new sustainability entry for ${month} ${year}! Earned +15 Points.`);
        }
        
        window.EcoState.saveState();
        greenDataForm.reset();
        
        // Go back to the top dashboard or reload
        renderUI();
    });
    
    // Search history input
    const historySearch = document.getElementById("history-search-input");
    historySearch.addEventListener("input", () => {
        renderHistoryTable(historySearch.value);
    });

    // Run initial rendering
    renderUI();
});

// Add notification helper
window.addNotification = function(type, text) {
    const now = new Date();
    const timeStr = now.toISOString().slice(0, 16).replace("T", " ");
    const notif = {
        id: "notif-" + Date.now(),
        type,
        text,
        time: timeStr
    };
    window.EcoState.notifications.unshift(notif);
    // Keep max 8 notifications in list
    if (window.EcoState.notifications.length > 8) {
        window.EcoState.notifications.pop();
    }
};

// Render whole UI on state changes
window.renderUI = function() {
    // 1. Sidebar & Header profile info
    document.getElementById("display-company-name").textContent = window.EcoState.profile.companyName;
    document.getElementById("display-company-sector").textContent = window.EcoState.profile.sector;
    document.getElementById("preview-company-name").textContent = window.EcoState.profile.companyName;
    document.getElementById("preview-company-sector").textContent = window.EcoState.profile.sector;
    
    // Determine level name based on points
    const points = window.EcoState.profile.points;
    let levelName = "Green Rookie";
    if (points >= 120) levelName = "Eco Champion";
    else if (points >= 80) levelName = "Sustainability Leader";
    else if (points >= 40) levelName = "Green Innovator";
    
    window.EcoState.profile.level = levelName;
    document.getElementById("level-name").textContent = levelName;
    
    // 2. Global Carbon Emissions Avoided Calculation (Yearly Accumulation / Savings relative to Baseline Dec 2025)
    // Baseline emissions = 673.8 kg
    let co2SavedTotal = 0;
    if (window.EcoState.records.length > 1) {
        const baseline = 673.8;
        window.EcoState.records.forEach(r => {
            if (r.month !== "December" || r.year !== "2025") {
                const diff = baseline - r.emissions;
                if (diff > 0) co2SavedTotal += diff;
            }
        });
    }
    
    // Add cumulative savings from Innovations implemented!
    window.EcoState.innovations.forEach(i => {
        if (i.status === "Implemented") {
            co2SavedTotal += i.savings / 12; // Monthly contribution of the innovation
        }
    });
    
    document.getElementById("global-co2-saved").textContent = co2SavedTotal.toFixed(1) + " kg";
    
    // 3. Render Top Metric Counters
    renderMetricCounters();
    
    // 4. Score Circle Gauge anim
    renderScoreCircle();
    
    // 5. Input History Table
    renderHistoryTable();
    
    // 6. Sidebar notifications
    renderNotifications();
    
    // Call other module renderers
    if (window.renderInnovationsModule) window.renderInnovationsModule();
    if (window.renderRecommendationsModule) window.renderRecommendationsModule();
    if (window.renderTargetsModule) window.renderTargetsModule();
    if (window.renderEducationModule) window.renderEducationModule();
    if (window.renderBenchmarkingModule) window.renderBenchmarkingModule();
    if (window.renderReportsModule) window.renderReportsModule();
    
    // Fire event for charts to load
    window.dispatchEvent(new Event("ecoUIReady"));
    lucide.createIcons();
};

function renderMetricCounters() {
    const records = window.EcoState.records;
    if (records.length === 0) return;
    
    // Sort chronological: Latest first
    const monthsOrder = ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
    const sorted = [...records].sort((a, b) => {
        if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
        return monthsOrder.indexOf(b.month) - monthsOrder.indexOf(a.month);
    });
    
    const latest = sorted[0];
    const prev = sorted[1];
    
    // Set text values
    document.getElementById("dash-electricity-val").textContent = `${latest.electricity} kWh`;
    document.getElementById("dash-water-val").textContent = `${latest.water} m³`;
    document.getElementById("dash-waste-val").textContent = `${(latest.wasteOrganic + latest.wasteInorganic + latest.wasteRecycled).toFixed(1)} kg`;
    document.getElementById("dash-carbon-val").textContent = `${latest.emissions} kg CO₂e`;
    
    // Handle status badges comparisons
    setMetricCompareBadge("dash-electricity-change", latest.electricity, prev ? prev.electricity : null, "kWh");
    setMetricCompareBadge("dash-water-change", latest.water, prev ? prev.water : null, "m³");
    setMetricCompareBadge("dash-waste-change", 
        latest.wasteOrganic + latest.wasteInorganic + latest.wasteRecycled, 
        prev ? (prev.wasteOrganic + prev.wasteInorganic + prev.wasteRecycled) : null, 
        "kg"
    );
    setMetricCompareBadge("dash-carbon-change", latest.emissions, prev ? prev.emissions : null, "kg CO₂e");
}

function setMetricCompareBadge(elementId, current, prev, unit) {
    const el = document.getElementById(elementId);
    if (prev === null) {
        el.innerHTML = `<i data-lucide="minus"></i> No previous data`;
        el.className = "mini-change";
        return;
    }
    
    const diff = current - prev;
    const pct = ((diff / prev) * 100).toFixed(0);
    
    if (diff > 0) {
        el.innerHTML = `<i data-lucide="trending-up"></i> +${pct}% vs last month`;
        el.className = "mini-change up";
    } else if (diff < 0) {
        el.innerHTML = `<i data-lucide="trending-down"></i> ${pct}% vs last month`;
        el.className = "mini-change down";
    } else {
        el.innerHTML = `<i data-lucide="equal"></i> Unchanged`;
        el.className = "mini-change";
    }
}

function renderScoreCircle() {
    // Score Formula: Base index of 50.
    // +5 points for each Implemented Innovation (max 25)
    // +15 points for High eco-rating compared to averages
    // +15 points for quiz points
    // -10 points if electricity exceeds 400kWh in latest month
    const scoreVal = document.getElementById("sustainability-score");
    const statusVal = document.getElementById("score-status");
    const feedbackVal = document.getElementById("score-feedback");
    const circle = document.getElementById("sustainability-gauge");
    
    let base = 50;
    
    // Implemented innovations contribution
    const activeInnos = window.EcoState.innovations.filter(i => i.status === "Implemented").length;
    base += activeInnos * 8;
    
    // Target completions contribution
    const achievedTargets = window.EcoState.targets.filter(t => t.achieved).length;
    base += achievedTargets * 5;
    
    // Quiz score points contribution
    base += Math.min(15, window.EcoState.profile.points >= 60 ? 15 : (window.EcoState.profile.points >= 45 ? 10 : 0));
    
    // Check latest metrics penalty
    if (window.EcoState.records.length > 0) {
        const sorted = [...window.EcoState.records].sort((a,b) => b.electricity - a.electricity);
        const worst = sorted[0];
        if (worst.electricity > 450) base -= 10;
        if (worst.water > 22) base -= 5;
    }
    
    // Clamp score between 0 and 100
    const finalScore = Math.max(0, Math.min(100, base));
    
    scoreVal.textContent = finalScore;
    
    // Update SVG Circle path length
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (finalScore / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    
    // Adjust feedback comments
    if (finalScore >= 80) {
        statusVal.textContent = "Excellent Eco-Stature!";
        statusVal.style.color = "var(--success-color)";
        feedbackVal.textContent = "Superb job! Your business is an inspiration to green enterprises.";
    } else if (finalScore >= 60) {
        statusVal.textContent = "Great Green Effort";
        statusVal.style.color = "var(--primary-color)";
        feedbackVal.textContent = "Keep going! Implementing process innovations can launch you further.";
    } else {
        statusVal.textContent = "Starter Stage";
        statusVal.style.color = "var(--accent-color)";
        feedbackVal.textContent = "Log your monthly logs and resolve smart actions to raise your ratings.";
    }
}

function renderHistoryTable(filterText = "") {
    const tableBody = document.getElementById("history-table-body");
    tableBody.innerHTML = "";
    
    let filteredRecords = window.EcoState.records;
    if (filterText) {
        filteredRecords = window.EcoState.records.filter(r => 
            r.month.toLowerCase().includes(filterText.toLowerCase()) || 
            r.year.includes(filterText)
        );
    }
    
    // Sort chronological: Latest first
    const monthsOrder = ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
    const sorted = [...filteredRecords].sort((a, b) => {
        if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
        return monthsOrder.indexOf(b.month) - monthsOrder.indexOf(a.month);
    });
    
    if (sorted.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No records found.</td></tr>`;
        return;
    }
    
    sorted.forEach(r => {
        const tr = document.createElement("tr");
        const wasteTotal = (r.wasteOrganic + r.wasteInorganic + r.wasteRecycled).toFixed(1);
        
        tr.innerHTML = `
            <td><strong>${r.month} ${r.year}</strong></td>
            <td>${r.electricity} kWh</td>
            <td>${r.water} m³</td>
            <td>${wasteTotal} kg</td>
            <td><span class="badge ${r.emissions > 550 ? 'danger-badge' : 'success-badge'}">${r.emissions} kg CO₂e</span></td>
            <td>
                <button class="btn-icon-sm delete-btn" onclick="deleteHistoryRecord('${r.year}', '${r.month}')" title="Delete record">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    lucide.createIcons();
}

window.deleteHistoryRecord = function(year, month) {
    if (confirm(`Are you sure you want to permanently delete the logged data for ${month} ${year}?`)) {
        window.EcoState.records = window.EcoState.records.filter(r => !(r.year === year && r.month === month));
        window.EcoState.saveState();
        renderUI();
    }
};

function renderNotifications() {
    const list = document.getElementById("notif-list");
    const badge = document.getElementById("notif-badge");
    
    list.innerHTML = "";
    const notifications = window.EcoState.notifications;
    
    if (notifications.length === 0) {
        badge.classList.add("hidden");
        list.innerHTML = `<div class="notif-empty">No new notifications</div>`;
        return;
    }
    
    badge.classList.remove("hidden");
    badge.textContent = notifications.length;
    
    notifications.forEach(n => {
        const div = document.createElement("div");
        div.className = `notif-item`;
        div.innerHTML = `
            <p><strong>${n.type.toUpperCase()}:</strong> ${n.text}</p>
            <span class="alert-time">${n.time}</span>
        `;
        list.appendChild(div);
    });
}
