document.addEventListener("DOMContentLoaded", async () => {
    const orderId = localStorage.getItem("orderId"); // Retrieve the order ID from localStorage or other storage
    console.log("Order ID from localStorage:", orderId);
  
    if (!orderId) {
      console.error("Order ID is missing. Ensure it is saved in localStorage.");
      return;
    }
  
    const tableBody = document.querySelector("#productDetailsTable tbody");
  
    try {
      const response = await fetch(`https://sneaker-config.onrender.com/api/v1/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Include Authorization header if required
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch order details: ${errorText}`);
      }
  
      const order = await response.json();
  
      order.products.forEach((product) => {
        const row = document.createElement("tr");
  
        // Image Column
        const imageCell = document.createElement("td");
        const image = document.createElement("img");
        image.src = "https://via.placeholder.com/150"; // Replace with actual image URL if available
        image.alt = "Product Image";
        imageCell.appendChild(image);
        row.appendChild(imageCell);
  
        // Product ID Column
        const productIdCell = document.createElement("td");
        productIdCell.textContent = product._id.slice(-8); // Display last 8 characters of the Product ID
        row.appendChild(productIdCell);
  
        // Colors Column
        const colorsCell = document.createElement("td");
        colorsCell.innerHTML = Object.entries(product.colors || {})
          .map(([part, color]) => `<strong>${part}:</strong> ${color}`)
          .join("<br>");
        row.appendChild(colorsCell);
  
        // Fabrics Column
        const fabricsCell = document.createElement("td");
        fabricsCell.innerHTML = Object.entries(product.fabrics || {})
          .map(([part, fabric]) => `<strong>${part}:</strong> ${fabric}`)
          .join("<br>");
        row.appendChild(fabricsCell);
  
        // Size Column
        const sizeCell = document.createElement("td");
        sizeCell.textContent = product.size || "N/A";
        row.appendChild(sizeCell);
  
        // Price Column
        const priceCell = document.createElement("td");
        priceCell.textContent = `$${product.price.toFixed(2)}`;
        row.appendChild(priceCell);
  
        // Quantity Column
        const quantityCell = document.createElement("td");
        quantityCell.textContent = product.quantity;
        row.appendChild(quantityCell);
  
        // Total Column
        const totalCell = document.createElement("td");
        totalCell.textContent = `$${(product.price * product.quantity).toFixed(2)}`;
        row.appendChild(totalCell);
  
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Failed to load order details. Please try again.");
    }
  });
  