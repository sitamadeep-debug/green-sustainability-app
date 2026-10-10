/* ==========================================================================
   EcoSustain Eco Academy & Interactive Quiz Module
   ========================================================================== */

const ACADEMY_LESSONS = {
    "1": {
        title: "Quick Wins for Lowering MSME Power Bills",
        category: "ENERGY EFFICIENCY",
        content: `
            <p>Reducing energy consumption is one of the fastest ways for a small business to lower operating costs while slashing carbon emissions. Heating, ventilation, and lighting typically consume the bulk of commercial power. Here are concrete, low-cost steps to achieve quick wins:</p>
            <br>
            <h4>1. Switch to High-Efficiency LED Lighting</h4>
            <p>Incandescent and halogen bulbs waste up to 90% of their energy as heat. Swapping them with light-emitting diodes (LEDs) reduces electricity draw for lighting by 75–80%. LEDs also last up to 25 times longer, cutting maintenance replacement costs.</p>
            <br>
            <h4>2. Eliminate "Vampire" Standby Power Draw</h4>
            <p>Electronics, printers, coffee machines, and computers consume power even when turned off if they remain plugged in. This is known as standby load or "vampire power." Plug these devices into smart power strips that automatically cut electricity flow when the primary device goes idle.</p>
            <br>
            <h4>3. Optimize Thermostat and AC Settings</h4>
            <p>For air-conditioned facilities, keeping the indoor temperature at a comfortable 24°C–25°C rather than freezing temperatures saves considerable compressor stress. Each degree cooler you set your AC increases energy bills by approximately 6–8%.</p>
            <br>
            <h4>4. Implement Natural Daylight and Ventilation Zones</h4>
            <p>Arrange work desks, seating, and prep areas closer to large windows. Capitalizing on natural morning light and cross-ventilation breezes reduces the need for artificial overhead bulbs and mechanical fans during the day.</p>
        `
    },
    "2": {
        title: "Zero Waste and the Circular Economy for Small Businesses",
        category: "CIRCULAR ECONOMY",
        content: `
            <p>Moving away from the traditional linear "take-make-waste" model towards a circular loop saves resources, builds brand loyalty, and minimizes high municipal landfill fees. Circular economy practices prioritize keeping materials in use for as long as possible. Here is how your MSME can start:</p>
            <br>
            <h4>1. Conduct a Simple Trash Bin Audit</h4>
            <p>Spend one week examining what your business throws away. You will likely find that a significant portion of trash is organic food waste, clean cardboard packaging, or single-use plastics. Separating these streams is the first step to circularity.</p>
            <br>
            <h4>2. Set Up a Kitchen Composting System</h4>
            <p>If you operate in the food sector, organic waste makes up over 60% of your trash. Partner with local urban farming groups, gardens, or community composting projects to divert raw food peelings, eggshells, and coffee grounds away from landfills, where they otherwise decompose anaerobically to produce toxic methane gas.</p>
            <br>
            <h4>3. Eliminate Single-Use Plastics</h4>
            <p>Replace plastic takeout cutlery, bags, and cups with biodegradable cassava starch, paper, or bamboo alternatives. Encourage dine-in customers to use reusable ceramic mugs and metal cutlery. Offer a small discount (e.g., Rp 2,000) for customers bringing their own reusable containers.</p>
            <br>
            <h4>4. Partner with Upcyclers and Waste Processors</h4>
            <p>Clean paper, cardboard, glass bottles, and plastics can be sold or donated directly to local waste banks ("Bank Sampah") or upcycling collectives that transform raw scrap materials into premium handmade crafts, bags, and commercial commodities.</p>
        `
    },
    "3": {
        title: "Practical Rainwater Harvesting and Greywater Reuse",
        category: "WATER CONSERVATION",
        content: `
            <p>Water is a shared precious natural resource. With increasing urban water stress and rising municipal tap utility prices, conserving and recycling water protects localized aquatic reserves and ensures business resilience. Implement these practical plumbing steps:</p>
            <br>
            <h4>1. Install Aerators on All Facility Faucets</h4>
            <p>Faucet aerators are small, inexpensive mesh screens screwed onto the tips of water taps. They inject tiny air bubbles into the flowing stream, maintaining high water pressure while cutting the physical water output volume by 30% to 50%. This is highly effective in kitchen prep and wash sinks.</p>
            <br>
            <h4>2. Capture and Harvest Rainwater</h4>
            <p>Install gutter collectors on your building's roof leading into dedicated holding barrels or tanks fitted with simple mesh filters. While rain runoff is not safe for drinking without advanced treatment, it is perfectly suited for flushing toilets, washing facility floors, and watering landscaped garden zones.</p>
            <br>
            <h4>3. Repurpose Graywater Responsibly</h4>
            <p>Graywater refers to gently used wastewater generated from handwashing sinks, air conditioning condensation lines, and laundry drains. By running these pipes through basic sand-and-gravel sedimentation filters, this water can be safely utilized to flush toilets or water landscaping, decreasing fresh municipal water demand by up to 30%.</p>
            <br>
            <h4>4. Upgrade to Dual-Flush Sanitation Toilets</h4>
            <p>Older single-flush toilets use up to 9–12 liters of clean water per flush. Installing dual-flush retrofits decreases water usage to just 3 liters for liquid waste and 6 liters for solid waste, yielding immediate utility billing savings.</p>
        `
    }
};

const QUIZ_QUESTIONS = [
    {
        q: "Which greenhouse gas is primarily emitted when food waste decomposes in landfills?",
        options: [
            "Methane (CH₄)",
            "Carbon Dioxide (CO₂)",
            "Nitrous Oxide (N₂O)",
            "Oxygen (O₂)"
        ],
        correct: 0
    },
    {
        q: "What is the primary objective of a Circular Economy?",
        options: [
            "To manufacture products as fast as possible",
            "To design out waste and keep materials in use continuously",
            "To maximize single-use plastic consumption",
            "To increase the volume of landfill waste"
        ],
        correct: 1
    },
    {
        q: "How much energy does an LED bulb typically save compared to a standard halogen bulb?",
        options: [
            "10% to 20%",
            "40% to 50%",
            "75% to 80%",
            "No difference"
        ],
        correct: 2
    },
    {
        q: "What is 'Vampire Power' in energy management?",
        options: [
            "High power consumed by cooling machines",
            "Standby electricity drawn by plugged-in devices even when turned off",
            "Power generated using wind energy at night",
            "Electricity used exclusively during Halloween"
        ],
        correct: 1
    },
    {
        q: "Which of the following is considered an eco-friendly alternative to single-use plastic carrier bags?",
        options: [
            "Polystyrene packaging boxes",
            "High-density polyethylene bags",
            "Cassava starch bags",
            "PVC wrap"
        ],
        correct: 2
    }
];

let currentQuestionIdx = 0;
let quizScore = 0;
let userAnswers = [];

window.renderEducationModule = function() {
    renderEducationStats();
};

document.addEventListener("ecoUIReady", () => {
    setupEducationHandlers();
});

function setupEducationHandlers() {
    // Tab switching inside Academy
    const tabBtns = document.querySelectorAll(".academy-tab-btn");
    const tabContents = document.querySelectorAll(".academy-tab-content");
    
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const targetTab = btn.getAttribute("data-tab");
            tabContents.forEach(content => {
                content.classList.remove("active");
                if (content.id === `academy-${targetTab}-tab`) {
                    content.classList.add("active");
                }
            });
        });
    });
    
    // Read guide details buttons
    const readBtns = document.querySelectorAll(".btn-text[data-lesson]");
    const lessonModal = document.getElementById("lesson-modal");
    const lessonTitle = document.getElementById("lesson-modal-title");
    const lessonBody = document.getElementById("lesson-modal-body");
    
    readBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const lessonId = btn.getAttribute("data-lesson");
            const lesson = ACADEMY_LESSONS[lessonId];
            if (lesson) {
                lessonTitle.textContent = lesson.title;
                lessonBody.innerHTML = `
                    <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Category: <strong>${lesson.category}</strong></div>
                    <hr style="border: none; border-top: 1px solid var(--border-color); margin-bottom: 16px;">
                    <div class="lesson-content-text">${lesson.content}</div>
                `;
                lessonModal.classList.add("active");
                
                // Award points for reading the guide!
                if (!localStorage.getItem(`read_lesson_${lessonId}`)) {
                    window.EcoState.profile.points += 5;
                    localStorage.setItem(`read_lesson_${lessonId}`, "true");
                    addNotification("success", `Learned about ${lesson.category}! Earned +5 Points.`);
                    window.EcoState.saveState();
                    renderUI();
                }
            }
        });
    });
    
    // Quiz gameplay buttons
    const startQuizBtn = document.getElementById("start-quiz-btn");
    const nextQuestionBtn = document.getElementById("next-question-btn");
    const restartQuizBtn = document.getElementById("restart-quiz-btn");
    
    if (startQuizBtn) {
        startQuizBtn.addEventListener("click", startQuizChallenge);
    }
    
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener("click", loadNextQuestion);
    }
    
    if (restartQuizBtn) {
        restartQuizBtn.addEventListener("click", startQuizChallenge);
    }
}

function renderEducationStats() {
    const dashAcademy = document.getElementById("dash-academy-points");
    if (dashAcademy) {
        dashAcademy.textContent = `${window.EcoState.profile.points} Academy points earned`;
    }
}

function startQuizChallenge() {
    currentQuestionIdx = 0;
    quizScore = 0;
    userAnswers = [];
    
    document.getElementById("quiz-intro-screen").classList.add("hidden");
    document.getElementById("quiz-result-screen").classList.add("hidden");
    document.getElementById("quiz-play-screen").classList.remove("hidden");
    
    displayQuestion();
}

function displayQuestion() {
    const q = QUIZ_QUESTIONS[currentQuestionIdx];
    
    document.getElementById("quiz-current-num").textContent = currentQuestionIdx + 1;
    document.getElementById("quiz-progress-fill").style.width = `${((currentQuestionIdx + 1) / 5) * 100}%`;
    document.getElementById("quiz-question-text").textContent = q.q;
    
    const optionsList = document.getElementById("quiz-options-list");
    optionsList.innerHTML = "";
    
    document.getElementById("next-question-btn").classList.add("hidden");
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.textContent = opt;
        btn.addEventListener("click", () => selectOption(idx, btn));
        optionsList.appendChild(btn);
    });
}

function selectOption(selectedIdx, selectedBtn) {
    const q = QUIZ_QUESTIONS[currentQuestionIdx];
    const optionsList = document.getElementById("quiz-options-list");
    const optionBtns = optionsList.querySelectorAll(".quiz-option-btn");
    
    // Disable all options
    optionBtns.forEach(btn => {
        btn.disabled = true;
    });
    
    // Show correct / wrong color changes
    if (selectedIdx === q.correct) {
        selectedBtn.classList.add("correct");
        quizScore++;
        addAnswerAlertEffect(true);
    } else {
        selectedBtn.classList.add("wrong");
        optionBtns[q.correct].classList.add("correct"); // Highlight correct option
        addAnswerAlertEffect(false);
    }
    
    userAnswers.push(selectedIdx);
    
    // Show next question button
    const nextBtn = document.getElementById("next-question-btn");
    nextBtn.classList.remove("hidden");
    if (currentQuestionIdx === 4) {
        nextBtn.innerHTML = `Finish Quiz <i data-lucide="award"></i>`;
    } else {
        nextBtn.innerHTML = `Next Question <i data-lucide="arrow-right"></i>`;
    }
    lucide.createIcons();
}

function addAnswerAlertEffect(isCorrect) {
    // Subtle overlay flash or visual cue can go here
}

function loadNextQuestion() {
    currentQuestionIdx++;
    if (currentQuestionIdx < 5) {
        displayQuestion();
    } else {
        showQuizResults();
    }
}

function showQuizResults() {
    document.getElementById("quiz-play-screen").classList.add("hidden");
    const resultScreen = document.getElementById("quiz-result-screen");
    resultScreen.classList.remove("hidden");
    
    const iconContainer = document.getElementById("quiz-result-icon");
    const title = document.getElementById("quiz-result-title");
    const msg = document.getElementById("quiz-result-message");
    const ptsVal = document.getElementById("quiz-points-val");
    
    const passScore = 4; // 80% requires 4/5 correct answers
    const quizPassed = quizScore >= passScore;
    
    if (quizPassed) {
        iconContainer.className = "quiz-result-icon success";
        iconContainer.innerHTML = `<i data-lucide="check-circle2" style="width: 48px; height: 48px;"></i>`;
        title.textContent = "Green Scholar Certified!";
        msg.textContent = `Excellent job! You answered ${quizScore} out of 5 questions correctly. Your knowledge of resource stewardship and circular principles is outstanding.`;
        
        // Award points if not awarded previously
        if (!localStorage.getItem("quiz_completed_award")) {
            window.EcoState.profile.points += 15;
            localStorage.setItem("quiz_completed_award", "true");
            ptsVal.textContent = "+15 Points";
            addNotification("success", "Passed the Eco Academy quiz! Earned +15 Points & Green Scholar Badge.");
            window.EcoState.saveState();
            renderUI();
        } else {
            ptsVal.textContent = "+0 Points (Already Earned)";
        }
    } else {
        iconContainer.className = "quiz-result-icon fail";
        iconContainer.innerHTML = `<i data-lucide="alert-circle" style="width: 48px; height: 48px;"></i>`;
        title.textContent = "Eco Learner Level";
        msg.textContent = `You scored ${quizScore} out of 5 questions. Read through our Green Knowledge Library to grasp the core concepts and try again to score 80%+ to secure your points!`;
        ptsVal.textContent = "+0 Points";
    }
    
    lucide.createIcons();
}
