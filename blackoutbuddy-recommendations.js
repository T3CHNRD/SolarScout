// Product recommendations database with placeholder links
const productRecommendations = {
  minimal: {
    powerRange: "0-300W",
    description: "Light power needs - Good for charging phones, laptops, and small devices",
    products: [
      { 
        name: "Jackery Explorer 300",
        capacity: "293Wh",
        price: "$299",
        link: "AFFILIATE_LINK_HERE_1"
      },
      { 
        name: "Anker 521",
        capacity: "256Wh",
        price: "$209",
        link: "AFFILIATE_LINK_HERE_2"
      }
    ]
  },
  light: {
    powerRange: "301-800W",
    description: "Moderate power needs - Good for CPAP machines, mini fridges, and entertainment devices",
    products: [
      {
        name: "Bluetti EB70",
        capacity: "716Wh",
        price: "$599",
        link: "AFFILIATE_LINK_HERE_3"
      },
      {
        name: "Jackery Explorer 700",
        capacity: "716Wh",
        price: "$649",
        link: "AFFILIATE_LINK_HERE_4"
      }
    ]
  },
  medium: {
    powerRange: "801-1500W",
    description: "Standard power needs - Good for fridges, power tools, and multiple devices",
    products: [
      {
        name: "EcoFlow Delta 2",
        capacity: "1024Wh",
        price: "$999",
        link: "AFFILIATE_LINK_HERE_5"
      },
      {
        name: "Bluetti AC200P",
        capacity: "2000Wh",
        price: "$1399",
        link: "AFFILIATE_LINK_HERE_6"
      }
    ]
  },
  heavy: {
    powerRange: "1501W+",
    description: "Heavy power needs - Suitable for home backup, workshops, and high-draw appliances",
    products: [
      {
        name: "EcoFlow Delta Pro",
        capacity: "3600Wh",
        price: "$3199",
        link: "AFFILIATE_LINK_HERE_7"
      },
      {
        name: "Bluetti AC500",
        capacity: "3072Wh",
        price: "$4999",
        link: "AFFILIATE_LINK_HERE_8"
      }
    ]
  }
};

function updateRecommendations(totalWatts, dailyKwh) {
  const recommendationDiv = document.querySelector('#recommendation');
  
  // Determine category based on total watts
  let category;
  if (totalWatts === 0) {
    recommendationDiv.innerHTML = 'Select appliances to get recommendations.';
    return;
  } else if (totalWatts <= 300) {
    category = 'minimal';
  } else if (totalWatts <= 800) {
    category = 'light';
  } else if (totalWatts <= 1500) {
    category = 'medium';
  } else {
    category = 'heavy';
  }

  const recommendations = productRecommendations[category];
  
  // Create recommendation HTML
  const html = `
    <div class="recommendation-container">
      <div class="power-assessment">
        <h3>Power Assessment</h3>
        <p>Your power needs: ${recommendations.powerRange}</p>
        <p>${recommendations.description}</p>
      </div>
      
      <div class="product-recommendations">
        <h3>Recommended Power Stations</h3>
        <div class="product-grid">
          ${recommendations.products.map(product => `
            <div class="product-card">
              <h4>${product.name}</h4>
              <ul class="product-details">
                <li>Capacity: ${product.capacity}</li>
                <li>Price: ${product.price}</li>
              </ul>
              <a href="${product.link}" 
                 class="product-link" 
                 target="_blank" 
                 rel="noopener noreferrer">
                View Product
              </a>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="daily-usage-note">
        <p>Based on your selections:</p>
        <ul>
          <li>Total power draw: ${totalWatts}W</li>
          <li>Daily power usage: ${dailyKwh} kWh</li>
        </ul>
      </div>
    </div>
  `;
  
  recommendationDiv.innerHTML = html;
}
