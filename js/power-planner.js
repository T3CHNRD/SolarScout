'use strict';

// --- Centralized EcoFlow Product Data ---
const batteries = {
    pro:   { name: "Delta Pro", base: 3.6,   extra: 3.6,   maxExtras: 2, maxStacks: 2, link: "https://us.ecoflow.com/products/delta-pro-portable-power-station?sca_ref=7408943.R33f7CbNF7" },
    pro3:  { name: "Delta Pro 3", base: 4.096, extra: 4.096, maxExtras: 2, maxStacks: 2, link: "https://us.ecoflow.com/products/delta-pro-3-portable-power-station?sca_ref=7408943.R33f7CbNF7&sca_source=DELTA PRO 3" },
    ultra: { name: "Delta Pro Ultra", base: 0,   extra: 6.0,   maxExtras: 5, maxStacks: 3, link: "https://us.ecoflow.com/products/delta-pro-ultra?sca_ref=7408943.R33f7CbNF7" }
};

// --- Debugging Tools ---
function debugLog(section, data) {
    if (window.solarScoutDebug) {
        console.group(`Solar Scout Debug: ${section}`);
        console.log(data);
        console.groupEnd();
    }
}

function toggleDebug() {
    window.solarScoutDebug = !window.solarScoutDebug;
    console.log(`Solar Scout debugging: ${window.solarScoutDebug ? 'ENABLED' : 'DISABLED'}`);
}

// --- Core Recommendation Logic ---

/**
 * Generates all possible valid system configurations, including stacked units.
 * @returns {Array} A sorted list of all possible configurations by capacity.
 */
function generateAllPossibleConfigs() {
    const allConfigs = [];
    
    Object.values(batteries).forEach(spec => {
        for (let stacks = 1; stacks <= spec.maxStacks; stacks++) {
            // For Delta Pro Ultra, each inverter requires at least one battery to function.
            // This is not a bias, but a mandatory physical requirement.
            const startExtras = (spec.name === "Delta Pro Ultra") ? stacks : 0;
            
            // The maximum number of extra batteries is the number of inverters (stacks)
            // multiplied by the max batteries each inverter can handle.
            const maxTotalExtras = spec.maxExtras * stacks;

            for (let extras = startExtras; extras <= maxTotalExtras; extras++) {
                // A config with 0 capacity is invalid (e.g., Ultra inverter with no battery).
                // This is handled by startExtras for the Ultra, so the explicit check below is removed for clarity.
                // if (extras === 0 && spec.base === 0) continue;

                const totalBaseCapacity = spec.base * stacks;
                const totalCapacity = totalBaseCapacity + (spec.extra * extras);

                let label = (stacks > 1) ? `${stacks}x ${spec.name}` : spec.name;
                if (extras > 0) {
                    label += ` + ${extras} extra ${extras > 1 ? 'batteries' : 'battery'}`;
                }

                allConfigs.push({
                    model: spec.name,
                    label: label,
                    capacity: totalCapacity,
                    stacks: stacks,
                    extras: extras,
                    link: spec.link
                });
            }
        }
    });

    return allConfigs.sort((a, b) => {
        if (a.capacity !== b.capacity) return a.capacity - b.capacity;
        return (a.stacks + a.extras) - (b.stacks + b.extras);
    });
}

const ALL_SYSTEM_CONFIGS = generateAllPossibleConfigs();

/**
 * Finds the most cost-effective (smallest) configuration that meets a target capacity.
 */
const findBestOption = (targetCapacity, excludeConfigs = []) => {
    const excludeSet = new Set(excludeConfigs.map(c => c && c.label).filter(Boolean));
    return ALL_SYSTEM_CONFIGS.find(config => config.capacity >= targetCapacity && !excludeSet.has(config.label));
};

/**
 * Generates recommendations for specific backup durations with a 3% overhead.
 */
function getBackupDurationRecommendations(dailyUsage) {
    const safetyUsage = dailyUsage * 1.03; // Add 3% overhead

    const targets = {
        '24-Hour Backup': safetyUsage * 1,
        '48-Hour Backup': safetyUsage * 2,
        '72-Hour Backup': safetyUsage * 3,
    };

    let rec24h = findBestOption(targets['24-Hour Backup']);
    let rec48h = findBestOption(targets['48-Hour Backup'], [rec24h]);
    let rec72h = findBestOption(targets['72-Hour Backup'], [rec24h, rec48h]);

    // Fallback logic
    const maxConfig = ALL_SYSTEM_CONFIGS[ALL_SYSTEM_CONFIGS.length - 1];
    if (!rec72h) rec72h = maxConfig;
    if (!rec48h) rec48h = rec72h;
    if (!rec24h) rec24h = rec48h;

    return {
        '24-Hour Backup': rec24h,
        '48-Hour Backup': rec48h,
        '72-Hour Backup': rec72h,
    };
}

/**
 * Generates recommendations to match daily usage with various buffers (no overhead).
 */
function getDailyUsageMatchRecommendations(dailyUsage) {
    const targets = {
        'Minimum Viable': dailyUsage * 1.0,
        'Basic Comfort': dailyUsage * 1.25,
        'Full Coverage': dailyUsage * 1.5,
    };

    let recMin = findBestOption(targets['Minimum Viable']);
    let recBasic = findBestOption(targets['Basic Comfort'], [recMin]);
    let recFull = findBestOption(targets['Full Coverage'], [recMin, recBasic]);

    // Fallback logic
    const maxConfig = ALL_SYSTEM_CONFIGS[ALL_SYSTEM_CONFIGS.length - 1];
    if (!recFull) recFull = maxConfig;
    if (!recBasic) recBasic = recFull;
    if (!recMin) recMin = recBasic;

    return {
        'Minimum Viable': recMin,
        'Basic Comfort': recBasic,
        'Full Coverage': recFull,
    };
}


// --- Main UI Update Function ---
function updateDeltaRecommendation() {
    debugLog('Function Call', 'updateDeltaRecommendation started');
    
    let monthlyTotal = 0;
    let filledMonths = 0;
    
    for (let i = 1; i <= 12; i++) {
        const inputEl = document.getElementById(`month${i}`);
        if (!inputEl) continue;
        const val = parseFloat(inputEl.value);
        if (!isNaN(val) && val > 0) {
            monthlyTotal += val;
            filledMonths++;
        }
    }

    const dailyUsage = filledMonths > 0 ? (monthlyTotal / filledMonths / 30) : 0;

    // Update summary bar
    const totalUsageEl = document.querySelector('#totalUsageResult span');
    const dailyUsageEl = document.querySelector('#dailyUsageResult span');
    const usageMsgEl = document.getElementById('usageMessage');

    if (totalUsageEl) totalUsageEl.textContent = `${monthlyTotal.toFixed(2)} kWh/year`;
    if (dailyUsageEl) dailyUsageEl.textContent = `${dailyUsage.toFixed(2)} kWh/day`;

    if (usageMsgEl) {
        if (dailyUsage <= 0) usageMsgEl.textContent = "Enter your monthly usage data to see recommendations.";
        else if (dailyUsage < 15) usageMsgEl.textContent = "Your daily usage is relatively low.";
        else if (dailyUsage < 40) usageMsgEl.textContent = "Your daily usage is average for a modern home.";
        else usageMsgEl.textContent = "Your daily usage is substantial.";
    }

    const recElement = document.getElementById('deltaRecommendation');
    if (!recElement) return;

    // --- HTML Generation ---
    let recommendationHTML = '';
    const importantConsiderationsHTML = `
        <div class="info-box" style="margin-top: 2.5rem; padding: 1rem; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
            <h4 style="margin-top: 0;">Important Considerations</h4>
            <p style="font-size: 0.9rem; line-height: 1.5;">
                <strong>Planning for Outages:</strong> The "OUTAGE PROTECTION SOLUTION" recommendations include a small overhead (3%) and are targeted for 24, 48, or 72 hours of backup to ensure you have sufficient power during a complete outage, assuming no solar or generator input. The "DAILY USAGE SOLUTION" recommendations meet your daily usage requirements assuming no solar or generator input, with no additional safety margins built in.
            </p>
            <p style="font-size: 0.9rem; line-height: 1.5;">
                <strong>Solar Integration:</strong> Adding solar panels can extend battery runtime indefinitely during sunny days by recharging your system. This significantly reduces reliance on the grid or generators.
            </p>
            <p style="font-size: 0.9rem; line-height: 1.5;">
                <strong>Generator Backup:</strong> An EcoFlow Smart Generator can automatically recharge your power station when it gets low, providing a crucial safety net during extended outages or long periods of bad weather.
            </p>
            <p style="font-size: 0.9rem; line-height: 1.5;">
                For technical details on solar panel compatibility and sizing, please review these essential resources:
                <br>
                <a href="https://www.linspyre.com/ecoholics/specs.html" target="_blank">EcoFlow Product Specifications</a> | 
                <a href="https://www.linspyre.com/ecoholics/calc_voc.html#rules" target="_blank">Rules for Sizing Solar Arrays</a>
            </p>
        </div>
    `;

    if (dailyUsage <= 0) {
        recElement.innerHTML = '<h3>Recommended Power Solutions:</h3><p>Enter usage data to see recommendations.</p>' + importantConsiderationsHTML;
        return;
    }

    const formatTier = (tier, optionData) => {
        if (optionData) {
            const backupHours = (optionData.capacity / dailyUsage) * 24;
            let html = `<li><b>${tier}:</b> <span style="font-size:0.9em;color:#666;">(Provides ~${backupHours.toFixed(0)} hours of backup)</span></li>`;
            html += `<li style="margin-left:20px;"><a href="${optionData.link}" target="_blank">${optionData.label}</a> - Total Capacity: <b>${optionData.capacity.toFixed(2)} kWh</b></li>`;
            return html;
        }
        return `<li><b>${tier}:</b> <span style="font-size:0.9em;color:#666;">No viable configuration for this usage level.</span></li>`;
    };

    // Create a container for the two-column grid layout
    recommendationHTML += '<div class="recommendations-container">';

    // 1. Daily Usage Match Recommendations (First Column)
    const dailyRecs = getDailyUsageMatchRecommendations(dailyUsage);
    recommendationHTML += `
        <div class="recommendation-set">
            <h3>Daily Usage Solution</h3>
            
            <ul class="product-links">
                ${formatTier('Minimum Viable', dailyRecs['Minimum Viable'])}
                ${formatTier('Basic Comfort', dailyRecs['Basic Comfort'])}
                ${formatTier('Full Coverage', dailyRecs['Full Coverage'])}
            </ul>
        </div>
    `;

    // 2. Backup Duration Recommendations (Second Column)
    const backupRecs = getBackupDurationRecommendations(dailyUsage);
    recommendationHTML += `
        <div class="recommendation-set">
            <h3>Outage Protection Solution</h3>
            
            <ul class="product-links">
                ${formatTier('Good', backupRecs['24-Hour Backup'])}
                ${formatTier('Better', backupRecs['48-Hour Backup'])}
                ${formatTier('Best', backupRecs['72-Hour Backup'])}
            </ul>
        </div>
    `;
    
    // Close the container
    recommendationHTML += '</div>';

    // 3. Add the always-visible Informational Footer
    recommendationHTML += importantConsiderationsHTML;

    recElement.innerHTML = recommendationHTML;
}

// --- Reset Function ---
function resetCalculator() {
    for (let i = 1; i <= 12; i++) {
        const input = document.getElementById(`month${i}`);
        if (input) {
            input.value = '';
        }
    }
    updateDeltaRecommendation();
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
    debugLog('Event', 'DOM fully loaded and parsed');
    
    // Initialize all month inputs to empty
    for (let i = 1; i <= 12; i++) {
        const input = document.getElementById(`month${i}`);
        if (input) {
            input.value = '';
        }
    }

    updateDeltaRecommendation();

    // Month input handlers
    const monthInputs = document.querySelectorAll('input[id^="month"]');
    monthInputs.forEach(input => {
        input.addEventListener('input', function() {
            const val = parseFloat(this.value);
            if (val < 0) this.value = 0;
            updateDeltaRecommendation();
        });
    });
});

// --- Debugging Commands (for console use) ---
// To enable debug mode: toggleDebug();
// To view all possible configs: console.log(ALL_SYSTEM_CONFIGS);
// To find a specific option: console.log(findBestOption(10)); // Example: find best option for 10 kWh