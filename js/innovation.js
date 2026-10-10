/* ==========================================================================
   EcoSustain Green Innovation Tracker Module
   ========================================================================== */

// Bind renderer to global namespace
window.renderInnovationsModule = function() {
    renderInnovationTracker();
};

document.addEventListener("ecoUIReady", () => {
    setupInnovationEventHandlers();
});

function setupInnovationEventHandlers() {
    const addInnoBtn = document.getElementById("add-innovation-btn");
    const innovationModal = document.getElementById("innovation-modal");
    const addInnoForm = document.getElementById("add-innovation-form");
    
    if (addInnoBtn) {
        addInnoBtn.addEventListener("click", () => {
            addInnoForm.reset();
            innovationModal.classList.add("active");
        });
    }
    
    if (addInnoForm) {
        addInnoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const costVal = parseFloat(document.getElementById("inno-cost").value);
            const savingsVal = parseFloat(document.getElementById("inno-savings").value);
            
            const newInno = {
                id: "inno-" + Date.now(),
                title: document.getElementById("inno-title").value,
                type: document.getElementById("inno-type").value,
                cost: costVal,
                savings: savingsVal,
                status: document.getElementById("inno-status").value,
                desc: document.getElementById("inno-desc").value
            };
            
            window.EcoState.innovations.push(newInno);
            
            // Award experience points for implementing green actions!
            if (newInno.status === "Implemented") {
                window.EcoState.profile.points += 20;
                addNotification("success", `Implemented "${newInno.title}"! Earned +20 Sustainability Points.`);
            } else {
                window.EcoState.profile.points += 5;
                addNotification("info", `Logged planned innovation: "${newInno.title}".`);
            }
            
            window.EcoState.saveState();
            innovationModal.classList.remove("active");
            renderUI();
        });
    }
}

function renderInnovationTracker() {
    const listProduct = document.getElementById("pipeline-product");
    const listProcess = document.getElementById("pipeline-process");
    const listMaterial = document.getElementById("pipeline-material");
    
    if (!listProduct || !listProcess || !listMaterial) return;
    
    // Clear lists
    listProduct.innerHTML = "";
    listProcess.innerHTML = "";
    listMaterial.innerHTML = "";
    
    let countProd = 0;
    let countProc = 0;
    let countMat = 0;
    
    let totalCost = 0;
    let yearlySavings = 0;
    
    window.EcoState.innovations.forEach(inno => {
        const card = document.createElement("div");
        card.className = "innovation-card";
        
        let statusTagClass = "tag-status-planned";
        if (inno.status === "Implemented") {
            statusTagClass = "tag-status-implemented";
            yearlySavings += inno.savings;
        } else if (inno.status === "In Progress") {
            statusTagClass = "tag-status-inprogress";
            yearlySavings += inno.savings * 0.5; // Count 50% for in-progress actions
        }
        
        totalCost += inno.cost;
        
        card.innerHTML = `
            <div class="inno-card-header">
                <h4>${inno.title}</h4>
                <button class="inno-delete-btn" onclick="deleteInnovation('${inno.id}')" title="Delete Innovation">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            <p class="inno-card-desc">${inno.desc}</p>
            <div class="inno-tags">
                <span class="tag ${statusTagClass}">${inno.status.toUpperCase()}</span>
            </div>
            <div class="inno-impact-row">
                <span>Cost: <strong>${formatRupiah(inno.cost)}</strong></span>
                <span>CO₂ saved: <strong>${inno.savings} kg/yr</strong></span>
            </div>
        `;
        
        if (inno.type === "Product") {
            listProduct.appendChild(card);
            countProd++;
        } else if (inno.type === "Process") {
            listProcess.appendChild(card);
            countProc++;
        } else if (inno.type === "Material") {
            listMaterial.appendChild(card);
            countMat++;
        }
    });
    
    // Check if lists are empty
    checkEmptyPipeline(listProduct, "No product innovations recorded yet.");
    checkEmptyPipeline(listProcess, "No process innovations recorded yet.");
    checkEmptyPipeline(listMaterial, "No sustainable materials recorded yet.");
    
    // Set headers count badges
    document.getElementById("count-product").textContent = countProd;
    document.getElementById("count-process").textContent = countProc;
    document.getElementById("count-material").textContent = countMat;
    
    // Set overview counters
    document.getElementById("active-inno-count").textContent = window.EcoState.innovations.filter(i => i.status === "Implemented").length;
    document.getElementById("active-inno-cost").textContent = formatRupiah(totalCost);
    document.getElementById("active-inno-savings").textContent = `${yearlySavings.toFixed(1)} kg`;
    
    // Update dashboard summary
    const dashInnos = document.getElementById("dash-active-innovations");
    if (dashInnos) {
        const implementedCount = window.EcoState.innovations.filter(i => i.status === "Implemented").length;
        dashInnos.textContent = `${implementedCount} active projects reducing footprint`;
    }
    
    lucide.createIcons();
}

function checkEmptyPipeline(el, text) {
    if (el.children.length === 0) {
        el.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding: 32px 16px; border: 1px dashed var(--border-color); border-radius: 12px;">${text}</div>`;
    }
}

window.deleteInnovation = function(id) {
    const inno = window.EcoState.innovations.find(i => i.id === id);
    if (!inno) return;
    
    if (confirm(`Are you sure you want to permanently delete the green innovation: "${inno.title}"?`)) {
        window.EcoState.innovations = window.EcoState.innovations.filter(i => i.id !== id);
        addNotification("info", `Deleted innovation project: "${inno.title}"`);
        window.EcoState.saveState();
        renderUI();
    }
};

function formatRupiah(amount) {
    return "Rp " + amount.toLocaleString("id-ID");
}
