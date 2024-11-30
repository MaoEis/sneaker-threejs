document.addEventListener("DOMContentLoaded", function () {
  // Get the shoe configuration from localStorage
  const shoeConfig = JSON.parse(localStorage.getItem("shoeConfig"));
  const shoeSummary = document.getElementById("shoeSummary");

  // Mapping for readable shoe part names
  const partNames = {
    outside_1: "Outer Left Side",
    outside_2: "Outer Right Side",
    outside_3: "Outer Front",
    inside: "Inside of the Shoe",
    laces: "Shoe Laces",
    sole_bottom: "Bottom Sole",
    sole_top: "Top Sole",
  };

  // Mapping for color names (Example: "#03f100" becomes "Green")
  const colorNames = {
    "#03f100": "Deep burgundy",
    "#ed18b5": "Neon pink",
    "#3498db": "Electric blue",
    "#000000": "Jet black",
    "#ffffff": "Creamy white",
  };

  // Generic function to format any configuration details dynamically
  const formatConfigDetails = (config, mapping) => {
    const details = [];
    for (const [key, value] of Object.entries(config)) {
      const partName = partNames[key] || key; // Use mapped names or default to key
      const formattedValue = mapping[value] || value; // Map color name or use raw value
      details.push(`${partName}: ${formattedValue}`);
    }
    return details.join("<br>"); // Join the array into a string with a line break
  };

  // Display shoe configuration summary dynamically
  if (shoeConfig) {
    if (shoeConfig.colors) {
      const colorsElement = document.createElement("p");
      colorsElement.innerHTML = `Colors: <br> ${formatConfigDetails(shoeConfig.colors, colorNames)}`;
      shoeSummary.appendChild(colorsElement);
    }

    if (shoeConfig.fabrics) {
      const fabricsElement = document.createElement("p");
      fabricsElement.innerHTML = `Fabrics: <br> ${formatConfigDetails(shoeConfig.fabrics, {})}`;
      shoeSummary.appendChild(fabricsElement);
    }

    if (shoeConfig.size) {
      const sizeElement = document.createElement("p");
      sizeElement.textContent = `Size: ${shoeConfig.size}`;
      shoeSummary.appendChild(sizeElement);
    }

    const initialsElement = document.createElement("p");
    initialsElement.textContent = `Initials: ${shoeConfig.initials || "None"}`;
    shoeSummary.appendChild(initialsElement);
  } else {
    alert("No shoe configuration found.");
    window.location.href = "index.html"; // Redirect back to the home page if no configuration exists
  }

  // Handle order form submission
  const orderForm = document.getElementById("orderForm");
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Gather customer information dynamically
    const clientInfo = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      postalCode: parseInt(document.getElementById("postalCode").value, 10),
      city: document.getElementById("city").value,
      phone: document.getElementById("phone").value,
    };

    // Construct the order data dynamically
    const orderData = {
      customer: clientInfo,
      totalPrice: calculatePrice(),
      status: "Pending",
      products: [
        {
          productId: "1", // Replace with dynamic ID if available
          colors: shoeConfig.colors || {},
          fabrics: shoeConfig.fabrics || {},
          size: shoeConfig.size,
          price: calculatePrice(), // Dynamic calculation
          quantity: 1,
          initials: shoeConfig.initials || "None",
        },
      ],
    };

    console.log("Order Data being sent:", orderData); // Debugging log

    try {
      const response = await fetch("https://sneaker-config.onrender.com/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData), // Send the correctly structured orderData
      });

      if (!response.ok) throw new Error("Order submission failed.");
      const result = await response.json();

      // Redirect to thank you page
      alert("Order placed successfully!");
      localStorage.removeItem("shoeConfig"); // Clear the configuration from localStorage
      window.location.href = "thank-you.html"; // Redirect to thank-you page
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Failed to submit order. Please try again.");
    }
  });
});

// Calculate price dynamically
function calculatePrice() {
  // Replace with dynamic price calculation logic as needed
  return 230;
}
