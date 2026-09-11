const products = [
    {
        id: "travel-planner",
        name: "Passport to Paradise A4 Travel Planner",
        category: "Travel Planner",
        price: 150,
        icon: "fa-plane-departure",
        pdf: "images/Passport_to_Paradise_A4_web.pdf",
        description: "A premium travel planner for trips, packing, budgets, car essentials, beauty notes, bags, and gadgets."
    },
    {
        id: "car-checklist",
        name: "Car Essentials Checklist",
        category: "Car Accessories",
        price: 75,
        icon: "fa-car-side",
        pdf: "",
        description: "A clean printable checklist for road trips, vehicle prep, emergency items, and travel accessories."
    },
    {
        id: "beauty-tracker",
        name: "Beauty & Makeup Routine Planner",
        category: "Makeup",
        price: 85,
        icon: "fa-wand-magic-sparkles",
        pdf: "",
        description: "Plan skincare, makeup looks, products, appointments, and beauty goals in one stylish template."
    },
    {
        id: "bag-organizer",
        name: "Bag & Lifestyle Organizer",
        category: "Bags",
        price: 95,
        icon: "fa-suitcase-rolling",
        pdf: "",
        description: "A lifestyle organizer for handbags, travel bags, everyday carry items, and personal essentials."
    },
    {
        id: "gadget-planner",
        name: "Digital Gadgets Planner",
        category: "Gadgets",
        price: 80,
        icon: "fa-mobile-screen",
        pdf: "",
        description: "Track gadgets, chargers, accessories, subscriptions, and tech packing lists for daily life or travel."
    }
];

const emailConfig = {
    publicKey: "hd-ViG7pO2Y4sK0Ee",
    serviceId: "service_a29b1wa",
    templateId: "template_tdnjdeb",
    orderCopyEmail: "fathima.bbali@gmail.com",
    websiteBaseUrl: "https://www.glowshiftshift.co.za",
    logo: "images/NEW LOGO.jpg"
};

let cart = [];
let orderReference = generateReference();

const productGrid = document.getElementById("productGrid");
const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");
const cartItems = document.getElementById("cartItems");
const checkoutForm = document.getElementById("checkoutForm");
const orderReferenceEl = document.getElementById("orderReference");
const orderTotal = document.getElementById("orderTotal");
const selectedProductName = document.getElementById("selectedProductName");
const successModal = document.getElementById("successModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const successReference = document.getElementById("successReference");
const sentEmailDisplay = document.getElementById("sentEmailDisplay");
const successMessage = document.getElementById("successMessage");
const submitOrderBtn = document.getElementById("submitOrderBtn");
const checkoutStatus = document.getElementById("checkoutStatus");
const eftDetails = document.getElementById("eftDetails");
const cardDetails = document.getElementById("cardDetails");

if (window.emailjs) {
    emailjs.init({ publicKey: emailConfig.publicKey });
}

function generateReference() {
    return `EFT-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getHttpsAssetUrl(assetPath) {
    return assetPath ? `${emailConfig.websiteBaseUrl}/${assetPath.replace(/^\/+/, "")}` : "";
}

function getLogoLink() {
    return getHttpsAssetUrl(emailConfig.logo);
}

function getCartTotal() {
    return cart.reduce((total, item) => total + item.price, 0);
}

function getOrderTotal() {
    return `R${getCartTotal().toFixed(2)}`;
}

function getOrderDetails() {
    return cart.map(item => `${item.name} - R${item.price.toFixed(2)}`).join("\n");
}

function getInternalPdfLinks() {
    const links = cart
        .filter(item => item.pdf)
        .map(item => `${item.name}: ${getHttpsAssetUrl(item.pdf)}`);

    return links.length ? links.join("\n") : "No PDF file has been uploaded for one or more selected products yet.";
}

function getSelectedPaymentMethod() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    return selected ? selected.value : "eft";
}

function updatePaymentMethodUI() {
    const method = getSelectedPaymentMethod();
    eftDetails.classList.toggle("hidden", method !== "eft");
    cardDetails.classList.toggle("hidden", method !== "card");
    submitOrderBtn.textContent = method === "card" ? "Complete Card Request" : "Complete EFT Order";
}

function renderCartItems() {
    if (!cart.length) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty. Choose a product from the shop.</p>';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div>
                <strong>${item.name}</strong>
                <span>${item.category} - R${item.price.toFixed(2)}</span>
            </div>
            <button class="remove-cart-btn" type="button" data-remove-id="${item.id}" aria-label="Remove ${item.name} from cart">
                <i class="fa-solid fa-trash"></i>
                Remove
            </button>
        </div>
    `).join("");
}

function updateOrderUI() {
    cartBadge.textContent = cart.length;
    selectedProductName.textContent = cart.length ? `${cart.length} item${cart.length === 1 ? "" : "s"} selected` : "No products selected";
    orderTotal.textContent = getOrderTotal();
    orderReferenceEl.textContent = orderReference;
    renderCartItems();
}

function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <article class="product-card shop-product" data-product-id="${product.id}">
            <div class="product-image">
                <i class="fa-solid ${product.icon}"></i>
                <span>${product.category}</span>
            </div>
            <div class="product-info">
                <span class="category-tag">${product.category}</span>
                <h3>${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <span class="price">R${product.price.toFixed(2)}</span>
                    <button class="add-btn" type="button" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        </article>
    `).join("");
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    if (!product) return;

    if (!cart.some(item => item.id === productId)) {
        cart.push(product);
    }

    orderReference = generateReference();
    updateOrderUI();
    document.getElementById("checkout").scrollIntoView({ behavior: "smooth", block: "start" });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateOrderUI();
}

function buildBaseOrderParams(name, email) {
    return {
        customer_name: name,
        customer_email: email,
        logo_url: getLogoLink(),
        order_reference: orderReference,
        product_name: cart.map(item => item.name).join(", "),
        order_details: getOrderDetails(),
        order_total: getOrderTotal(),
        payment_method: getSelectedPaymentMethod() === "card" ? "Credit Card Request" : "Manual EFT",
        whatsapp_number: "+27 60 564 5295"
    };
}

async function sendOrderEmails(name, email) {
    if (!window.emailjs) {
        throw new Error("EmailJS SDK could not be loaded.");
    }

    const baseParams = buildBaseOrderParams(name, email);

    const ownerAlert = emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
        ...baseParams,
        email_type: "owner_order_alert",
        to_email: emailConfig.orderCopyEmail,
        owner_email: emailConfig.orderCopyEmail,
        pdf_link: getInternalPdfLinks(),
        message: "New order received. Verify payment before releasing any digital download link to the customer."
    });

    const customerReceipt = emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
        ...baseParams,
        email_type: "customer_receipt",
        to_email: email,
        proof_instructions: getSelectedPaymentMethod() === "card"
            ? "Your card payment request has been received. Fathima will send a secure payment link. Your download will be emailed once payment is verified."
            : "Please transfer payment and send your Proof of Payment (PoP) via WhatsApp to +27 60 564 5295. Once verified, your download link will be emailed to you.",
        message: "Order received. Your digital download link will be released by email after payment verification."
    });

    return Promise.all([ownerAlert, customerReceipt]);
}

function setCheckoutLoading(isLoading) {
    submitOrderBtn.disabled = isLoading;
    submitOrderBtn.textContent = isLoading ? "Submitting Order..." : getSelectedPaymentMethod() === "card" ? "Complete Card Request" : "Complete EFT Order";
}

productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-product-id]");
    if (!button) return;
    addToCart(button.dataset.productId);
});

cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;
    removeFromCart(button.dataset.removeId);
});

cartBtn.addEventListener("click", () => {
    document.getElementById(cart.length ? "checkout" : "shop").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener("change", updatePaymentMethodUI);
});

checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!cart.length) {
        checkoutStatus.textContent = "Please add at least one product to your cart before completing the order.";
        document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
    }

    const name = document.getElementById("custName").value.trim();
    const email = document.getElementById("custEmail").value.trim();
    const paymentMethod = getSelectedPaymentMethod();

    if (!name || !email) return;

    checkoutStatus.textContent = "Submitting your order details...";
    setCheckoutLoading(true);

    try {
        await sendOrderEmails(name, email);

        successReference.textContent = orderReference;
        sentEmailDisplay.textContent = email;
        successMessage.textContent = paymentMethod === "card"
            ? "Order Received! Your credit card payment request has been sent. Fathima will email or WhatsApp you a secure payment link. Once verified, your download link will be emailed to you."
            : "Order Received! To complete your purchase and receive your PDF, please transfer payment and send your Proof of Payment (PoP) via WhatsApp to +27 60 564 5295. Once verified, your download link will be emailed to you.";
        successModal.classList.add("open");
        checkoutStatus.textContent = paymentMethod === "card"
            ? "Card payment request received. A secure payment link will be sent to you."
            : "Order received. Please send your Proof of Payment via WhatsApp to +27 60 564 5295.";

        cart = [];
        orderReference = generateReference();
        checkoutForm.reset();
        updateOrderUI();
        updatePaymentMethodUI();
    } catch (error) {
        console.error("EmailJS send failed:", error);
        checkoutStatus.textContent = "The order could not be emailed. Please check the EmailJS template/settings and try again.";
    } finally {
        setCheckoutLoading(false);
    }
});

closeModalBtn.addEventListener("click", () => {
    successModal.classList.remove("open");
});

successModal.addEventListener("click", (event) => {
    if (event.target === successModal) {
        successModal.classList.remove("open");
    }
});

renderProducts();
updateOrderUI();
updatePaymentMethodUI();