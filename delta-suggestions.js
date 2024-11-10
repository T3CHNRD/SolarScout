const deltaProducts = [
    {
        name: "DELTA Mini",
        baseCapacity: 0.882,
        maxCapacity: 0.882,
        output: "1400W (2100W surge)",
        expandable: false,
        suitableDaily: 0.7
    },
    {
        name: "DELTA 2",
        baseCapacity: 1.024,
        maxCapacity: 2.048,
        output: "1800W (2700W surge)",
        expandable: true,
        extraBatteries: 1,
        suitableDaily: 0.8
    },
    {
        name: "DELTA Max",
        baseCapacity: 2.016,
        maxCapacity: 6.048,
        output: "2400W (5000W surge)",
        expandable: true,
        extraBatteries: 2,
        suitableDaily: 1.6
    },
    {
        name: "DELTA Pro",
        baseCapacity: 3.6,
        maxCapacity: 10.8,
        output: "3600W (7200W surge)",
        expandable: true,
        extraBatteries: 2,
        suitableDaily: 2.9
    },
    {
        name: "DELTA Pro 3",
        baseCapacity: 4.096,
        maxCapacity: 12.288,
        output: "4000W (8000W surge)",
        expandable: true,
        extraBatteries: 2,
        suitableDaily: 3.3
    },
    {
        name: "DELTA Pro Ultra",
        baseCapacity: 6,
        maxCapacity: 30,
        output: "7200W output",
        expandable: true,
        extraBatteries: 5,
        suitableDaily: 4.8
    }
];

function recommendSystem(yearlyUsage) {
    const dailyUsage = yearlyUsage / 365;
    let recommendation = '';

    const suitableProducts = deltaProducts.filter(product => {
        return (dailyUsage <= product.suitableDaily * 1.2); // 20% margin
    });

    if (suitableProducts.length === 0) {
        recommendation = `
            <div class="recommendation-content">
                <h3>Recommended: DELTA Pro Ultra</h3>
                <p>Your daily usage of ${dailyUsage.toFixed(2)} kWh is substantial. The DELTA Pro Ultra with expansion batteries 
                would be most suitable for your needs.</p>
                <p>- Base Capacity: 6kWh (expandable up to 30kWh)</p>
                <p>- Maximum Output: 7200W</p>
            </div>
        `;
    } else {
        const bestFit = suitableProducts[0];
        recommendation = `
            <div class="recommendation-content">
                <h3>Recommended: ${bestFit.name}</h3>
                <p>Based on your daily usage of ${dailyUsage.toFixed(2)} kWh:</p>
                <p>- Base Capacity: ${bestFit.baseCapacity}kWh</p>
                <p>- Output: ${bestFit.output}</p>
                ${bestFit.expandable ? 
                    `<p>- Expandable up to ${bestFit.maxCapacity}kWh with ${bestFit.extraBatteries} extra batteries</p>` 
                    : ''}
            </div>
        `;
    }

    return recommendation;
}
