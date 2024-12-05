document.addEventListener("DOMContentLoaded", () => {
    const orderData = JSON.parse(localStorage.getItem("orderData"));

    if (!orderData) {
        alert("No order data found.");
        window.location.href = "index.html"; // Redirect if no order data
        return;
    }

    // Populate customer details
    const customerInfoContainer = document.querySelector(".order_info_contact");
    customerInfoContainer.innerHTML = `
        <h2>Customer</h2>
        <p><strong>Contact info:</strong></p>
        <p>${orderData.customer.firstName} ${orderData.customer.lastName}</p>
        <p>${orderData.customer.email}</p>
        <p>${orderData.customer.phone}</p>
    `;

    const shippingAddressContainer = document.querySelector(".order_info_shipping_adress");
    shippingAddressContainer.innerHTML = `
        <p><strong>Ship to:</strong></p>
        <p>${orderData.customer.firstName} ${orderData.customer.lastName}</p>
        <p>${orderData.customer.address}</p>
        <p>${orderData.customer.city}, ${orderData.customer.postalCode}</p>
    `;

    // Populate product details
    const productDetailsContainer = document.querySelector(".product_details tbody");
    const product = orderData.products[0];
    const colors = Object.entries(product.colors)
        .map(([part, color]) => `<strong>${part}:</strong> ${color}`)
        .join("<br>");
    const fabrics = Object.entries(product.fabrics)
        .map(([part, fabric]) => `<strong>${part}:</strong> ${fabric}`)
        .join("<br>");

    productDetailsContainer.innerHTML = `
        <tr>
            <td><img src="https://via.placeholder.com/150" alt="Product Image"></td>
            <td>${colors}</td>
            <td>${fabrics}</td>
            <td>${product.size}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>$${(product.price * product.quantity).toFixed(2)}</td>
        </tr>
    `;

    // Populate shipping and payment details
    const shippingContainer = document.querySelector(".order_info_shipping_subcontainer");
    shippingContainer.innerHTML = `
        <p><strong>Shipping Method:</strong> BPost</p>
        <p>$${orderData.shippingCost.toFixed(2)}</p>
    `;

    const paymentContainer = document.querySelector(".order_info_payment_subcontainer");
    paymentContainer.innerHTML = `
        <p><strong>Subtotal:</strong> $${product.price.toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${orderData.shippingCost.toFixed(2)}</p>
        <p><strong>Total:</strong> $${orderData.totalPrice.toFixed(2)}</p>
    `;
});
