// Monte Carlo simulation of 1000 random student selections
// Run with: node simulate.js

// Inline story data - Updated to match current storyData.js
const storyData = [
    { id:"S1",  ru:11, slots:1, tags:["latent","irreversible"] },
    { id:"S2",  ru:11, slots:1, tags:["operations"] },
    { id:"S3",  ru:14, slots:1, tags:["strategic"] },
    { id:"S4",  ru:17, slots:2, tags:["uncertainty","structural"] },
    { id:"S5",  ru:7,  slots:1, tags:["stakeholder"] },
    { id:"S6",  ru:10, slots:1, tags:["crew"] },
    { id:"S7",  ru:14, slots:1, tags:["survival","propulsion"] },
    { id:"S8",  ru:8,  slots:1, tags:["stakeholder"] },
    { id:"S9",  ru:13, slots:1, tags:["operations"] },
    { id:"S10", ru:6,  slots:1, tags:["stakeholder"] },
    { id:"S11", ru:10, slots:1, tags:["stakeholder","compliance"] },
    { id:"S12", ru:6,  slots:1, tags:["crew"] },
    { id:"S13", ru:15, slots:1, tags:["survival","life-support"] },
    { id:"S14", ru:20, slots:2, tags:["survival","structural","irreversible"] },
    { id:"S15", ru:12, slots:1, tags:["survival","power","irreversible"] },
    { id:"S16", ru:10, slots:1, tags:["latent"] },
    { id:"S17", ru:16, slots:2, tags:["strategic"] },
    { id:"S18", ru:8,  slots:1, tags:["operations"] },
    { id:"S19", ru:15, slots:2, tags:["uncertainty","predictive"] },
    { id:"S20", ru:16, slots:2, tags:["uncertainty"] },
    { id:"S21", ru:12, slots:1, tags:["stakeholder","compliance"] },
    { id:"S22", ru:18, slots:2, tags:["survival","radiation"] },
    { id:"S23", ru:9,  slots:1, tags:["crew"] },
    { id:"S24", ru:5,  slots:1, tags:["crew"] },
    { id:"S25", ru:13, slots:2, tags:["uncertainty","radiation"] },
    { id:"S26", ru:14, slots:2, tags:["uncertainty","power"] },
    { id:"S27", ru:22, slots:3, tags:["strategic"] },
    { id:"S28", ru:9,  slots:1, tags:["operations"] },
    { id:"S29", ru:11, slots:1, tags:["strategic"] },
    { id:"S30", ru:12, slots:1, tags:["operations"] },
];

const weights = {
    survival: 20,
    operations: 10,
    uncertainty: 15,
    strategic: 8,
    crew: 10,
    stakeholder: 5,
    latent: 12
};

const MAX_RU = 100;
const MAX_SLOTS = 10;
const NUM_SIMULATIONS = 1000;

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function simulateStudent() {
    // Strategy: shuffle stories, pick greedily until constraints hit
    // This simulates a student browsing in random order and selecting what looks interesting
    const order = shuffle(storyData);
    const selected = [];
    let ruUsed = 0, slotsUsed = 0;

    // Students typically pick 4-10 stories (random target)
    const targetCount = Math.floor(Math.random() * 7) + 4; // 4-10

    for (const story of order) {
        if (selected.length >= targetCount) break;
        if (ruUsed + story.ru <= MAX_RU && slotsUsed + story.slots <= MAX_SLOTS) {
            selected.push(story);
            ruUsed += story.ru;
            slotsUsed += story.slots;
        }
    }

    return { selected, ruUsed, slotsUsed };
}

function calculateScore(selected) {
    const breakdown = {
        survival: 0, operations: 0, uncertainty: 0,
        strategic: 0, crew: 0, stakeholder: 0, latent: 0
    };

    selected.forEach(story => {
        story.tags.forEach(tag => {
            if (breakdown.hasOwnProperty(tag)) {
                breakdown[tag] += weights[tag];
            }
        });
    });

    const baseScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    // Calculate system RAG statuses
    const rag = getRAG(breakdown);
    const greenCount = Object.values(rag).filter(v => v === 'GREEN').length;
    const redCount = Object.values(rag).filter(v => v === 'RED').length;

    // System synergy bonuses
    let synergyBonus = 0;
    if (greenCount >= 6) synergyBonus = 30;
    else if (greenCount >= 4) synergyBonus = 15;
    else if (greenCount >= 2) synergyBonus = 5;

    // Critical system penalties
    let criticalPenalty = 0;
    if (redCount >= 6) criticalPenalty = -50;
    else if (redCount >= 4) criticalPenalty = -25;
    else if (redCount >= 2) criticalPenalty = -10;

    const totalScore = baseScore + synergyBonus + criticalPenalty;

    return { totalScore, baseScore, synergyBonus, criticalPenalty, greenCount, redCount, breakdown };
}

function getOutcome(score) {
    if (score >= 110) return 'MISSION SUCCESS';
    if (score >= 85)  return 'LAUNCH APPROVED';
    if (score >= 60)  return 'MARGINAL CLEARANCE';
    return 'CATASTROPHIC FAILURE';
}

function getRAG(breakdown) {
    const thresholds = {
        survival:    { green: 40, amber: 20 },
        operations:  { green: 30, amber: 15 },
        uncertainty: { green: 30, amber: 15 },
        strategic:   { green: 16, amber: 8 },
        crew:        { green: 20, amber: 10 },
        stakeholder: { green: 10, amber: 5 },
        latent:      { green: 24, amber: 12 },
    };
    const result = {};
    for (const [key, val] of Object.entries(breakdown)) {
        if (val >= thresholds[key].green)      result[key] = 'GREEN';
        else if (val >= thresholds[key].amber) result[key] = 'AMBER';
        else                                   result[key] = 'RED';
    }
    return result;
}

// ─── RUN SIMULATION ───
console.log('═══════════════════════════════════════════════════════════════');
console.log('  SCV DAUNTLESS — MONTE CARLO SIMULATION (1000 random students)');
console.log('═══════════════════════════════════════════════════════════════\n');

const outcomes = { 'MISSION SUCCESS': 0, 'LAUNCH APPROVED': 0, 'MARGINAL CLEARANCE': 0, 'CATASTROPHIC FAILURE': 0 };
const scores = [];
const baseScores = [];
const bonuses = [];
const penalties = [];
const ragTotals = {};
['survival','operations','uncertainty','strategic','crew','stakeholder','latent'].forEach(k => {
    ragTotals[k] = { GREEN: 0, AMBER: 0, RED: 0 };
});

const allResults = [];

for (let i = 0; i < NUM_SIMULATIONS; i++) {
    const { selected, ruUsed, slotsUsed } = simulateStudent();
    const { totalScore, baseScore, synergyBonus, criticalPenalty, greenCount, redCount, breakdown } = calculateScore(selected);
    const outcome = getOutcome(totalScore);
    const rag = getRAG(breakdown);

    outcomes[outcome]++;
    scores.push(totalScore);
    baseScores.push(baseScore);
    if (synergyBonus > 0) bonuses.push(synergyBonus);
    if (criticalPenalty < 0) penalties.push(criticalPenalty);

    for (const [k, v] of Object.entries(rag)) {
        ragTotals[k][v]++;
    }

    allResults.push({
        run: i + 1,
        stories: selected.map(s => s.id).sort().join(', '),
        count: selected.length,
        ruUsed,
        slotsUsed,
        baseScore,
        synergyBonus,
        criticalPenalty,
        totalScore,
        greenCount,
        redCount,
        outcome,
        breakdown
    });
}

// Sort by score for percentile analysis
scores.sort((a, b) => a - b);

console.log('OUTCOME DISTRIBUTION');
console.log('────────────────────────────────────────────');
for (const [outcome, count] of Object.entries(outcomes)) {
    const bar = '█'.repeat(Math.round(count / 2));
    const pct = (count / NUM_SIMULATIONS * 100).toFixed(0);
    console.log(`  ${outcome.padEnd(24)} ${String(count).padStart(3)} (${pct.padStart(3)}%)  ${bar}`);
}

console.log('\nSCORE STATISTICS');
console.log('────────────────────────────────────────────');
const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
const min = scores[0];
const max = scores[scores.length - 1];
const median = scores[Math.floor(scores.length / 2)];
const p10 = scores[Math.floor(scores.length * 0.1)];
const p25 = scores[Math.floor(scores.length * 0.25)];
const p75 = scores[Math.floor(scores.length * 0.75)];
const p90 = scores[Math.floor(scores.length * 0.9)];

console.log(`  Min:      ${min}`);
console.log(`  P10:      ${p10}`);
console.log(`  P25:      ${p25}`);
console.log(`  Median:   ${median}`);
console.log(`  Mean:     ${avg.toFixed(1)}`);
console.log(`  P75:      ${p75}`);
console.log(`  P90:      ${p90}`);
console.log(`  Max:      ${max}`);

console.log('\n  Thresholds: 110+ Success | 85-109 Approved | 60-84 Marginal | <60 Failure');

console.log('\nBONUS/PENALTY STATISTICS');
console.log('────────────────────────────────────────────');
const avgBase = baseScores.reduce((a, b) => a + b, 0) / baseScores.length;
const avgBonus = bonuses.length > 0 ? bonuses.reduce((a, b) => a + b, 0) / bonuses.length : 0;
const avgPenalty = penalties.length > 0 ? penalties.reduce((a, b) => a + b, 0) / penalties.length : 0;
const bonusPct = (bonuses.length / NUM_SIMULATIONS * 100).toFixed(1);
const penaltyPct = (penalties.length / NUM_SIMULATIONS * 100).toFixed(1);

console.log(`  Average Base Score:         ${avgBase.toFixed(1)}`);
console.log(`  Average Final Score:        ${avg.toFixed(1)}`);
console.log(`  Runs with Synergy Bonus:    ${bonuses.length} (${bonusPct}%)`);
console.log(`  Average Bonus (when >0):    +${avgBonus.toFixed(1)}`);
console.log(`  Runs with Critical Penalty: ${penalties.length} (${penaltyPct}%)`);
console.log(`  Average Penalty (when <0):  ${avgPenalty.toFixed(1)}`);

console.log('\nSYSTEM RAG DISTRIBUTION (across all 100 runs)');
console.log('────────────────────────────────────────────');
console.log(`  ${'System'.padEnd(16)} ${'GREEN'.padStart(6)} ${'AMBER'.padStart(6)} ${'RED'.padStart(6)}`);
for (const [sys, counts] of Object.entries(ragTotals)) {
    console.log(`  ${sys.padEnd(16)} ${String(counts.GREEN).padStart(6)} ${String(counts.AMBER).padStart(6)} ${String(counts.RED).padStart(6)}`);
}

// Score histogram
console.log('\nSCORE HISTOGRAM');
console.log('────────────────────────────────────────────');
const buckets = {};
for (const s of scores) {
    const bucket = Math.floor(s / 10) * 10;
    const label = `${bucket}-${bucket + 9}`;
    buckets[label] = (buckets[label] || 0) + 1;
}
for (const [range, count] of Object.entries(buckets).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
    const bar = '█'.repeat(count);
    console.log(`  ${range.padStart(8)}  ${String(count).padStart(3)}  ${bar}`);
}

// Show 5 lowest and 5 highest scoring runs
console.log('\n5 LOWEST SCORING RUNS');
console.log('────────────────────────────────────────────');
const sorted = [...allResults].sort((a, b) => a.totalScore - b.totalScore);
sorted.slice(0, 5).forEach(r => {
    console.log(`  Run ${String(r.run).padStart(3)}: Score ${String(r.totalScore).padStart(3)} | ${r.outcome} | ${r.count} stories | RU ${r.ruUsed}/100 Slots ${r.slotsUsed}/10`);
    console.log(`          ${r.stories}`);
});

console.log('\n5 HIGHEST SCORING RUNS');
console.log('────────────────────────────────────────────');
sorted.slice(-5).forEach(r => {
    console.log(`  Run ${String(r.run).padStart(3)}: Score ${String(r.totalScore).padStart(3)} | ${r.outcome} | ${r.count} stories | RU ${r.ruUsed}/100 Slots ${r.slotsUsed}/10`);
    console.log(`          ${r.stories}`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
