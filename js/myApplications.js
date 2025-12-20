import {
    auth,
    db,
    signOut,
    onAuthStateChanged,
    collection,
    getDocs
} from "./firebaseConfigure.js";

let currentUser = null;

onAuthStateChanged(auth, async(user) => {
    const currentUserName = document.getElementById("currentUserName");

    if (user) {
        currentUser = user;
        currentUserName.textContent = user.email;
        await loadApplications();
    } else {
        location.href = "loginPage.html";
        alert("Please login");
    }
});

async function loadApplications() {
    const loadingEl = document.getElementById('loading');
    const containerEl = document.getElementById('applications-container');

    try {

        const applicationsSnapshot = await getDocs(collection(db, "applications"));

        // Filter applications for jobs posted by current user
        const userApplications = [];
        applicationsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.jobPosterId === currentUser.uid) {
                userApplications.push({ id: doc.id, ...data });
            }
        });


        loadingEl.style.display = 'none';
        containerEl.style.display = 'block';

        if (userApplications.length === 0) {
            containerEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-inbox"></i></div>
                    <h3 class="empty-title">No Applications Yet</h3>
                    <p class="empty-description">You haven't received any applications for your job postings yet.</p>
                    <button class="btn btn-primary" onclick="location.href='home.html'">
                        <i class="fas fa-arrow-left"></i> Back to Jobs
                    </button>
                </div>
            `;
            return;
        }


        userApplications.sort((a, b) => b.appliedAt.toMillis() - a.appliedAt.toMillis());


        displayApplications(userApplications);

    } catch (error) {
        console.error("Error loading applications:", error);
        containerEl.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <span>Error loading applications: ${error.message}</span>
            </div>
        `;
        loadingEl.style.display = 'none';
        containerEl.style.display = 'block';
    }
}

function displayApplications(applications) {
    const container = document.getElementById('applications-container');
    container.innerHTML = '';

    // Group applications by job
    const groupedApps = {};
    applications.forEach(app => {
        if (!groupedApps[app.jobId]) {
            groupedApps[app.jobId] = {
                jobTitle: app.jobTitle,
                jobCompany: app.jobCompany,
                applications: []
            };
        }
        groupedApps[app.jobId].applications.push(app);
    });

    // Display grouped applications
    Object.keys(groupedApps).forEach(jobId => {
                const group = groupedApps[jobId];

                const jobSection = document.createElement('div');
                jobSection.style.marginBottom = '2rem';

                jobSection.innerHTML = `
            <h3 style="color: var(--secondary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--primary);">
                <i class="fas fa-briefcase"></i> ${group.jobTitle} - ${group.jobCompany}
                <span style="background: var(--primary); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem; margin-left: 1rem;">
                    ${group.applications.length} Application${group.applications.length !== 1 ? 's' : ''}
                </span>
            </h3>
        `;

                const appsGrid = document.createElement('div');
                appsGrid.style.display = 'grid';
                appsGrid.style.gap = '1rem';

                group.applications.forEach(app => {
                            const appCard = document.createElement('div');
                            appCard.className = 'card';
                            appCard.style.padding = '1.5rem';
                            appCard.style.marginBottom = '0';

                            const appliedDate = new Date(app.appliedAt.toDate()).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            appCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h4 style="color: var(--secondary); margin-bottom: 0.5rem;">
                            <i class="fas fa-user"></i> ${app.applicantName}
                        </h4>
                        <p style="color: var(--gray); font-size: 0.9rem; margin: 0;">
                            <i class="fas fa-clock"></i> Applied on ${appliedDate}
                        </p>
                    </div>
                    <span class="status-badge status-${app.status || 'pending'}">
                        ${app.status || 'Pending'}
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <p style="color: var(--gray); font-size: 0.85rem; margin-bottom: 0.3rem;">
                            <i class="fas fa-envelope"></i> Email
                        </p>
                        <p style="margin: 0; font-weight: 500;">
                            <a href="mailto:${app.applicantEmail}" style="color: var(--primary); text-decoration: none;">
                                ${app.applicantEmail}
                            </a>
                        </p>
                    </div>
                    <div>
                    <p style="color: var(--gray); font-size: 0.85rem; margin-bottom: 0.3rem;">
                        <i class="fas fa-phone"></i> Phone
                    </p>
                    <p style="margin: 0; font-weight: 500;">
                        <a href="tel:${app.applicantPhone}" style="color: var(--primary); text-decoration: none;">
                            ${app.applicantPhone}
                        </a>
                    </p>
                </div>
                </div>

                ${app.applicantCover && app.applicantCover !== 'Not provided' ? `
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="color: var(--gray); font-size: 0.85rem; margin-bottom: 0.5rem; font-weight: 600;">
                            <i class="fas fa-comment"></i> Cover Letter
                        </p>
                        <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${app.applicantCover}</p>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <a href="${app.applicantCV}" target="_blank" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-file-pdf"></i> View CV/Resume
                    </a>
                   
                </div>
            `;

            appsGrid.appendChild(appCard);
        });

        jobSection.appendChild(appsGrid);
        container.appendChild(jobSection);
    });
}


const logOutBtn = document.getElementById("logOut");
logOutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        location.href = "loginPage.html";
    } catch (error) {
        console.error(error.message);
        alert("Error logging out: " + error.message);
    }
});