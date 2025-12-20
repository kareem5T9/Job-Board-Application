import {
    auth,
    db,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs
} from "./firebaseConfigure.js";

// Get job ID from URL
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('id');

let currentJob = null;


onAuthStateChanged(auth, (user) => {
    if (user) {

        document.getElementById('applicant-email').value = user.email;
    }
});

// Load job details
async function loadJobDetails() {
    if (!jobId) {
        showJobNotFound();
        return;
    }

    try {
        const jobsRef = collection(db, "jobs");
        const querySnapshot = await getDocs(jobsRef);

        let jobFound = false;

        querySnapshot.forEach((doc) => {
            if (doc.id === jobId) {
                currentJob = { id: doc.id, ...doc.data() };
                displayJobDetails(currentJob);
                jobFound = true;
            }
        });

        if (!jobFound) {
            showJobNotFound();
        }
    } catch (error) {
        console.error("Error loading job:", error);
        showJobNotFound();
    }
}

function displayJobDetails(job) {

    document.getElementById('loading').style.display = 'none';
    document.getElementById('job-details-content').style.display = 'block';


    document.getElementById('job-title').textContent = job.title;
    document.getElementById('job-company').textContent = job.company;
    document.getElementById('job-location').textContent = job.location;
    document.getElementById('job-type').innerHTML = `<i class="fas fa-clock"></i> ${formatJobType(job.type)}`;
    document.getElementById('job-category').innerHTML = `<i class="fas fa-tag"></i> ${formatCategory(job.category)}`;



    document.getElementById('job-experience').textContent = formatExperience(job.experience);
    document.getElementById('job-education').textContent = formatEducation(job.education);
    document.getElementById('job-deadline').textContent = formatDate(job.deadline);


    document.getElementById('job-description').innerHTML = `<p>${job.description.replace(/\n/g, '</p><p>')}</p>`;


    const requirementsList = document.getElementById('job-requirements');
    requirementsList.innerHTML = '';
    job.requirements.forEach(req => {
        const li = document.createElement('li');
        li.textContent = req;
        requirementsList.appendChild(li);
    });




    document.getElementById('contact-email').textContent = job.contact;


    document.title = `${job.title} - ${job.company}`;
}

function showJobNotFound() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('job-not-found').style.display = 'block';
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
        'senior': 'Senior',
        'executive': 'Executive'
    };
    return levels[experience] || experience;
}

function formatEducation(education) {
    const levels = {
        'high-school': 'High School',
        'associate': 'Associate',
        'bachelor': 'Bachelor',
        'master': 'Master',
        'phd': 'PhD',
        'none': 'Not Required'
    };
    return levels[education] || education;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Handle application submission
const applyForm = document.getElementById('apply-form');
applyForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const successEl = document.getElementById('apply-success');
    const errorEl = document.getElementById('apply-error');
    const successText = successEl.querySelector('span');
    const errorText = errorEl.querySelector('span');


    successEl.classList.add('hidden');
    errorEl.classList.add('hidden');


    const applicantName = document.getElementById('applicant-name').value.trim();
    const applicantEmail = document.getElementById('applicant-email').value.trim();
    const applicantPhone = document.getElementById('applicant-phone').value.trim();
    const applicantCV = document.getElementById('applicant-cv').value.trim();


    if (!applicantName || !applicantEmail || !applicantPhone || !applicantCV) {
        errorEl.classList.remove('hidden');
        errorText.textContent = 'Please fill in all required fields.';
        window.scrollTo({ top: document.querySelector('.apply-section').offsetTop - 100, behavior: 'smooth' });
        return;
    }


    const deadline = new Date(currentJob.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadline < today) {
        errorEl.classList.remove('hidden');
        errorText.textContent = 'Sorry, the application deadline for this job has passed.';
        window.scrollTo({ top: document.querySelector('.apply-section').offsetTop - 100, behavior: 'smooth' });
        return;
    }

    try {
        // Disable submit button
        const submitBtn = applyForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';


        await addDoc(collection(db, "applications"), {
            jobId: jobId,
            jobTitle: currentJob.title,
            jobCompany: currentJob.company,
            jobPosterId: currentJob.postedById,
            jobPosterEmail: currentJob.postedBy,
            jobContact: currentJob.contact,
            applicantName: applicantName,
            applicantEmail: applicantEmail,
            applicantPhone: applicantPhone,
            applicantCV: applicantCV,
            appliedAt: new Date(),
            status: 'pending'
        });


        successEl.classList.remove('hidden');
        successText.innerHTML = `
            <strong>Application submitted successfully!</strong><br>
            You will receive a confirmation email at ${applicantEmail}.<br>
            The employer will contact you directly if you're selected.
        `;
        window.scrollTo({ top: document.querySelector('.apply-section').offsetTop - 100, behavior: 'smooth' });


        applyForm.reset();

        // Keep email if user is logged in
        if (auth.currentUser) {
            document.getElementById('applicant-email').value = auth.currentUser.email;
        }

        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';

    } catch (error) {
        console.error("Error submitting application:", error);
        errorEl.classList.remove('hidden');
        errorText.textContent = 'Error submitting application: ' + error.message;
        window.scrollTo({ top: document.querySelector('.apply-section').offsetTop - 100, behavior: 'smooth' });

        // Re-enable button
        const submitBtn = applyForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';
    }
});



// Load job details on page load
loadJobDetails();