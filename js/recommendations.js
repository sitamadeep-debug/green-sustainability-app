/* ==========================================================================
   EcoSustain Dynamic Recommendation Engine
   ========================================================================== */

// Bind renderer to global namespace
window.renderRecommendationsModule = function() {
    renderRecommendations();
};

function renderRecommendations() {
    const recsGrid = document.getElementById("recs-grid");
    if (!recsGrid) return;
    
    recsGrid.innerHTML = "";
    
    const records = window.EcoState.records;
    if (records.length === 0) {
        recsGrid.innerHTML = `<div class="glass-panel" style="text-align: center; color: var(--text-muted); padding: 40px;"><i data-lucide="info" style="width: 32px; height: 32px; margin-bottom: 12px; display: inline-block;"></i><p>Log monthly resource records in "Green Data Input" to trigger smart recommendations based on your usage.</p></div>`;
        return;
    }
    
    // Sort chronological: Latest first
    const monthsOrder = ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
    const sorted = [...records].sort((a, b) => {
        if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
        return monthsOrder.indexOf(b.month) - monthsOrder.indexOf(a.month);
    });
    
    const latest = sorted[0];
    const recsList = [];
    
    // Rule 1: Electricity limits
    if (latest.electricity > 350) {
        recsList.push({
            id: "rec-elec-led",
            metric: "Electricity",
            targetVal: 320,
            title: "Transition Entire Facility to LED Lights",
            desc: "Your electricity consumption is currently at " + latest.electricity + " kWh, exceeding the recommended limit. Swapping standard halogen lights with high-efficacy LED alternatives can drop your lighting cost and power drain by up to 45%.",
            icon: "zap",
            colorClass: "energy-bg",
            impact: "High",
            savingsCo2: 52,
            savingsCost: "Rp 150,000 / mo"
        });
    }
    
    // Rule 2: Water limits
    if (latest.water > 18.0) {
        recsList.push({
            id: "rec-water-aerator",
            metric: "Water",
            targetVal: 15.0,
            title: "Install Kitchen Faucet Aerators",
            desc: "Your water utilization is currently at " + latest.water + " m³ this month. Simple aerators mix air into stream flows, reducing raw volume demand by 30% without affecting cleaning effectiveness.",
            icon: "droplet",
            colorClass: "water-bg",
            impact: "Medium",
            savingsCo2: 12,
            savingsCost: "Rp 40,000 / mo"
        });
    }
    
    // Rule 3: Single-use plastics packaging
    if (latest.plastic > 10.0) {
        recsList.push({
            id: "rec-plastic-cassava",
            metric: "Plastic",
            targetVal: 7.0,
            title: "Deploy Native Cassava Packaging Bags",
            desc: "You logged " + latest.plastic + " kg of single-use plastic. By swapping traditional polybags with standard Indonesian cassava starch bags, you lower petroleum polymer usage and secure compostable assets.",
            icon: "package",
            colorClass: "waste-bg",
            impact: "High",
            savingsCo2: 45,
            savingsCost: "Eco Credential boost"
        });
    }
    
    // Rule 4: Inorganic landfill wastes
    const wasteTotal = latest.wasteOrganic + latest.wasteInorganic + latest.wasteRecycled;
    const inorganicRatio = wasteTotal > 0 ? (latest.wasteInorganic / wasteTotal) * 100 : 0;
    if (inorganicRatio > 25.0) {
        recsList.push({
            id: "rec-waste-compost",
            metric: "Waste",
            targetVal: (latest.wasteOrganic + latest.wasteInorganic + latest.wasteRecycled) * 0.8,
            title: "Establish Organic Material Composting Logs",
            desc: "Your non-recycled landfill waste accounts for " + inorganicRatio.toFixed(0) + "% of total waste streams. Composting your organic kitchen scraps converts local waste into nitrogen-rich fertilizers.",
            icon: "refresh-cw",
            colorClass: "success-bg",
            impact: "High",
            savingsCo2: 38,
            savingsCost: "Rp 60,000 in fertilizer"
        });
    }
    
    // Rule 5: Delivery gasoline and fuel costs
    if (latest.fuelQty > 30.0) {
        recsList.push({
            id: "rec-fuel-route",
            metric: "Fuel",
            targetVal: latest.fuelQty * 0.85,
            title: "Optimize Local Delivery Route Sequences",
            desc: "Your vehicle fuel log reached " + latest.fuelQty + " Liters. Consolidating delivery slots, prioritizing drop sequences, or shifting to electric vehicle logistics minimizes emissions.",
            icon: "truck",
            colorClass: "carbon-bg",
            impact: "Medium",
            savingsCo2: 24,
            savingsCost: "Rp 120,000 / mo"
        });
    }
    
    // If no criteria matched, show fallback green guidelines
    if (recsList.length === 0) {
        recsList.push({
            id: "rec-fallback",
            metric: "General",
            targetVal: 0,
            title: "Audit Standby Equipment Parasitic Power",
            desc: "Terrific! All your metrics are currently below warning levels. Take your efficiency further by implementing smart plugs and cutting parasitic vampire electricity drains at night.",
            icon: "sparkles",
            colorClass: "primary-bg",
            impact: "Low",
            savingsCo2: 10,
            savingsCost: "Rp 35,000 / mo"
        });
    }
    
    recsList.forEach(rec => {
        const card = document.createElement("div");
        card.className = "rec-card";
        
        let impactClass = "impact-low";
        if (rec.impact === "High") impactClass = "impact-high";
        else if (rec.impact === "Medium") impactClass = "impact-med";
        
        card.innerHTML = `
            <div class="rec-icon-area ${rec.colorClass}">
                <i data-lucide="${rec.icon}"></i>
            </div>
            <div class="rec-details">
                <div class="rec-title-row">
                    <h4>${rec.title}</h4>
                    <span class="rec-impact-badge ${impactClass}">${rec.impact} Impact</span>
                </div>
                <p class="rec-desc">${rec.desc}</p>
                <div class="rec-footer">
                    <div class="rec-meta">
                        <span>CO₂ Reduction: <strong>${rec.savingsCo2} kg/yr</strong></span>
                        <span>Est. Cost Savings: <strong>${rec.savingsCost}</strong></span>
                    </div>
                    ${rec.targetVal > 0 ? `
                    <button class="btn-text" onclick="applyRecommendationToTarget('${rec.metric}', ${rec.targetVal}, '${rec.title}')">
                        <i data-lucide="plus-circle"></i> Add as Target
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        recsGrid.appendChild(card);
    });
    
    lucide.createIcons();
}

window.applyRecommendationToTarget = function(metric, value, title) {
    // Add to targets
    const id = "target-" + Date.now();
    const newTarget = {
        id,
        metric,
        val: parseFloat(value.toFixed(1)),
        month: "May", // Default to current operational month
        achieved: false
    };
    
    // Check if target for this metric already exists in active
    const duplicate = window.EcoState.targets.find(t => t.metric === metric && t.month === "May");
    if (duplicate) {
        alert(`You already have an active target for ${metric} set for this month!`);
        return;
    }
    
    window.EcoState.targets.push(newTarget);
    
    // Add toast notification
    addNotification("success", `Created conservation target: Limit ${metric} to ${value} based on "${title}"!`);
    window.EcoState.saveState();
    
    // Navigate to target panel immediately
    document.querySelector(".nav-link[data-target='targets']").click();
};
