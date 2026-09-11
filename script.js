const product = {
    name: "Passport to Paradise A4 Travel Planner",
    price: 150,
    pdf: "images/Passport_to_Paradise_A4.pdf"
};

const emailConfig = {
    publicKey: "hd-ViG7pO2Y4sK0Ee",
    serviceId: "service_a29b1wa",
    templateId: "template_tdnjdeb",
    orderCopyEmail: "fathima.bbali@gmail.com",
    websiteBaseUrl: "https://www.glowshiftshift.co.za",
    logo: "images/Logo.jpg"
};

let orderReference = generateReference();
let orderQty = 1;

const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");
const addPlannerBtn = document.getElementById("addPlannerBtn");
const checkoutForm = document.getElementById("checkoutForm");
const orderReferenceEl = document.getElementById("orderReference");
const orderTotal = document.getElementById("orderTotal");
const successModal = document.getElementById("successModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const successReference = document.getElementById("successReference");
const sentEmailDisplay = document.getElementById("sentEmailDisplay");
const submitOrderBtn = document.getElementById("submitOrderBtn");
const checkoutStatus = document.getElementById("checkoutStatus");

if (window.emailjs) {
    emailjs.init({ publicKey: emailConfig.publicKey });
}

function generateReference() {
    return `EFT-${Math.floor(1000 + Math.random() * 9000)}`;
}

function updateOrderUI() {
    cartBadge.textContent = orderQty;
    orderTotal.textContent = `R${(product.price * orderQty).toFixed(2)}`;
    orderReferenceEl.textContent = orderReference;
}

function getHttpsAssetUrl(assetPath) {
    return `${emailConfig.websiteBaseUrl}/${assetPath.replace(/^\/+/, "")}`;
}

function getPdfLink() {
    return getHttpsAssetUrl(product.pdf);
}

function getLogoLink() {
    return getHttpsAssetUrl(emailConfig.logo);
}

function getOrderTotal() {
    return `R${(product.price * orderQty).toFixed(2)}`;
}

function scrollToCheckout() {
    document.getElementById("checkout").scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildBaseOrderParams(name, email) {
    return {
        customer_name: name,
        customer_email: email,
        logo_url: getLogoLink(),
        order_reference: orderReference,
        product_name: product.name,
        order_total: getOrderTotal(),
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
        pdf_link: getPdfLink(),
        message: "New manual EFT order received. Verify payment before releasing the PDF download link to the customer."
    });

    const customerReceipt = emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
        ...baseParams,
        email_type: "customer_receipt",
        to_email: email,
        proof_instructions: "Please transfer payment and send your Proof of Payment (PoP) via WhatsApp to +27 60 564 5295. Once verified, your download link will be emailed to you.",
        message: "Order received. Your PDF download link will be released by email after payment verification."
    });

    return Promise.all([ownerAlert, customerReceipt]);
}

function setCheckoutLoading(isLoading) {
    submitOrderBtn.disabled = isLoading;
    submitOrderBtn.textContent = isLoading ? "Completing Order..." : "Confirm Payment & Complete Order";
}

addPlannerBtn.addEventListener("click", () => {
    orderQty = 1;
    updateOrderUI();
    scrollToCheckout();
});

cartBtn.addEventListener("click", scrollToCheckout);

checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("custName").value.trim();
    const email = document.getElementById("custEmail").value.trim();

    if (!name || !email) return;

    checkoutStatus.textContent = "Submitting your order details...";
    setCheckoutLoading(true);

    try {
        await sendOrderEmails(name, email);

        successReference.textContent = orderReference;
        sentEmailDisplay.textContent = email;
        successModal.classList.add("open");
        checkoutStatus.textContent = "Order received. Please send your Proof of Payment via WhatsApp to +27 60 564 5295.";

        orderReference = generateReference();
        updateOrderUI();
        checkoutForm.reset();
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

updateOrderUI();