/**
 * Common Dashboard Functions
 * Navigation, section management, and shared utilities
 */

// Get authentication tokens
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Check authentication
if (!token) {
    window.location.href = '/customer/login';
}

// Set user name in header
document.addEventListener('DOMContentLoaded', () => {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = (user.firstName || '') + ' ' + (user.lastName || '');
    }
});

/**
 * Show a specific section and hide others
 * @param {string} sectionName - Name of section to show
 */
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Close mobile menu if open
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');

    // Load section-specific data
    loadSectionData(sectionName);
}

/**
 * Load section-specific data
 * @param {string} sectionName - Section to load
 */
function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            if (typeof loadDashboard === 'function') loadDashboard();
            if (typeof loadLoans === 'function') loadLoans();
            break;
        case 'my-loans':
            if (typeof loadMyLoans === 'function') loadMyLoans();
            break;
        case 'apply-loan':
            if (typeof loadApplyLoan === 'function') loadApplyLoan();
            break;
        case 'kyc':
            if (typeof loadKYCStatus === 'function') loadKYCStatus();
            break;
        case 'profile':
            if (typeof loadProfile === 'function') loadProfile();
            break;
    }
}

// Nav link click handlers
document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-link')) {
        e.preventDefault();
        const section = e.target.closest('.nav-link').getAttribute('data-section');
        if (section) showSection(section);
    }
});

// Quick action buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-action]')) {
        const action = e.target.closest('[data-action]').getAttribute('data-action');
        if (action) showSection(action);
    }
});

// Logout
document.addEventListener('click', (e) => {
    if (e.target.closest('#logoutBtn')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/customer/login';
    }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    }

    // Initial load
    loadDashboard();
    loadLoans();
});
