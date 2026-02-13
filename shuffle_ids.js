// Script to shuffle story IDs and write new storyData.js
const fs = require('fs');

const stories = [
    {title:"Hull Microfracture Reinforcement",stakeholder:"Crew Member",user_story:"As a Crew Member, I want hull microfractures reinforced, so that structural integrity is maintained during atmospheric exit.",ru:20,slots:2,tags:["survival","structural","irreversible"]},
    {title:"Oxygen Efficiency Restoration",stakeholder:"Safety Officer",user_story:"As a Safety Officer, I want oxygen recycling efficiency restored above 90%, so that long-duration exposure risk is reduced.",ru:15,slots:1,tags:["survival","life-support"]},
    {title:"Radiation Shield Stabilisation",stakeholder:"Radiation Specialist",user_story:"As a Radiation Specialist, I want shielding fluctuations stabilised, so that crew radiation exposure remains within safe limits.",ru:18,slots:2,tags:["survival","radiation"]},
    {title:"Pre-Launch Compliance Audit",stakeholder:"Compliance",user_story:"As Compliance, I want a full pre-launch safety audit conducted, so that regulatory approval is secured.",ru:10,slots:1,tags:["stakeholder","compliance"]},
    {title:"Fuel Line Stress Inspection",stakeholder:"Engineering",user_story:"As Engineering, I want fuel line stress points inspected, so that combustion instability is prevented during launch.",ru:14,slots:1,tags:["survival","propulsion"]},
    {title:"Backup Power Relay Testing",stakeholder:"Systems Control",user_story:"As Systems Control, I want backup power relays tested under load, so that cascading failures are prevented.",ru:12,slots:1,tags:["survival","power","irreversible"]},
    {title:"Star-Mapping Recalibration",stakeholder:"Navigation Officer",user_story:"As a Navigation Officer, I want star-mapping recalibrated, so that course corrections are accurate during transit.",ru:12,slots:1,tags:["operations"]},
    {title:"Power Spike Investigation",stakeholder:"Engineering",user_story:"As Engineering, I want intermittent power spikes investigated, so that critical systems do not fail mid-flight.",ru:14,slots:2,tags:["uncertainty","power"]},
    {title:"Food Synthesiser Calibration",stakeholder:"Life Support Engineering",user_story:"As Life Support Engineering, I want food synthesiser calibration corrected, so that nutritional stability is ensured.",ru:8,slots:1,tags:["operations"]},
    {title:"Comms Latency Reduction",stakeholder:"Mars Base Operations",user_story:"As Mars Base Operations, I want comms latency reduced, so that emergency coordination is faster.",ru:9,slots:1,tags:["operations"]},
    {title:"Cooling System Stress Test",stakeholder:"Thermal Control",user_story:"As Thermal Control, I want cooling systems stress-tested, so that overheating does not compromise propulsion.",ru:13,slots:1,tags:["operations"]},
    {title:"Manual Override Verification",stakeholder:"Flight Control",user_story:"As Flight Control, I want manual override systems verified, so that crew can intervene during autopilot malfunction.",ru:11,slots:1,tags:["operations"]},
    {title:"Radiation Anomaly Investigation",stakeholder:"Engineering",user_story:"As Engineering, I want minor radiation sensor anomalies investigated, so that hidden exposure risks are identified early.",ru:13,slots:2,tags:["uncertainty","radiation"]},
    {title:"Telemetry Log Analysis",stakeholder:"Diagnostics Team",user_story:"As Diagnostics Team, I want full system telemetry logs analysed, so that emerging failure patterns are detected.",ru:16,slots:2,tags:["uncertainty"]},
    {title:"Predictive Failure Modelling",stakeholder:"AI Systems Monitoring",user_story:"As AI Systems Monitoring, I want predictive failure modelling run on propulsion systems, so that malfunction probability is understood before launch.",ru:15,slots:2,tags:["uncertainty","predictive"]},
    {title:"Hull Resonance Testing",stakeholder:"Structural Analysis",user_story:"As Structural Analysis, I want resonance testing conducted on the hull frame, so that vibration amplification is ruled out.",ru:17,slots:2,tags:["uncertainty","structural"]},
    {title:"AI Navigation Module Installation",stakeholder:"Star Command Strategy",user_story:"As Star Command Strategy, I want an AI-assisted navigation module installed, so that long-term efficiency improves.",ru:22,slots:3,tags:["strategic"]},
    {title:"Cargo Capacity Expansion",stakeholder:"Logistics Command",user_story:"As Logistics Command, I want cargo capacity expanded by 15%, so that supply throughput increases.",ru:16,slots:2,tags:["strategic"]},
    {title:"Mining Drone Firmware Upgrade",stakeholder:"Mars Base",user_story:"As Mars Base, I want mining drone firmware upgraded, so that local resource extraction improves.",ru:11,slots:1,tags:["strategic"]},
    {title:"Atmospheric Sampling Integration",stakeholder:"Research Division",user_story:"As Research Division, I want atmospheric sampling modules integrated, so that scientific output increases.",ru:14,slots:1,tags:["strategic"]},
    {title:"Fatigue Monitoring Upgrade",stakeholder:"Crew Command",user_story:"As Crew Command, I want fatigue monitoring systems upgraded, so that performance degradation can be detected early.",ru:10,slots:1,tags:["crew"]},
    {title:"Medical Scanner Recalibration",stakeholder:"Medical Officer",user_story:"As Medical Officer, I want medical diagnostic scanners recalibrated, so that onboard health assessments remain accurate.",ru:9,slots:1,tags:["crew"]},
    {title:"Private Crew Communication",stakeholder:"Crew Representative",user_story:"As Crew Representative, I want private communication channels to Earth restored, so that morale is maintained during transit.",ru:6,slots:1,tags:["crew"]},
    {title:"Environmental Lighting Adjustment",stakeholder:"Behavioural Support",user_story:"As Behavioural Support, I want environmental lighting cycles corrected, so that circadian rhythms remain stable.",ru:5,slots:1,tags:["crew"]},
    {title:"Live Broadcast Integration",stakeholder:"Earth Executive",user_story:"As Earth Executive, I want a live broadcast system integrated, so that public confidence increases.",ru:7,slots:1,tags:["stakeholder"]},
    {title:"Enhanced Camera Systems",stakeholder:"Public Relations",user_story:"As Public Relations, I want enhanced onboard camera systems installed, so that mission transparency improves.",ru:6,slots:1,tags:["stakeholder"]},
    {title:"Cost-Tracking Dashboard",stakeholder:"Finance Directorate",user_story:"As Finance Directorate, I want cost-tracking dashboards operational, so that programme spend visibility improves.",ru:8,slots:1,tags:["stakeholder"]},
    {title:"External Inspection",stakeholder:"Oversight Committee",user_story:"As Oversight Committee, I want an external inspection conducted, so that accountability standards are demonstrated.",ru:12,slots:1,tags:["stakeholder","compliance"]},
    {title:"Micro-Vibration Sensor Calibration",stakeholder:"Propulsion Engineering",user_story:"As Propulsion Engineering, I want micro-vibration sensors recalibrated, so that long-term engine fatigue is reduced.",ru:10,slots:1,tags:["latent"]},
    {title:"Launch Clamp Stress Testing",stakeholder:"Dock Operations",user_story:"As Dock Operations, I want launch clamp mechanisms stress-tested, so that separation failure risk is reduced.",ru:11,slots:1,tags:["latent","irreversible"]}
];

// Seeded shuffle: newIds[i] = new S-number for original story at index i
const newIds = [14, 13, 22, 11, 7, 15, 30, 26, 18, 28, 9, 2, 25, 20, 19, 4, 27, 17, 29, 3, 6, 23, 12, 24, 5, 10, 8, 21, 16, 1];

const shuffled = stories.map((s, i) => ({ ...s, id: "S" + newIds[i] }));
shuffled.sort((a, b) => parseInt(a.id.slice(1)) - parseInt(b.id.slice(1)));

// Verify mixing
console.log("ID -> Category (Title)");
console.log("─".repeat(60));
shuffled.forEach(s => {
    console.log(`${s.id.padEnd(4)} -> ${s.tags[0].padEnd(14)} ${s.title}`);
});

// Write file
let output = `// SCV Dauntless User Story Dataset\n// Story IDs are deliberately randomised — categories are not sequential\nconst storyData = [\n`;

shuffled.forEach((s, i) => {
    output += `    {\n`;
    output += `        id: "${s.id}",\n`;
    output += `        title: "${s.title}",\n`;
    output += `        stakeholder: "${s.stakeholder}",\n`;
    output += `        user_story: "${s.user_story}",\n`;
    output += `        ru: ${s.ru},\n`;
    output += `        slots: ${s.slots},\n`;
    output += `        tags: [${s.tags.map(t => `"${t}"`).join(",")}]\n`;
    output += `    }${i < shuffled.length - 1 ? ',' : ''}\n`;
});

output += `];\n`;

fs.writeFileSync('storyData.js', output);
console.log("\n✅ storyData.js written with shuffled IDs");
