document.addEventListener("DOMContentLoaded", function () {
  const SHIPPING_COST = 20; // Fixed shipping cost
  const COLOR_COST = 5; // Additional cost per selected color
  const FABRIC_COST = 5; // Additional cost per selected fabric
  const INITIALS_COST = 20; // Additional cost if initials are provided

  // Get the shoe configuration from localStorage
  const shoeConfig = JSON.parse(localStorage.getItem("shoeConfig"));
  const shoeSummary = document.getElementById("shoeSummary");
  const quantityInput = document.getElementById("quantity");
  const productPriceElement = document.getElementById("productPrice");
  const shippingCostElement = document.getElementById("shippingCost");
  const totalPriceElement = document.getElementById("totalPrice");
  const subtotalElement = document.getElementById("subtotal");

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

  // Mapping for color names
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

  // Calculate price dynamically
  function calculatePrice(quantity) {
    const basePrice = 230; // Base price for one shoe
    const colorCount = Object.keys(shoeConfig.colors || {}).length;
    const fabricCount = Object.keys(shoeConfig.fabrics || {}).length;
    const hasInitials = !!shoeConfig.initials && shoeConfig.initials.trim() !== "";

    // Calculate the additional cost based on selected colors, fabrics, and initials
    const additionalCost = colorCount * COLOR_COST + fabricCount * FABRIC_COST + (hasInitials ? INITIALS_COST : 0);

    // Product price stays constant
    const productPrice = basePrice + additionalCost;

    // Subtotal is productPrice * quantity
    const subtotal = productPrice * quantity;

    // Total price is subtotal + shipping cost
    const totalPrice = subtotal + SHIPPING_COST;

    // Update UI elements with calculated prices
    productPriceElement.textContent = `$${productPrice.toFixed(2)}`;
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingCostElement.textContent = `$${SHIPPING_COST.toFixed(2)}`;
    totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;

    return { productPrice, subtotal, totalPrice }; // Return necessary values for order data
  }

  // Initialize price display with default quantity
  let quantity = parseInt(quantityInput.value, 10) || 1;
  const priceData = calculatePrice(quantity);

  // Update price when quantity changes
  quantityInput.addEventListener("input", (event) => {
    quantity = parseInt(event.target.value, 10) || 1; // Default to 1 if invalid
    const updatedPriceData = calculatePrice(quantity);
    priceData.productPrice = updatedPriceData.productPrice;
    priceData.subtotal = updatedPriceData.subtotal;
    priceData.totalPrice = updatedPriceData.totalPrice;
  });

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
      shippingCost: SHIPPING_COST, // Include shipping cost explicitly
      totalPrice: priceData.totalPrice, // Total price including shipping
      status: "Pending",
      products: [
        {
          colors: shoeConfig.colors || {},
          fabrics: shoeConfig.fabrics || {},
          size: shoeConfig.size,
          price: priceData.productPrice, // Product price without shipping
          quantity: quantity,
          initials: shoeConfig.initials || "None",
        },
      ],
    };

    console.log("Order Data being sent:", orderData); // Debugging log
    localStorage.setItem("orderData", JSON.stringify(orderData));

    try {
      const response = await fetch("https://sneaker-config.onrender.com/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData), // Send the correctly structured orderData
      });

      if (!response.ok) throw new Error("Order submission failed.");
      const result = await response.json();
      localStorage.setItem("orderId", result.order._id); // Ensure you are storing the correct ID
      console.log("Order ID saved to localStorage:", result.order._id);
      
      localStorage.removeItem("shoeConfig");
      window.location.href = "thankyou.html"; // Redirect to thank-you page
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Failed to submit order. Please try again.");
    }
  });
});
