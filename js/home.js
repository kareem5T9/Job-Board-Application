import { auth, db, signOut, onAuthStateChanged, collection, onSnapshot } from "./firebaseConfigure.js";

onAuthStateChanged(auth, (user) => {
    const currentUserName = document.getElementById("currentUserName");


    if (user) {
        currentUserName.textContent = user.email;

    } else {
        location.href = "loginPage.html";
        alert("Please login");
    }
});

const jobsContainer = document.getElementById("jobs-container");
const postJobBtn = document.getElementById("postJobBtn");
let allJobs = [];


postJobBtn.addEventListener("click", () => {
    location.href = "addJobPage.html";
});


const myApplicationsBtn = document.getElementById("myApplicationsBtn");

myApplicationsBtn.addEventListener("click", () => {
    location.href = "myApplications.html";
});


function renderJobs(snapshot) {
    allJobs = [];
    jobsContainer.innerHTML = "";

    snapshot.forEach((doc) => {
        const data = doc.data();
        allJobs.push({ id: doc.id, ...data });
    });

    displayJobs(allJobs);
}

function displayJobs(jobs) {
    jobsContainer.innerHTML = "";

    if (jobs.length === 0) {
        jobsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-briefcase"></i></div>
                <h3 class="empty-title">No Jobs Available</h3>
                <p class="empty-description">Be the first to post a job opportunity!</p>
                <button class="btn btn-primary" onclick="location.href='addJobPage.html'">
                    <i class="fas fa-plus"></i> Post New Job
                </button>
            </div>
        `;
        return;
    }

    jobs.forEach((job) => {
                const card = document.createElement("div");
                card.className = "job-card";

                // Format job type class
                const typeClass = `type-${job.type}`;

                // Calculate days until deadline
                let deadlineText = "";
                if (job.deadline) {
                    const deadline = new Date(job.deadline);
                    const today = new Date();
                    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

                    if (daysLeft < 0) {
                        deadlineText = '<span style="color: var(--error);">Expired</span>';
                    } else if (daysLeft === 0) {
                        deadlineText = '<span style="color: var(--warning);">Today</span>';
                    } else if (daysLeft <= 7) {
                        deadlineText = `<span style="color: var(--warning);">${daysLeft} days left</span>`;
                    } else {
                        deadlineText = `${daysLeft} days left`;
                    }
                }

                card.innerHTML = `
            <div class="job-card-header">
                <p class="job-company">
                    <i class="fas fa-building"></i> ${job.company}
                </p>
                <h3 class="job-card-title">${job.title}</h3>
            </div>
            <div class="job-card-content">
                <p class="job-card-description">${job.description}</p>
                <div class="job-meta">
                    <span class="job-meta-item">
                        <i class="fas fa-map-marker-alt"></i> ${job.location}
                    </span>
                    <span class="job-meta-item">
                        <i class="fas fa-money-bill-wave"></i> ${job.salary}
                    </span>
                    <span class="job-meta-item">
                        <i class="fas fa-chart-line"></i> ${formatExperience(job.experience)}
                    </span>
                    ${job.deadline ? `
                    <span class="job-meta-item">
                        <i class="fas fa-calendar-times"></i> ${deadlineText}
                    </span>
                    ` : ''}
                </div>
            </div>
            <div class="job-card-footer">
                <span class="job-category">${formatCategory(job.category)}</span>
                <span class="job-type ${typeClass}">${formatJobType(job.type)}</span>
            </div>
        `;

        
        card.addEventListener('click', () => {
            location.href = `jobDetails.html?id=${job.id}`;
        });

        jobsContainer.appendChild(card);
    });
}


function formatJobType(type) {
    const types = {
        'full-time': 'Full Time',
        'part-time': 'Part Time',
        'contract': 'Contract',
        'internship': 'Internship',
        'remote': 'Remote'
    };

    return types[type] || type;
}

function formatCategory(category) {
    const categories = {
        'it': 'IT',
        'marketing': 'Marketing',
        'finance': 'Finance',
        'healthcare': 'Healthcare',
        'education': 'Education',
        'engineering': 'Engineering',
        'sales': 'Sales',
        'design': 'Design'
    };

    return categories[category] || category;
}

function formatExperience(experience) {
    const levels = {
        'entry': 'Entry Level',
        'mid': 'Mid Level',
        'senior': 'Senior Level',
        'executive': 'Executive'
    };

    return levels[experience] || experience;
}

onSnapshot(collection(db, "jobs"), (snapshot) => {
    renderJobs(snapshot);
});


const logOutBtn = document.getElementById("logOut");
logOutBtn.addEventListener("click", async() => {
    try {
        await signOut(auth);
        location.href = "loginPage.html";
    } catch (error) {
        console.error(error.message);
        alert("Error logging out: " + error.message);
    }
});