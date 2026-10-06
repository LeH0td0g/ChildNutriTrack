// ==========================
// DEFAULT ADMIN ACCOUNT
// ==========================
const DEFAULT_ADMIN = {
    name: "Admin",
    email: "admin@system.com",
    password: "admin123",
    role: "admin"
};

(function () {
    if (!localStorage.getItem("admin")) {
        localStorage.setItem("admin", JSON.stringify(DEFAULT_ADMIN));
    }
})();

// ==========================
// LOGIN
// ==========================
const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById("password")
        .value;

    const admin = JSON.parse(localStorage.getItem("admin"));
    const parents = JSON.parse(localStorage.getItem("parents")) || [];

    // Admin
    if (
        admin &&
        email === admin.email &&
        password === admin.password
    ) {

        localStorage.setItem(
            "currentUser",
            JSON.stringify(admin)
        );

        alert("Welcome, Admin!")

        window.location.href = "admin/mainpage.html";
        return;
    }

    // Parent / User
    const parent = parents.find(p =>
        p.email === email
    );

    if (parent && password == 1234) {

        localStorage.setItem(
            "currentParent",
            JSON.stringify(parent)
        );

        localStorage.setItem(
            "currentUser",
            JSON.stringify(parent)
        );

        alert("Welcome, " + parent.name + "!")

        window.location.href = "parents/usermain.html";
        return;
    }

    //In-Charge
    const inCharge = incharge.find(c =>
        c.email === email
    )

    if (parent && password == 1234 ) {
        
    }

    document.getElementById("error").textContent =
        "Invalid email or password";
});