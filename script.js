// API base URL
const API_BASE_URL = "http://localhost:5000";

// Utility to clear session data and reload for fresh login
function logout() {
    localStorage.removeItem("token");
    location.reload(); // Reload to reset the page
}

// Register User
async function registerUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
    });

    const data = await response.json();
    if (response.ok) {
        alert("Registration successful!");
        logout(); // Log the user out immediately after registration
    } else {
        alert(data.error || "Registration failed.");
    }
}

// Login User
async function loginUser() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("token", data.token);

        // Show sections based on role
        if (data.role === "donor") {
            document.getElementById("donationFormSection").style.display = "block";
        } else if (data.role === "delivery") {
            document.getElementById("foodEntriesSection").style.display = "block";
            fetchDonations(); // Fetch donations for delivery personnel
        }
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("registrationSection").style.display = "none";
    } else {
        alert(data.message || "Login failed.");
    }
}

// Submit Food Donation
async function submitDonation() {
    const foodType = document.getElementById("foodType").value;
    const foodQuantity = document.getElementById("foodQuantity").value;
    const foodLocation = document.getElementById("foodLocation").value;
    const contactInfo = document.getElementById("contactInfo").value;

    const response = await fetch(`${API_BASE_URL}/donation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ foodType, quantity: foodQuantity, location: foodLocation, contactInfo })
    });

    const data = await response.json();
    if (response.ok) {
        alert("Donation submitted successfully!");
        document.getElementById("donationForm").reset();
    } else {
        alert(data.error || "Failed to submit donation.");
    }
}

// Fetch Available Donations for Delivery Personnel
async function fetchDonations() {
    const response = await fetch(`${API_BASE_URL}/donation`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    const data = await response.json();

    if (response.ok) {
        const foodEntriesTable = document.getElementById("foodEntries");
        foodEntriesTable.innerHTML = "";

        data.forEach((donation) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${donation.foodType}</td>
                <td>${donation.quantity}</td>
                <td>${donation.location}</td>
                <td>${donation.contactInfo}</td>
                <td>${donation.status}</td>
                <td>
                    <button onclick="assignToDelivery('${donation._id}')">Pick Up</button>
                </td>
            `;
            foodEntriesTable.appendChild(row);
        });
    } else {
        alert("Failed to fetch donations.");
    }
}

// Assign Donation for Delivery
async function assignToDelivery(donationId) {
    const response = await fetch(`${API_BASE_URL}/donation/${donationId}/assign`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (response.ok) {
        alert("Donation picked up successfully!");
        fetchDonations(); // Refresh list after assignment
    } else {
        alert("Failed to pick up donation.");
    }
}
