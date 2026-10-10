/* ==========================================================================
   EcoSustain Eco Targets & Threshold Alerts
   ========================================================================== */

// Bind renderer to global namespace
window.renderTargetsModule = function() {
    renderTargets();
};

document.addEventListener("ecoUIReady", () => {
    setupTargetsEventHandlers();
});

function setupTargetsEventHandlers() {
    const createTargetBtn = document.getElementById("create-target-btn");
    const targetModal = document.getElementById("target-modal");
    const createTargetForm = document.getElementById("create-target-form");
    
    if (createTargetBtn) {
        createTargetBtn.addEventListener("click", () => {
            createTargetForm.reset();
            targetModal.classList.add("active");
        });
    }
    
    if (createTargetForm) {
        createTargetForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const metric = document.getElementById("target-metric").value;
            const targetVal = parseFloat(document.getElementById("target-val").value);
            const targetMonth = document.getElementById("target-month").value;
            
            const newTarget = {
                id: "target-" + Date.now(),
                metric,
                val: targetVal,
                month: targetMonth,
                achieved: false
            };
            
            // Check duplicate
            const duplicate = window.EcoState.targets.find(t => t.metric === metric && t.month === targetMonth);
            if (duplicate) {
                alert(`An active goal is already registered for ${metric} in ${targetMonth}!`);
                return;
            }
            
            window.EcoState.targets.push(newTarget);
            addNotification("info", `Registered target conservation limit of ${targetVal} for ${metric} (${targetMonth}).`);
            
            window.EcoState.saveState();
            targetModal.classList.remove("active");
            renderUI();
        });
    }
}

function renderTargets() {
    const listContainer = document.getElementById("targets-list-container");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    const targets = window.EcoState.targets;
    const records = window.EcoState.records;
    
    if (targets.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px;"><i data-lucide="target" style="width: 32px; height: 32px; margin-bottom: 12px; display: inline-block;"></i><p>No active eco-conservation targets defined. Create one to challenge your resource efficiency!</p></div>`;
        return;
    }
    
    // Sort records latest first to match actual numbers
    const monthsOrder = ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
    const sortedRecords = [...records].sort((a, b) => {
        if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
        return monthsOrder.indexOf(b.month) - monthsOrder.indexOf(a.month);
    });
    
    const latestRecord = sortedRecords[0];
    let pendingCount = 0;
    
    targets.forEach(t => {
        const div = document.createElement("div");
        div.className = "target-progress-card";
        
        let actual = 0;
        let unit = "units";
        
        // Find actual values logged for target's specified month
        // Default to latest if not logged yet
        const matchingRecord = records.find(r => r.month === t.month) || latestRecord;
        
        if (matchingRecord) {
            if (t.metric === "Electricity") {
                actual = matchingRecord.electricity;
                unit = "kWh";
            } else if (t.metric === "Water") {
                actual = matchingRecord.water;
                unit = "m³";
            } else if (t.metric === "Plastic") {
                actual = matchingRecord.plastic;
                unit = "kg";
            } else if (t.metric === "Waste") {
                actual = matchingRecord.wasteOrganic + matchingRecord.wasteInorganic + matchingRecord.wasteRecycled;
                unit = "kg";
            }
        }
        
        // Calculate progress percentage
        // Since targets are conservation limits: lower = better!
        // Progress percentage = actual / target. 
        // If actual is 0 (no record), pct is 0.
        let progressPct = 0;
        if (actual > 0) {
            progressPct = Math.min(100, (actual / t.val) * 100);
        }
        
        // Check if target is achieved
        // If we have logged data for the target month AND actual <= target limit
        const loggedForMonth = records.some(r => r.month === t.month);
        let achievedStatus = false;
        if (loggedForMonth && actual > 0 && actual <= t.val) {
            achievedStatus = true;
            if (!t.achieved) {
                t.achieved = true;
                // Give points!
                window.EcoState.profile.points += 10;
                addNotification("success", `Target Achieved! Kept ${t.metric} under ${t.val} ${unit} in ${t.month}. Earned +10 Points!`);
                setTimeout(() => window.EcoState.saveState(), 50);
            }
        } else if (loggedForMonth && actual > t.val) {
            t.achieved = false;
        }
        
        if (!t.achieved) pendingCount++;
        
        // Progress bar color based on conservation status
        // Under target limit (Good) -> Green, Exceeding (Bad) -> Coral Red
        const barColor = actual <= t.val ? "var(--success-color)" : "var(--danger-color)";
        
        div.innerHTML = `
            <div class="target-card-header">
                <div class="target-title-group">
                    <h4>Limit ${t.metric} Consumption</h4>
                    <p>Period: ${t.month} 2026 | Status: <strong>${t.achieved ? 'Achieved ✓' : 'Active'}</strong></p>
                </div>
                <button class="target-action-btn" onclick="deleteTarget('${t.id}')" title="Remove target">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            
            <div class="target-progress-bar-group">
                <div class="target-bar-bg">
                    <div class="target-bar-fill" style="width: ${progressPct}%; background-color: ${barColor};"></div>
                </div>
            </div>
            
            <div class="target-stats-row">
                <span>Logged: <strong>${actual.toFixed(1)} ${unit}</strong></span>
                <span>Target: <strong>${t.val} ${unit}</strong></span>
            </div>
        `;
        
        listContainer.appendChild(div);
    });
    
    // Update dashboard summary
    const dashTargets = document.getElementById("dash-pending-targets");
    if (dashTargets) {
        dashTargets.textContent = `${pendingCount} conservation goals set for this month`;
    }
    
    // Render Threshold Alarms/Alerts Side bar
    renderThresholdAlerts(latestRecord);
    
    lucide.createIcons();
}

function renderThresholdAlerts(latest) {
    const alertList = document.getElementById("alerts-log-list");
    if (!alertList) return;
    
    alertList.innerHTML = "";
    
    if (!latest) {
        alertList.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding: 24px 0;">No resources logged yet.</div>`;
        return;
    }
    
    let hasAlerts = false;
    
    // Alert: Electricity Limit
    if (latest.electricity > 400) {
        hasAlerts = true;
        const div = document.createElement("div");
        div.className = "alert-item";
        div.innerHTML = `
            <i data-lucide="alert-triangle"></i>
            <div class="alert-content">
                <p><strong>Power Bill Alert:</strong> Your electricity drain (${latest.electricity} kWh) is flagged 25% above recommended green brackets.</p>
                <span class="alert-time">Triggered for ${latest.month} log</span>
            </div>
        `;
        alertList.appendChild(div);
    }
    
    // Alert: Water Leak / Overhead
    if (latest.water > 20.0) {
        hasAlerts = true;
        const div = document.createElement("div");
        div.className = "alert-item";
        div.innerHTML = `
            <i data-lucide="alert-triangle"></i>
            <div class="alert-content">
                <p><strong>Water Overflow:</strong> High consumption logged (${latest.water} m³). Inspect tap heads for dripping leaks or optimize washing logs.</p>
                <span class="alert-time">Triggered for ${latest.month} log</span>
            </div>
        `;
        alertList.appendChild(div);
    }
    
    // Alert: Single use plastics
    if (latest.plastic > 12.0) {
        hasAlerts = true;
        const div = document.createElement("div");
        div.className = "alert-item";
        div.innerHTML = `
            <i data-lucide="alert-triangle"></i>
            <div class="alert-content">
                <p><strong>Excess Plastics:</strong> Takeout carrier packaging is generating high single-use polymers (${latest.plastic} kg). Ganti ke eco bag!</p>
                <span class="alert-time">Triggered for ${latest.month} log</span>
            </div>
        `;
        alertList.appendChild(div);
    }
    
    if (!hasAlerts) {
        const div = document.createElement("div");
        div.className = "alert-item success";
        div.innerHTML = `
            <i data-lucide="check-circle2"></i>
            <div class="alert-content">
                <p><strong>Consumptions Safe:</strong> Amazing! All logged materials and utilities are operating within safe ecological bounds.</p>
                <span class="alert-time">Updated just now</span>
            </div>
        `;
        alertList.appendChild(div);
    }
    
    lucide.createIcons();
}

window.deleteTarget = function(id) {
    const target = window.EcoState.targets.find(t => t.id === id);
    if (!target) return;
    
    if (confirm(`Remove the active conservation target for ${target.metric}?`)) {
        window.EcoState.targets = window.EcoState.targets.filter(t => t.id !== id);
        window.EcoState.saveState();
        renderUI();
    }
};
