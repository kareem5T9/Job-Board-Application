import { auth, signInWithEmailAndPassword } from './firebaseConfigure.js';

const signInBtn = document.getElementById("signInBtn");
const loginError = document.getElementById("login-error");
const errorText = loginError.querySelector("span");

signInBtn.addEventListener("click", async() => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    loginError.style.display = "none";


    if (!email || !password) {
        loginError.style.display = "block";
        errorText.textContent = "Please enter both email and password.";
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect to home page after success
        window.location.href = "home.html";

    } catch (error) {
        loginError.style.display = "block";
        errorText.textContent = error.message;
    }
});