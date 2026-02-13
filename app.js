// SCV Dauntless Prioritisation Engine - Classroom Display Version

class PrioritisationEngine {
    constructor() {
        this.selectedStories = new Set();
        this.maxRU = 100;
        this.maxSlots = 10;
        this.weights = {
            survival: 20,    // Increased from 10
            operations: 10,  // Increased from 5
            uncertainty: 15, // Increased from 7
            strategic: 8,    // Increased from 3
            crew: 10,        // Increased from 4
            stakeholder: 5,  // Increased from 2
            latent: 12       // Increased from 6
        };
        
        this.variability = 0; // 0 = off, 1 = ±1, 2 = ±2

        this.init();
    }

    init() {
        this.renderStoryGrid();
        this.attachEventListeners();
        this.updateResourceBars();
        
        // DEBUG: Show optimal selection in console
        if (window.location.search.includes('debug=true')) {
            setTimeout(() => this.analyzeOptimalSelection(), 500);
        }
    }

    renderStoryGrid() {
        const storyGrid = document.getElementById('storyGrid');
        storyGrid.innerHTML = '';

        storyData.forEach(story => {
            const storyCard = this.createStoryCard(story);
            storyGrid.appendChild(storyCard);
        });
    }

    createStoryCard(story) {
        const div = document.createElement('div');
        div.className = 'story-card';
        div.dataset.id = story.id;

        const storyNumber = story.id.substring(1); // Remove 'S' prefix
        div.innerHTML = `
            <div class="story-number">${storyNumber}</div>
            <div class="story-costs">
                <span class="cost-badge">${story.ru}</span>
                <span class="cost-badge">${story.slots}</span>
            </div>
        `;

        div.addEventListener('click', () => this.toggleStory(story.id));

        return div;
    }

    toggleStory(storyId) {
        const story = storyData.find(s => s.id === storyId);
        const storyCard = document.querySelector(`[data-id="${storyId}"]`);

        if (this.selectedStories.has(storyId)) {
            this.selectedStories.delete(storyId);
            storyCard.classList.remove('selected');
        } else {
            // Check constraints
            const currentRU = this.calculateTotalRU();
            const currentSlots = this.calculateTotalSlots();

            if (currentRU + story.ru > this.maxRU) {
                this.showAlert(`Cannot add Story ${story.id.substring(1)}: Would exceed RU limit!`);
                return;
            }

            if (currentSlots + story.slots > this.maxSlots) {
                this.showAlert(`Cannot add Story ${story.id.substring(1)}: Would exceed Slot limit!`);
                return;
            }

            this.selectedStories.add(storyId);
            storyCard.classList.add('selected');
        }

        this.updateResourceBars();
    }

    calculateTotalRU() {
        return Array.from(this.selectedStories).reduce((total, id) => {
            const story = storyData.find(s => s.id === id);
            return total + story.ru;
        }, 0);
    }

    calculateTotalSlots() {
        return Array.from(this.selectedStories).reduce((total, id) => {
            const story = storyData.find(s => s.id === id);
            return total + story.slots;
        }, 0);
    }

    updateResourceBars() {
        const ruUsed = this.calculateTotalRU();
        const slotsUsed = this.calculateTotalSlots();

        // Update text
        document.getElementById('ruUsed').textContent = ruUsed;
        document.getElementById('slotsUsed').textContent = slotsUsed;

        // Update bar width and color
        const ruPercent = (ruUsed / this.maxRU) * 100;
        const slotsPercent = (slotsUsed / this.maxSlots) * 100;

        const ruBar = document.getElementById('ruBar');
        const slotsBar = document.getElementById('slotsBar');

        ruBar.style.width = `${ruPercent}%`;
        slotsBar.style.width = `${slotsPercent}%`;

        // Update colors based on usage
        ruBar.className = 'meter-fill';
        if (ruPercent >= 100) {
            ruBar.classList.add('danger');
        } else if (ruPercent >= 80) {
            ruBar.classList.add('warning');
        }

        slotsBar.className = 'meter-fill';
        if (slotsPercent >= 100) {
            slotsBar.classList.add('danger');
        } else if (slotsPercent >= 80) {
            slotsBar.classList.add('warning');
        }
    }

    clearAll() {
        this.selectedStories.clear();
        document.querySelectorAll('.story-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateResourceBars();
    }

    async launchMission() {
        if (this.selectedStories.size === 0) {
            this.showAlert('Please select at least one story before launching!');
            return;
        }

        // Get current weights from instructor panel
        this.weights = {
            survival: parseInt(document.getElementById('survivalWeight').value) || 0,
            operations: parseInt(document.getElementById('operationsWeight').value) || 0,
            uncertainty: parseInt(document.getElementById('uncertaintyWeight').value) || 0,
            strategic: parseInt(document.getElementById('strategicWeight').value) || 0,
            crew: parseInt(document.getElementById('crewWeight').value) || 0,
            stakeholder: parseInt(document.getElementById('stakeholderWeight').value) || 0,
            latent: parseInt(document.getElementById('latentWeight').value) || 0
        };

        // Switch to launch screen
        this.switchScreen('launchScreen');

        // Dramatic countdown
        await this.playLaunchSequence();

        // Calculate results
        const results = this.calculateScore();

        // Show results screen
        this.displayResults(results);
    }

    async playLaunchSequence() {
        const countdownText = document.getElementById('countdownText');
        const countdownNumber = document.getElementById('countdown');

        // Phase 1: Initializing
        countdownText.textContent = 'INITIATING LAUNCH SEQUENCE...';
        await this.sleep(2000);

        // Phase 2: Countdown
        countdownText.textContent = 'MISSION LAUNCH IN...';
        await this.sleep(1000);

        for (let i = 3; i > 0; i--) {
            countdownNumber.textContent = i;
            await this.sleep(1000);
        }

        // Phase 3: Launch
        countdownNumber.textContent = '';
        countdownText.textContent = 'LAUNCH!';
        await this.sleep(1000);

        // Phase 4: Analyzing
        countdownText.textContent = 'ANALYZING MISSION PARAMETERS...';
        await this.sleep(2000);
    }

    calculateScore() {
        const breakdown = {
            survival: 0,
            operations: 0,
            uncertainty: 0,
            strategic: 0,
            crew: 0,
            stakeholder: 0,
            latent: 0
        };

        // Calculate weighted score (with optional variability)
        Array.from(this.selectedStories).forEach(id => {
            const story = storyData.find(s => s.id === id);
            story.tags.forEach(tag => {
                if (breakdown.hasOwnProperty(tag)) {
                    let value = this.weights[tag];
                    if (this.variability > 0) {
                        const offset = Math.floor(Math.random() * (this.variability * 2 + 1)) - this.variability;
                        value = Math.max(0, value + offset);
                    }
                    breakdown[tag] += value;
                }
            });
        });

        const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
        const outcomeBand = this.determineOutcomeBand(totalScore);
        const consequences = this.generateConsequences(breakdown, outcomeBand);

        return {
            totalScore,
            breakdown,
            outcomeBand,
            consequences
        };
    }

    determineOutcomeBand(score) {
        // ADJUSTED THRESHOLDS - Achievable with doubled weights
        if (score >= 110) {
            return { 
                level: 'excellent', 
                label: '🚀 MISSION SUCCESS', 
                color: 'mission-success',
                description: 'The SCV Dauntless launches flawlessly. All systems operational. The crew embarks on their journey with confidence.'
            };
        } else if (score >= 85) {
            return { 
                level: 'good', 
                label: '✓ LAUNCH APPROVED', 
                color: 'launch-approved',
                description: 'The Dauntless clears launch protocols. Some concerns remain, but the vessel is spaceworthy.'
            };
        } else if (score >= 60) {
            return { 
                level: 'moderate', 
                label: '⚠ MARGINAL CLEARANCE', 
                color: 'marginal-clearance',
                description: 'Launch proceeds under emergency protocols. Multiple systems show warning indicators.'
            };
        } else {
            return { 
                level: 'poor', 
                label: '💥 CATASTROPHIC FAILURE', 
                color: 'catastrophic-failure',
                description: 'MISSION ABORT! Critical systems compromised. The Dauntless is grounded indefinitely.'
            };
        }
    }

    generateConsequences(breakdown, outcomeBand) {
        const consequences = [];

        // Survival consequences
        if (breakdown.survival < 30) {
            consequences.push({
                type: 'critical',
                message: '💀 Hull breaches detected! Life support failing!'
            });
        } else if (breakdown.survival < 50) {
            consequences.push({
                type: 'warning',
                message: '⚠️ Structural integrity questionable'
            });
        } else if (breakdown.survival >= 80) {
            consequences.push({
                type: 'success',
                message: '✅ Life support systems optimal'
            });
        }

        // Uncertainty consequences
        if (breakdown.uncertainty < 20) {
            consequences.push({
                type: 'warning',
                message: '🔍 Unknown threats lurk in the dark'
            });
        } else if (breakdown.uncertainty >= 50) {
            consequences.push({
                type: 'success',
                message: '✅ Risks thoroughly analyzed'
            });
        }

        // Strategic consequences
        if (breakdown.strategic > 50) {
            consequences.push({
                type: 'info',
                message: '📊 Long-term investment prioritized'
            });
        } else if (breakdown.strategic < 15) {
            consequences.push({
                type: 'info',
                message: '📉 No strategic planning implemented'
            });
        }

        // Crew consequences
        if (breakdown.crew < 10) {
            consequences.push({
                type: 'warning',
                message: '😰 Crew morale collapsing'
            });
        } else if (breakdown.crew >= 30) {
            consequences.push({
                type: 'success',
                message: '✅ Crew welfare maintained'
            });
        }

        // Stakeholder consequences
        if (breakdown.stakeholder > 35) {
            consequences.push({
                type: 'info',
                message: '🎭 Politics over safety - risky choice'
            });
        } else if (breakdown.stakeholder < 5) {
            consequences.push({
                type: 'warning',
                message: '📢 Stakeholders furious - funding at risk'
            });
        }

        // Operations consequences
        if (breakdown.operations < 20) {
            consequences.push({
                type: 'warning',
                message: '⚙️ Daily operations will suffer'
            });
        } else if (breakdown.operations >= 40) {
            consequences.push({
                type: 'success',
                message: '✅ Operations running smoothly'
            });
        }

        // Latent consequences
        if (breakdown.latent < 10) {
            consequences.push({
                type: 'info',
                message: '⏰ Deferred maintenance will haunt you'
            });
        } else if (breakdown.latent >= 30) {
            consequences.push({
                type: 'success',
                message: '✅ Preventive maintenance addressed'
            });
        }

        // Power system check
        const powerStories = Array.from(this.selectedStories).filter(id => {
            const story = storyData.find(s => s.id === id);
            return story.tags.includes('power');
        });
        
        if (powerStories.length === 0) {
            consequences.push({
                type: 'critical',
                message: '⚡ POWER SYSTEMS UNCHECKED!'
            });
        }

        // Propulsion check
        const propulsionStories = Array.from(this.selectedStories).filter(id => {
            const story = storyData.find(s => s.id === id);
            return story.tags.includes('propulsion');
        });
        
        if (propulsionStories.length === 0) {
            consequences.push({
                type: 'critical',
                message: '🚀 PROPULSION UNINSPECTED!'
            });
        }

        // Overall outcome consequences
        if (outcomeBand.level === 'excellent') {
            consequences.push({
                type: 'success',
                message: '🎯 Exceptional mission planning!'
            });
        } else if (outcomeBand.level === 'good') {
            consequences.push({
                type: 'success',
                message: '👍 Solid decision-making'
            });
        } else if (outcomeBand.level === 'moderate') {
            consequences.push({
                type: 'warning',
                message: '⚠️ Risky prioritization choices'
            });
        } else {
            consequences.push({
                type: 'critical',
                message: '❌ MISSION FAILURE IMMINENT'
            });
        }

        return consequences;
    }

    displayResults(results) {
        // Switch to results screen
        this.switchScreen('resultsScreen');

        // Left panel: Outcome Ladder — all 4 levels, active one expanded
        const ladder = document.getElementById('outcomeLadder');
        ladder.innerHTML = '';

        const bands = [
            { key: 'mission-success', label: 'MISSION SUCCESS', range: '110+', icon: '🚀' },
            { key: 'launch-approved', label: 'LAUNCH APPROVED', range: '85 – 109', icon: '✓' },
            { key: 'marginal-clearance', label: 'MARGINAL CLEARANCE', range: '60 – 84', icon: '⚠' },
            { key: 'catastrophic-failure', label: 'CATASTROPHIC FAILURE', range: '< 60', icon: '💥' },
        ];

        bands.forEach((band, index) => {
            const isActive = band.key === results.outcomeBand.color;
            const div = document.createElement('div');
            div.className = `outcome-band band-${band.key}${isActive ? ' active' : ''}`;
            div.style.animationDelay = `${index * 0.15}s`;

            if (isActive) {
                div.innerHTML = `
                    <div class="band-marker">▶ YOU ARE HERE</div>
                    <div class="band-icon">${band.icon}</div>
                    <div class="band-active-label">${band.label}</div>
                    <div class="band-score">SCORE: ${results.totalScore}</div>
                    <div class="band-description">${results.outcomeBand.description}</div>
                `;
            } else {
                div.innerHTML = `
                    <div class="band-header">
                        <span class="band-label">${band.label}</span>
                        <span class="band-range">${band.range}</span>
                    </div>
                `;
            }

            ladder.appendChild(div);
        });

        // Right panel: System RAG list
        const systemGrid = document.getElementById('systemGrid');
        systemGrid.innerHTML = '';

        const ragLabels = { green: 'ONLINE', amber: 'WARNING', red: 'CRITICAL' };

        const systems = this.getSystemRAG(results.breakdown);
        systems.forEach((sys, index) => {
            const row = document.createElement('div');
            row.className = `system-row rag-${sys.rag}`;
            row.style.animationDelay = `${index * 0.15}s`;
            row.innerHTML = `
                <div class="rag-dot">${sys.icon}</div>
                <div class="system-info">
                    <div class="system-name">${sys.name}</div>
                    <div class="system-comment">${sys.comment}</div>
                </div>
                <div class="rag-label">${ragLabels[sys.rag]}</div>
            `;
            systemGrid.appendChild(row);
        });
    }

    getSystemRAG(breakdown) {
        const systems = [
            {
                key: 'survival',
                name: 'Life Support',
                icon: '🛡️',
                thresholds: [40, 20],
                comments: {
                    green: 'All crew safety systems nominal',
                    amber: 'Structural integrity concerns detected',
                    red: 'CRITICAL: Hull breach risk imminent'
                }
            },
            {
                key: 'operations',
                name: 'Operations',
                icon: '⚙️',
                thresholds: [30, 15],
                comments: {
                    green: 'Daily operations running smoothly',
                    amber: 'Some operational systems strained',
                    red: 'Core operations compromised'
                }
            },
            {
                key: 'uncertainty',
                name: 'Risk Analysis',
                icon: '🔍',
                thresholds: [30, 15],
                comments: {
                    green: 'Threats identified and mitigated',
                    amber: 'Unknown risks remain in mission profile',
                    red: 'Flying blind — minimal risk assessment'
                }
            },
            {
                key: 'strategic',
                name: 'Strategic',
                icon: '📊',
                thresholds: [16, 8],
                comments: {
                    green: 'Long-term mission planning in place',
                    amber: 'Some strategic gaps identified',
                    red: 'No strategic planning — reactive only'
                }
            },
            {
                key: 'crew',
                name: 'Crew Welfare',
                icon: '👥',
                thresholds: [20, 10],
                comments: {
                    green: 'Crew morale and welfare maintained',
                    amber: 'Crew under pressure, morale fragile',
                    red: 'Crew welfare neglected — mutiny risk'
                }
            },
            {
                key: 'stakeholder',
                name: 'Stakeholders',
                icon: '📢',
                thresholds: [10, 5],
                comments: {
                    green: 'Stakeholder confidence secured',
                    amber: 'Stakeholders have concerns',
                    red: 'Stakeholders furious — funding at risk'
                }
            },
            {
                key: 'latent',
                name: 'Maintenance',
                icon: '🔧',
                thresholds: [24, 12],
                comments: {
                    green: 'Preventive maintenance addressed',
                    amber: 'Deferred items may cause issues',
                    red: 'Technical debt critical — failures likely'
                }
            }
        ];

        return systems.map(sys => {
            const score = breakdown[sys.key] || 0;
            let rag, comment;
            if (score >= sys.thresholds[0]) {
                rag = 'green';
                comment = sys.comments.green;
            } else if (score >= sys.thresholds[1]) {
                rag = 'amber';
                comment = sys.comments.amber;
            } else {
                rag = 'red';
                comment = sys.comments.red;
            }
            return {
                name: sys.name,
                icon: sys.icon,
                rag,
                comment
            };
        });
    }

    showDetails() {
        const modal = document.getElementById('detailsModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = '<h2>All Stories</h2>';
        
        storyData.forEach(story => {
            const isSelected = this.selectedStories.has(story.id);
            const detailDiv = document.createElement('div');
            detailDiv.className = `detail-story ${isSelected ? 'selected' : ''}`;
            detailDiv.innerHTML = `
                <div class="detail-header">
                    <span class="detail-id">${story.id}</span>
                    <div class="detail-costs">
                        <span class="cost-badge">RU: ${story.ru}</span>
                        <span class="cost-badge">Slots: ${story.slots}</span>
                    </div>
                </div>
                <div class="detail-title">${story.title}</div>
                <div class="detail-stakeholder">Stakeholder: ${story.stakeholder}</div>
                <div class="detail-story-text">${story.user_story}</div>
            `;
            modalBody.appendChild(detailDiv);
        });
        
        modal.classList.remove('hidden');
    }

    closeDetails() {
        document.getElementById('detailsModal').classList.add('hidden');
    }

    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    backToSelection() {
        this.switchScreen('selectionScreen');
    }

    resetMission() {
        this.clearAll();
        this.switchScreen('selectionScreen');
    }

    toggleInstructorPanel() {
        const panel = document.getElementById('instructorPanel');
        panel.classList.toggle('hidden');
        panel.classList.toggle('visible');
    }

    showAlert(message) {
        alert(message);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    analyzeOptimalSelection() {
        // Find what's actually achievable
        let maxPossibleScore = 0;
        let selectedForMax = [];
        
        // Sort stories by score-to-cost ratio
        const scoredStories = storyData.map(story => {
            const storyScore = story.tags.reduce((sum, tag) => {
                return sum + (this.weights[tag] || 0);
            }, 0);
            return {
                ...story,
                score: storyScore,
                efficiency: storyScore / (story.ru + story.slots)
            };
        }).sort((a, b) => b.efficiency - a.efficiency);
        
        // Greedy algorithm to find best possible score
        let ruUsed = 0;
        let slotsUsed = 0;
        
        for (const story of scoredStories) {
            if (ruUsed + story.ru <= this.maxRU && slotsUsed + story.slots <= this.maxSlots) {
                maxPossibleScore += story.score;
                selectedForMax.push(story.id);
                ruUsed += story.ru;
                slotsUsed += story.slots;
            }
        }
        
        console.log('═══════════════════════════════════════════');
        console.log('🎯 SCORING ANALYSIS');
        console.log('═══════════════════════════════════════════');
        console.log(`Max achievable score: ${maxPossibleScore}`);
        console.log(`Optimal stories: ${selectedForMax.join(', ')}`);
        console.log(`Resource usage: ${ruUsed}/${this.maxRU} RU, ${slotsUsed}/${this.maxSlots} slots`);
        console.log(`Number of stories: ${selectedForMax.length}`);
        console.log('───────────────────────────────────────────');
        console.log('OUTCOME BANDS:');
        console.log('  🚀 MISSION SUCCESS: 120+');
        console.log('  ✓ LAUNCH APPROVED: 90-119');
        console.log('  ⚠ MARGINAL CLEARANCE: 60-89');
        console.log('  💥 CATASTROPHIC FAILURE: <60');
        console.log('═══════════════════════════════════════════');
        
        return { maxPossibleScore, selectedForMax, ruUsed, slotsUsed };
    }

    exportJSON() {
        const data = {
            timestamp: new Date().toISOString(),
            constraints: {
                maxRU: this.maxRU,
                maxSlots: this.maxSlots,
                usedRU: this.calculateTotalRU(),
                usedSlots: this.calculateTotalSlots()
            },
            weights: this.weights,
            selectedStories: Array.from(this.selectedStories).map(id => {
                return storyData.find(s => s.id === id);
            })
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dauntless-mission-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportReport() {
        const selectedStoriesList = Array.from(this.selectedStories).sort().map(id => {
            const story = storyData.find(s => s.id === id);
            return `${story.id}: ${story.title} (RU: ${story.ru}, Slots: ${story.slots})`;
        }).join('\n  ');

        const report = `
═══════════════════════════════════════════════════════════
    SCV DAUNTLESS - MISSION PRIORITISATION REPORT
═══════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}

RESOURCE ALLOCATION
───────────────────────────────────────────────────────────
Resource Units: ${this.calculateTotalRU()} / ${this.maxRU}
Work Slots:     ${this.calculateTotalSlots()} / ${this.maxSlots}

SELECTED STORIES (${this.selectedStories.size} total)
───────────────────────────────────────────────────────────
  ${selectedStoriesList}

═══════════════════════════════════════════════════════════
End of Report
        `;

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dauntless-report-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    attachEventListeners() {
        // Launch mission button
        document.getElementById('launchMission').addEventListener('click', () => {
            this.launchMission();
        });

        // Clear all button
        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAll();
        });

        // Show details button
        document.getElementById('showDetails').addEventListener('click', () => {
            this.showDetails();
        });

        // Close modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeDetails();
        });

        // Back to selection
        document.getElementById('backToSelection').addEventListener('click', () => {
            this.backToSelection();
        });

        // Export buttons
        document.getElementById('exportJson').addEventListener('click', () => {
            this.exportJSON();
        });

        // Reset mission
        document.getElementById('resetMission').addEventListener('click', () => {
            if (confirm('Reset the entire mission? This will clear all selections.')) {
                this.resetMission();
            }
        });

        // Instructor panel toggle
        document.getElementById('toggleInstructor').addEventListener('click', () => {
            this.toggleInstructorPanel();
        });

        // Variability toggle
        document.getElementById('variabilityToggle').addEventListener('change', (e) => {
            const opts = document.getElementById('variabilityOptions');
            if (e.target.checked) {
                opts.classList.add('active');
                const selected = document.querySelector('input[name="variabilityRange"]:checked');
                this.variability = parseInt(selected.value);
            } else {
                opts.classList.remove('active');
                this.variability = 0;
            }
        });

        document.querySelectorAll('input[name="variabilityRange"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (document.getElementById('variabilityToggle').checked) {
                    this.variability = parseInt(e.target.value);
                }
            });
        });

        // Close modal when clicking outside
        document.getElementById('detailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailsModal') {
                this.closeDetails();
            }
        });
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PrioritisationEngine();
    window.dauntlessApp = app; // Make available globally for debugging
    console.log('🚀 SCV Dauntless Prioritisation Engine initialized');
});

