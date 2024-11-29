document.addEventListener("DOMContentLoaded", function () {
  // Get the shoe configuration from localStorage
  const shoeConfig = JSON.parse(localStorage.getItem("shoeConfig"));
  const shoeSummary = document.getElementById("shoeSummary");

  // Mapping for readable shoe part names
  const partNames = {
    "outside_1": "Outer Left Side",
    "outside_2": "Outer Right Side",
    "outside_3": "Outer Front",
    "inside": "Inside of the Shoe",
    "laces": "Shoe Laces",
    "sole_bottom": "Bottom Sole",
    "sole_top": "Top Sole",
  };

  // Mapping for color names (Example: "#03f100" becomes "Green")
  const colorNames = {
    "#03f100": "Deep burgundy",
    "#ed18b5": "Neon pink",
    "#3498db": "Electric blue",
    "#000000": "Jet black",
    "#ffffff": "Creamy white",
  };

  // Function to format and display the shoe parts clearly
  const formatConfigDetails = (config) => {
    const details = [];
    for (const [part, value] of Object.entries(config)) {
      const partName = partNames[part] || part; // Use the renamed part names or fall back to the original name
      // Check if the value is a color and map it to a name
      const colorName = colorNames[value] || value; // If it's a valid color code, map to name, else show the original value
      details.push(`${partName}: ${colorName}`);
    }
    return details.join("<br>"); // Join the array into a string with a line break
  };

  // Display shoe configuration summary
  if (shoeConfig) {
    const colorsElement = document.createElement("p");
    colorsElement.innerHTML = `Colors: <br> ${formatConfigDetails(shoeConfig.colors)}`;

    const fabricsElement = document.createElement("p");
    fabricsElement.innerHTML = `Fabrics: <br> ${formatConfigDetails(shoeConfig.fabrics)}`;

    const sizeElement = document.createElement("p");
    sizeElement.textContent = `Size: ${shoeConfig.size}`;

    const initialsElement = document.createElement("p");
    initialsElement.textContent = `Initials: ${shoeConfig.initials || "None"}`;

    // Append all elements to the shoeSummary div
    shoeSummary.appendChild(colorsElement);
    shoeSummary.appendChild(fabricsElement);
    shoeSummary.appendChild(sizeElement);
    shoeSummary.appendChild(initialsElement);
  } else {
    alert("No shoe configuration found.");
    window.location.href = "index.html"; // Redirect back to the home page if no configuration exists
  }

  // Handle order form submission
  const orderForm = document.getElementById("orderForm");
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Gather customer information
    const clientInfo = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      postalCode: parseInt(document.getElementById("postalCode").value, 10), // Ensure postal code is an integer
      city: document.getElementById("city").value,
    };

    // Ensure that products are included in the order data, and include the shoe configuration
    const orderData = {
      customer: clientInfo,
      totalPrice: calculatePrice(),
      status: "Pending",
      products: [
        {
          productId: "shoe1234", // Example product ID, should be dynamic
          colors: shoeConfig.colors,   // Include colors from the shoeConfig
          fabrics: shoeConfig.fabrics, // Include fabrics from the shoeConfig
          size: shoeConfig.size,      // Include size from the shoeConfig
          price: 220, // Example price, should be dynamic
          quantity: 1, // Example quantity
        },
      ],
    };

    console.log("Order Data: ", orderData); // Log the orderData before sending it

    try {
      const response = await fetch("https://sneaker-config.onrender.com/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData), // Send orderData including product details
      });

      if (!response.ok) throw new Error("Order submission failed.");
      const result = await response.json();

      // Redirect to thank you page
      alert("Order placed successfully!");
      localStorage.removeItem("shoeConfig"); // Clear the configuration from localStorage
      window.location.href = "thank-you.html"; // You can create a thank-you page
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Failed to submit order. Please try again.");
    }
  });
});

// Calculate price dynamically
function calculatePrice() {
  // For now, return a fixed price. Replace with dynamic calculation as needed
  return 230;
}
