document.addEventListener("DOMContentLoaded", async () => {
    const orderId = localStorage.getItem("orderId");

    // Check if orderId exists
    if (!orderId) {
        console.error("Order ID is missing from localStorage.");
        alert("Order ID is missing. Please try again.");
        window.location.href = "index.html"; // Redirect to homepage
        return;
    }

    console.log("Order ID from localStorage:", orderId); // Debugging log

    try {
        // Fetch order details
        const response = await fetch(`https://sneaker-config.onrender.com/api/v1/orders/${orderId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch order details: ${await response.text()}`);
        }

        const order = await response.json();

        // Populate the order number
        const orderNumberElement = document.getElementById("orderNumber");
        orderNumberElement.textContent = `#${order._id.slice(-8)}`; // Show last 8 characters of order ID

        // Format the order creation date
        const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        console.log("Formatted Order Date:", orderDate);

        // Populate the order date
        const orderDateElement = document.getElementById("orderDate");
        orderDateElement.textContent = orderDate;

        // Populate customer details
        const customerInfoContainer = document.querySelector(".order_info_contact");
        customerInfoContainer.innerHTML = `
            <h2>Customer</h2>
            <p><strong>Contact info:</strong></p>
            <p>${order.customer.firstName} ${order.customer.lastName}</p>
            <p>${order.customer.email}</p>
            <p>${order.customer.phone}</p>
        `;

        // Populate shipping details
        const shippingAddressContainer = document.querySelector(".order_info_shipping_adress");
        shippingAddressContainer.innerHTML = `
            <p><strong>Ship to:</strong></p>
            <p>${order.customer.firstName} ${order.customer.lastName}</p>
            <p>${order.customer.address}</p>
            <p>${order.customer.city}, ${order.customer.postalCode}</p>
        `;

        // Populate product details
        const productDetailsContainer = document.querySelector(".product_details tbody");
        const subtotal = order.products.reduce((total, product) => total + product.price * product.quantity, 0);

        order.products.forEach((product) => {
            const colors = Object.entries(product.colors)
                .map(([part, color]) => `<strong>${part}:</strong> ${color}`)
                .join("<br>");
            const fabrics = Object.entries(product.fabrics)
                .map(([part, fabric]) => `<strong>${part}:</strong> ${fabric}`)
                .join("<br>");

            productDetailsContainer.innerHTML += `
                <tr>
                    <td><img src="https://via.placeholder.com/150" alt="Product Image"></td>
                    <td>${product._id ? product._id.slice(-8) : "N/A"}</td> <!-- Use product ID -->
                    <td>${colors}</td>
                    <td>${fabrics}</td>
                    <td>${product.size}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.quantity}</td>
                    <td>$${(product.price * product.quantity).toFixed(2)}</td>
                </tr>
            `;
        });

        // Calculate and display the total
        const shippingCost = order.shippingCost || 0;
        const total = subtotal + shippingCost;

        // Populate shipping and payment details
        const shippingContainer = document.querySelector(".order_info_shipping_subcontainer");
        shippingContainer.innerHTML = `
            <p><strong>Shipping Method:</strong> BPost</p>
            <p>$${shippingCost.toFixed(2)}</p>
        `;

        const paymentContainer = document.querySelector(".order_info_payment_subcontainer");
        paymentContainer.innerHTML = `
            <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
            <p><strong>Shipping:</strong> $${shippingCost.toFixed(2)}</p>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
        `;
    } catch (error) {
        console.error("Error fetching order details:", error);
        alert("Failed to load order details. Please try again.");
        window.location.href = "index.html"; // Redirect on failure
    }
});
