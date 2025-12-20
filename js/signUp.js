import {
    auth,
    createUserWithEmailAndPassword
} from './firebaseConfigure.js';

const signBtn = document.getElementById("createAccount");

signBtn.addEventListener("click", async() => {
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    const successEl = document.getElementById("signup-success");
    const errorEl = document.getElementById("signup-error");
    const successText = successEl.querySelector("span");
    const errorText = errorEl.querySelector("span");

    // Hide messages
    successEl.style.display = "none";
    errorEl.style.display = "none";


    if (name === "") {
        errorEl.style.display = "block";
        errorText.textContent = "Please enter your full name";
        return;
    }

    if (email === "") {
        errorEl.style.display = "block";
        errorText.textContent = "Please enter your email";
        return;
    }

    if (password === "") {
        errorEl.style.display = "block";
        errorText.textContent = "Please enter a password";
        return;
    }

    if (password.length < 6) {
        errorEl.style.display = "block";
        errorText.textContent = "Password should be at least 6 characters";
        return;
    }

    if (password !== confirmPassword) {
        errorEl.style.display = "block";
        errorText.textContent = "Passwords do not match";
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);

        successEl.style.display = "block";
        successText.textContent = "Account created successfully! Redirecting to login...";

        // Clear form
        document.getElementById("signup-name").value = "";
        document.getElementById("signup-email").value = "";
        document.getElementById("signup-password").value = "";
        document.getElementById("signup-confirm-password").value = "";

        // Redirect to login page after success
        setTimeout(() => {
            window.location.href = "loginPage.html";
        }, 2000);

    } catch (error) {
        errorEl.style.display = "block";
        errorText.textContent = error.message;
    }
});