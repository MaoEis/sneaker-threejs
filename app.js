// Page management
const pages = {
    home: document.getElementById("home-page"),
    order: document.getElementById("order-page"),
  };
  
  // Show a specific page
  function showPage(page) {
    Object.values(pages).forEach((p) => {
      if (p) {
        p.style.display = "none"; // Only attempt to access 'style' if element exists
      }
    });
  
    if (pages[page]) {
      pages[page].style.display = "block"; // Only show if the page element exists
    }
  }
  
  // Shoe configuration
  const shoeConfig = {
    colors: { default: "None selected" }, // Default value for color
    fabrics: { default: "None selected" }, // Default value for fabric
    size: "None selected", // Default size
    initials: null, // Initials can be empty or set to 'None selected'
    quantity: 1, 
  };
  const SHIPPING_COST = 20;


  // Validate shoe configuration
  function validateShoeConfig() {
    return (
      Object.keys(shoeConfig.colors).length > 0 &&
      Object.keys(shoeConfig.fabrics).length > 0 &&
      shoeConfig.size,
      shoeConfig.quantity > 0 // Ensure quantity is greater than 0

    );
  }

  // Function to calculate the product price based on quantity
function calculateProductPrice(quantity = 1) {
  const basePrice = 230; // Base price for one shoe
  return basePrice * quantity;
}

// Function to update the price summary
function updatePriceSummary(quantity) {
  const productPrice = calculateProductPrice(quantity);
  const totalPrice = productPrice + SHIPPING_COST;

  document.getElementById("productPrice").textContent = `$${productPrice.toFixed(2)}`;
  document.getElementById("shippingCost").textContent = `$${SHIPPING_COST.toFixed(2)}`;
  document.getElementById("totalPrice").textContent = `$${totalPrice.toFixed(2)}`;
}

// Handle quantity changes
document.getElementById("quantity").addEventListener("input", (event) => {
  const quantity = parseInt(event.target.value, 10) || 1; // Default to 1 if invalid input
  shoeConfig.quantity = quantity;
  updatePriceSummary(quantity);
});

// Initially set up the price summary
updatePriceSummary(shoeConfig.quantity);


  
  // Display shoe summary (Order Page)
  function displayShoeSummary() {
    const summary = document.getElementById("shoeSummary");
    const config = JSON.parse(localStorage.getItem("shoeConfig"));
  
    if (!config) {
      alert("No shoe configuration found.");
      return;
    }

    const totalPrice = calculatePrice(config.quantity);
    const grandTotal = totalPrice + SHIPPING_COST;
  
  
    summary.innerHTML = `
      <p>Colors: ${JSON.stringify(config.colors)}</p>
      <p>Fabrics: ${JSON.stringify(config.fabrics)}</p>
      <p>Size: ${config.size}</p>
      <p>Initials: ${config.initials || "None"}</p>
      <p>Quantity: ${config.quantity || 1}</p>
      <p>Product Price: $${totalPrice.toFixed(2)}</p>
      <p>Shipping Cost: $${SHIPPING_COST.toFixed(2)}</p>
      <p><strong>Total Price: $${grandTotal.toFixed(2)}</strong></p>
      `;
}

function calculatePrice(quantity = 1) {
  const basePrice = 230; // Base price for one shoe
  return basePrice * quantity;
}
  
  // Event: Submit Order (Order Page)
  document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const clientInfo = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      postalCode: document.getElementById("postalCode").value,
      city: document.getElementById("city").value,
    };
  
    const orderData = {
      customer: clientInfo,
      shoeConfig: JSON.parse(localStorage.getItem("shoeConfig")),
      totalPrice: calculatePrice(),
      status: "Pending",
    };
  
    try {
        console.log("Order Data: ", orderData); // Log the orderData to make sure the format is correct

      const response = await fetch("http://localhost:5174/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
  
      if (!response.ok) throw new Error("Order submission failed.");
      const result = await response.json();
  
      localStorage.removeItem("shoeConfig");
      document.getElementById("orderId").textContent = result.order._id;
      showPage("thankYou");
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Failed to submit order. Please try again.");
    }
  });
  
  // Event: Back to Home (Thank You Page)
  document.getElementById("backHomeButton").addEventListener("click", () => {
    showPage("home");
  });


  // Initially show the Home Page
  showPage("home");
  