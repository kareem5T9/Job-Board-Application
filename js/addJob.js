import {
    auth,
    db,
    onAuthStateChanged,
    collection,
    addDoc
} from "./firebaseConfigure.js";

const jobForm = document.getElementById("job-form");

jobForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const successEl = document.getElementById("job-success");
    const errorEl = document.getElementById("job-error");
    const successText = successEl.querySelector("span");
    const errorText = errorEl.querySelector("span");


    successEl.classList.add("hidden");
    errorEl.classList.add("hidden");


    const title = document.getElementById("job-title").value.trim();
    const company = document.getElementById("job-company").value.trim();
    const location = document.getElementById("job-location").value.trim();

    const type = document.getElementById("job-type").value;
    const category = document.getElementById("job-category").value;
    const experience = document.getElementById("job-experience").value;
    const education = document.getElementById("job-education").value;
    const description = document.getElementById("job-description").value.trim();
    const requirementsText = document.getElementById("job-requirements").value.trim();

    const contact = document.getElementById("job-contact").value.trim();
    const deadline = document.getElementById("job-deadline").value;


    const requirements = requirementsText.split('\n').filter(item => item.trim() !== '');



    if (!title || !company || !location || !type || !category ||
        !experience || !education || !description || requirements.length === 0 || !contact || !deadline) {
        errorEl.classList.remove("hidden");
        errorText.textContent = "Please fill in all required fields.";
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact)) {
        errorEl.classList.remove("hidden");
        errorText.textContent = "Please enter a valid email address.";
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }


    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
        errorEl.classList.remove("hidden");
        errorText.textContent = "Application deadline must be in the future.";
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    try {
        // Disable submit button to prevent double submission
        const submitBtn = jobForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';


        await addDoc(collection(db, "jobs"), {
            title: title,
            company: company,
            location: location,

            type: type,
            category: category,
            experience: experience,
            education: education,
            description: description,
            requirements: requirements,

            contact: contact,
            deadline: deadline,
            postedBy: auth.currentUser.email,
            postedById: auth.currentUser.uid,
            createdAt: new Date(),
            views: 0,
            applications: 0
        });


        successEl.classList.remove("hidden");
        successText.textContent = "Job posted successfully! Redirecting...";
        window.scrollTo({ top: 0, behavior: 'smooth' });


        jobForm.reset();


        setTimeout(() => {
            window.location.href = "home.html";
        }, 2000);

    } catch (error) {
        console.error("Error posting job:", error);
        errorEl.classList.remove("hidden");
        errorText.textContent = "Error: " + error.message;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-enable submit button
        const submitBtn = jobForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Job';
    }
});


jobForm.addEventListener("reset", function() {
    const successEl = document.getElementById("job-success");
    const errorEl = document.getElementById("job-error");
    successEl.classList.add("hidden");
    errorEl.classList.add("hidden");
});

// Set minimum date for deadline to today
window.addEventListener("DOMContentLoaded", function() {
    const deadlineInput = document.getElementById("job-deadline");
    const today = new Date().toISOString().split('T')[0];
    deadlineInput.setAttribute('min', today);
});


onAuthStateChanged(auth, function(user) {
    if (user) {
        console.log("User logged in:", user.email);
    } else {
        window.location.href = "loginPage.html";
        alert("Please login to post a job");
    }
});