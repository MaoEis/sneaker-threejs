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
  };
  

  // Validate shoe configuration
  function validateShoeConfig() {
    return (
      Object.keys(shoeConfig.colors).length > 0 &&
      Object.keys(shoeConfig.fabrics).length > 0 &&
      shoeConfig.size
    );
  }
  
  // Display shoe summary (Order Page)
  function displayShoeSummary() {
    const summary = document.getElementById("shoeSummary");
    const config = JSON.parse(localStorage.getItem("shoeConfig"));
  
    if (!config) {
      alert("No shoe configuration found.");
      return;
    }
  
    summary.innerHTML = `
      <p>Colors: ${JSON.stringify(config.colors)}</p>
      <p>Fabrics: ${JSON.stringify(config.fabrics)}</p>
      <p>Size: ${config.size}</p>
      <p>Initials: ${config.initials || "None"}</p>
    `;
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
  
  // Calculate price dynamically
  function calculatePrice() {
    return 230; // Replace with dynamic logic if needed
  }
  
  // Initially show the Home Page
  showPage("home");
  