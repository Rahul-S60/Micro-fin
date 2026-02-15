/**
 * Admin Dashboard - Common Module
 * Handles authentication, navigation, and shared utilities
 */

let token = localStorage.getItem('adminToken');
let admin = JSON.parse(localStorage.getItem('admin') || '{}');

// ============================================
// AUTHENTICATION & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is logged in
    if (!token) {
        window.location.href = '/admin/login';
        return;
    }

    // Set admin info
    const adminNameEl = document.getElementById('adminName');
    const adminRoleEl = document.getElementById('adminRole');
    
    if (adminNameEl) adminNameEl.textContent = `${admin.firstName} ${admin.lastName}`;
    if (adminRoleEl) adminRoleEl.textContent = admin.role.replace('_', ' ').toUpperCase();

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Setup event delegation for modal and application actions
    setupEventDelegation();

    // Setup mobile menu
    setupMobileMenu();

    // Load initial data
    loadDashboardData();
});

// ============================================
// EVENT DELEGATION SETUP
// ============================================

function setupEventDelegation() {
    // Direct event listener for bell icon
    const bellBtn = document.querySelector('[data-action="toggle-notifications"]');
    if (bellBtn) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('notificationsDropdown');
            if (dropdown) {
                dropdown.classList.toggle('hidden');
                if (!dropdown.classList.contains('hidden')) {
                    loadNotifications();
                }
            }
        });
    }

    // Modal actions
    document.addEventListener('click', (e) => {
        // Toggle notifications dropdown (fallback for dynamically loaded content)
        if (e.target.closest('[data-action="toggle-notifications"]')) {
            e.stopPropagation();
            const dropdown = document.getElementById('notificationsDropdown');
            if (dropdown) {
                dropdown.classList.toggle('hidden');
                if (!dropdown.classList.contains('hidden')) {
                    loadNotifications();
                }
            }
        }
        
        // Close modal
        if (e.target.closest('[data-action="close-modal"]')) {
            closeApplicationModal();
        }
        
        // View application
        if (e.target.closest('[data-action="view-application"]')) {
            const appId = e.target.closest('[data-action="view-application"]').dataset.appId;
            viewApplication(appId);
        }
        
        // Update application status
        if (e.target.closest('[data-action="update-status"]')) {
            const status = e.target.closest('[data-action="update-status"]').dataset.status;
            updateApplicationStatus(status);
        }
        
        // Reject application
        if (e.target.closest('[data-action="reject-application"]')) {
            rejectApplication();
        }

        // Refresh applications list
        if (e.target.closest('[data-action="refresh-applications"]')) {
            loadApplications();
        }
    });

    // Close notification dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.relative')) {
            const dropdown = document.getElementById('notificationsDropdown');
            if (dropdown) dropdown.classList.add('hidden');
        }
    });

    // Status filter
    const statusFilter = document.getElementById('applicationStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadApplications();
        });
    }
}

// ============================================
// LOGOUT HANDLER
// ============================================

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/admin/login';
    }
}

// ============================================
// NAVIGATION & SECTION SWITCHING
// ============================================

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.classList.add('hidden'));

    // Show selected section
    const selectedSection = document.getElementById(`section-${sectionName}`);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        loadSectionData(sectionName);
    }

    // Update sidebar active state
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Close mobile menu
    const mobileMenu = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'applications':
            loadApplications();
            break;
        default:
            break;
    }
}

// ============================================
// MOBILE MENU
// ============================================

function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar?.classList.toggle('active');
            overlay?.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar?.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Setup sidebar navigation
    const navLinks = document.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.getAttribute('data-section');
            showSection(sectionName);
        });
    });
}

// ============================================
// API HELPER FUNCTIONS
// ============================================

async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const finalOptions = { ...defaultOptions, ...options };
    if (finalOptions.body && typeof finalOptions.body === 'object') {
        finalOptions.body = JSON.stringify(finalOptions.body);
    }

    try {
        const response = await fetch(endpoint, finalOptions);
        const data = await response.json();
        
        if (!response.ok && response.status === 401) {
            // Token expired
            handleLogout();
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// ============================================
// DASHBOARD DATA LOADING
// ============================================

async function loadDashboardData() {
    try {
        const response = await apiCall('/api/admin/dashboard');
        
        if (response?.success && response.data) {
            const data = response.data;
            const stats = data.statistics || {};
            const customerStats = stats.customers || {};
            const loanStats = stats.loans || {};
            
            // Update stats cards
            document.getElementById('totalCustomers').textContent = customerStats.total || 0;
            document.getElementById('pendingApplications').textContent = loanStats.pending || 0;
            document.getElementById('activeLoans').textContent = loanStats.active || 0;
            document.getElementById('disbursedAmount').textContent = `₹${(loanStats.disbursedAmount || 0).toLocaleString('en-IN')}`;
            
            // Update overview cards
            document.getElementById('verifiedCustomers').textContent = customerStats.verified || 0;
            document.getElementById('kycPendingCount').textContent = customerStats.kycPending || 0;
            document.getElementById('approvedCount').textContent = loanStats.approved || 0;
            const rejectedCount = (loanStats.totalApplications || 0) - (loanStats.pending || 0) - (loanStats.approved || 0) - (loanStats.active || 0);
            document.getElementById('rejectedCount').textContent = Math.max(0, rejectedCount);
            
            // Load applications
            if (data.recentApplications) {
                populateApplicationsTable(data.recentApplications);
            } else {
                loadApplications();
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ============================================
// APPLICATIONS LOADING
// ============================================

async function loadApplications() {
    try {
        const response = await apiCall('/api/admin/applications');
        
        if (response?.success && response.data) {
            populateApplicationsTable(response.data);
        }
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

// ============================================
// NOTIFICATIONS LOADING
// ============================================

async function loadNotifications() {
    try {
        const response = await apiCall('/api/admin/dashboard');
        
        if (response?.success && response.data) {
            const recentApplications = response.data.recentApplications || [];
            const stats = response.data.statistics || {};
            const loanStats = stats.loans || {};
            
            let notifications = [];
            
            // Add pending applications notification
            if (loanStats.pending > 0) {
                notifications.push({
                    id: 'pending-apps',
                    type: 'pending',
                    icon: 'fa-hourglass-half',
                    title: 'Pending Applications',
                    message: `${loanStats.pending} application(s) awaiting review`,
                    timestamp: new Date(),
                    actionText: 'Review Now'
                });
            }
            
            // Add pending KYC notification
            if (stats.customers?.kycPending > 0) {
                notifications.push({
                    id: 'pending-kyc',
                    type: 'info',
                    icon: 'fa-id-card',
                    title: 'KYC Verification Pending',
                    message: `${stats.customers.kycPending} customer(s) waiting for KYC approval`,
                    timestamp: new Date(),
                    actionText: 'Review KYC'
                });
            }
            
            // Add recent application notifications
            recentApplications.slice(0, 3).forEach(app => {
                const customerName = app.customerId?.firstName || 'Customer';
                notifications.push({
                    id: app._id,
                    type: app.status === 'rejected' ? 'error' : app.status === 'approved' ? 'success' : 'info',
                    icon: app.status === 'rejected' ? 'fa-times-circle' : app.status === 'approved' ? 'fa-check-circle' : 'fa-file-alt',
                    title: `Application from ${customerName}`,
                    message: `₹${(app.loanAmount || 0).toLocaleString('en-IN')} - ${app.status.toUpperCase()}`,
                    timestamp: new Date(app.createdAt),
                    actionText: 'View',
                    appId: app._id
                });
            });
            
            // Update badge count
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.textContent = notifications.length;
            }
            
            renderNotifications(notifications);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function renderNotifications(notifications) {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <p>No new notifications</p>
            </div>
        `;
        return;
    }
    
    const typeColors = {
        'pending': 'text-yellow-600',
        'info': 'text-blue-600',
        'success': 'text-green-600',
        'error': 'text-red-600'
    };
    
    notificationsList.innerHTML = notifications.map(notif => `
        <div class="p-4 hover:bg-gray-50 transition cursor-pointer notification-item" ${notif.appId ? `data-app-id="${notif.appId}"` : ''}>
            <div class="flex gap-3">
                <i class="fas ${notif.icon} ${typeColors[notif.type] || 'text-gray-600'} text-lg mt-1 flex-shrink-0"></i>
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 text-sm">${notif.title}</h4>
                    <p class="text-gray-600 text-xs mt-1">${notif.message}</p>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-gray-400 text-xs">${formatTimeAgo(notif.timestamp)}</span>
                        <button class="notification-action-btn text-blue-600 hover:text-blue-800 text-xs font-semibold" ${notif.appId ? `data-action-id="${notif.appId}"` : ''}>
                            ${notif.actionText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event delegation for notification actions
    const notificationsList_elem = document.getElementById('notificationsList');
    notificationsList_elem.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('.notification-action-btn');
        if (actionBtn && actionBtn.dataset.actionId) {
            closeNotificationDropdown();
            viewApplication(actionBtn.dataset.actionId);
        }
    });
}

function closeNotificationDropdown() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) dropdown.classList.add('hidden');
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN');
}

function populateApplicationsTable(applications) {
    const tbody = document.getElementById('applicationsTable');
    if (!tbody) return;

    if (!applications || applications.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-gray-600 py-8">
                    <i class="fas fa-inbox text-3xl text-gray-300 mb-2 block"></i>
                    No applications found
                </td>
            </tr>
        `;
        return;
    }

    const statusBadgeClass = (status) => {
        const classes = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'under_review': 'bg-blue-100 text-blue-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    tbody.innerHTML = applications.map(app => `
        <tr>
            <td><span class="font-mono text-sm">${app.applicationNumber || 'N/A'}</span></td>
            <td>${app.customerId?.firstName || 'N/A'} ${app.customerId?.lastName || ''}</td>
            <td>₹${(app.loanAmount || 0).toLocaleString('en-IN')}</td>
            <td>
                <span class="px-2 py-1 rounded-full text-sm font-semibold ${statusBadgeClass(app.status)}">
                    ${app.status.replace('_', ' ').toUpperCase()}
                </span>
            </td>
            <td>${new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
            <td>
                <button data-action="view-application" data-app-id="${app._id}" class="text-blue-600 hover:text-blue-800 font-semibold">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// VIEW APPLICATION DETAILS
// ============================================

let currentApplicationId = null;

async function viewApplication(applicationId) {
    try {
        currentApplicationId = applicationId;
        const response = await apiCall(`/api/admin/applications/${applicationId}`);
        
        if (response?.success && response.data) {
            const app = response.data;
            populateApplicationModal(app);
            
            // Show modal
            const modal = document.getElementById('applicationDetailModal');
            if (modal) {
                modal.classList.remove('hidden');
                // Prevent body scroll when modal is open
                document.body.style.overflow = 'hidden';
            }
        }
    } catch (error) {
        console.error('Error loading application details:', error);
        alert('Failed to load application details');
    }
}

function populateApplicationModal(app) {
    // Set basic info
    document.getElementById('detailAppId').textContent = app.applicationNumber || 'N/A';
    document.getElementById('detailDate').textContent = formatDate(app.createdAt);
    
    // Set status with color
    const statusEl = document.getElementById('detailStatus');
    const statusColor = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'under_review': 'bg-blue-100 text-blue-800',
        'approved': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    statusEl.textContent = app.status.replace('_', ' ').toUpperCase();
    statusEl.className = `inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColor[app.status] || 'bg-gray-100 text-gray-800'}`;

    // Customer Information
    const customer = app.customerId || {};
    document.getElementById('detailCustomerName').textContent = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A';
    document.getElementById('detailCustomerEmail').textContent = customer.email || 'N/A';
    document.getElementById('detailCustomerPhone').textContent = customer.phone || 'N/A';
    
    // KYC Status
    const kycEl = document.getElementById('detailKYCStatus').querySelector('span');
    const kycStatus = customer.kycStatus || 'pending';
    const kycColor = kycStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    kycEl.className = `px-3 py-1 rounded-full text-sm font-semibold ${kycColor}`;
    kycEl.textContent = kycStatus.toUpperCase();

    // Loan Details
    const loan = app.loanId || {};
    document.getElementById('detailLoanProduct').textContent = loan.name || 'N/A';
    document.getElementById('detailLoanCategory').textContent = loan.category || 'N/A';
    document.getElementById('detailLoanAmount').textContent = `₹${(app.loanAmount || 0).toLocaleString('en-IN')}`;
    document.getElementById('detailTenure').textContent = `${app.tenureMonths || 0} months`;
    document.getElementById('detailPurpose').textContent = app.purpose || 'N/A';
    document.getElementById('detailInterestRate').textContent = `${app.interestRate || 0}%`;

    // Financial Calculations
    document.getElementById('detailEMI').textContent = `₹${(app.monthlyEMI || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    document.getElementById('detailTotalInterest').textContent = `₹${(app.totalInterest || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    document.getElementById('detailTotalAmount').textContent = `₹${(app.totalAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    document.getElementById('detailTotalEMIs').textContent = app.totalEMIs || app.tenureMonths || 0;

    // Documents
    populateDocumentsSection(app.documents || []);

    // Clear remarks and set admin buttons based on status
    document.getElementById('adminRemarks').value = app.remarks || '';
    setupAdminActionButtons(app.status);
}

function populateDocumentsSection(documents) {
    const container = document.getElementById('detailDocuments');
    
    if (!documents || documents.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-center py-6">No documents uploaded</div>';
        return;
    }

    container.innerHTML = documents.map(doc => {
        const verificationStatus = doc.verification?.status || 'pending';
        const verificationColor = {
            'pending': 'bg-yellow-50 border-yellow-200',
            'verified': 'bg-green-50 border-green-200',
            'rejected': 'bg-red-50 border-red-200'
        };
        const statusBadgeColor = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'verified': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        
        const rawUrl = typeof doc.url === 'string' ? doc.url.trim() : '';
        const normalizedUrl = rawUrl.startsWith('uploads/') ? `/${rawUrl}` : rawUrl;
        const hasValidUrl = normalizedUrl && normalizedUrl !== 'null' && normalizedUrl !== 'undefined';

        const downloadMarkup = hasValidUrl
            ? `
                <a href="${normalizedUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2 mt-2">
                    <i class="fas fa-download"></i> Download Document
                </a>
            `
            : `
                <span class="text-gray-400 text-sm font-semibold flex items-center gap-2 mt-2">
                    <i class="fas fa-ban"></i> Document not available
                </span>
            `;

        return `
            <div class="border-2 ${verificationColor[verificationStatus]} p-4 rounded-lg">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-file text-indigo-600 text-xl"></i>
                        <div>
                            <div class="font-semibold text-slate-900">${doc.name || 'Document'}</div>
                            <div class="text-xs text-gray-500">${doc.value || 'No type specified'}</div>
                        </div>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeColor[verificationStatus]}">
                        ${verificationStatus.toUpperCase()}
                    </span>
                </div>
                <div class="text-xs text-gray-600 mb-2">
                    Uploaded: ${formatDate(doc.uploadDate)}
                </div>
                ${doc.verification?.remarks ? `<div class="text-sm text-gray-700 bg-white/50 p-2 rounded mb-2">
                    <strong>Verification Note:</strong> ${doc.verification.remarks}
                </div>` : ''}
                ${downloadMarkup}
            </div>
        `;
    }).join('');
}

function setupAdminActionButtons(currentStatus) {
    const container = document.getElementById('statusActionButtons');
    
    // Hide all buttons first
    container.innerHTML = '';
    
    // Based on current status, show appropriate actions
    if (currentStatus === 'pending' || currentStatus === 'under_review') {
        container.innerHTML = `
            <button data-action="update-status" data-status="under_review" class="btn btn-secondary flex items-center justify-center gap-2">
                <i class="fas fa-hourglass-half"></i> Mark Under Review
            </button>
            <button data-action="update-status" data-status="approved" class="btn btn-success flex items-center justify-center gap-2">
                <i class="fas fa-check"></i> Approve
            </button>
            <button data-action="reject-application" class="btn btn-danger flex items-center justify-center gap-2">
                <i class="fas fa-times"></i> Reject
            </button>
        `;
    } else if (currentStatus === 'approved') {
        container.innerHTML = `
            <div class="col-span-3 text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <i class="fas fa-check-circle text-green-600 text-2xl mb-2 block"></i>
                <p class="text-green-800 font-semibold">Application already approved</p>
                <p class="text-sm text-green-700">Awaiting customer's loan activation</p>
            </div>
        `;
    } else if (currentStatus === 'rejected') {
        container.innerHTML = `
            <div class="col-span-3 text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <i class="fas fa-ban text-red-600 text-2xl mb-2 block"></i>
                <p class="text-red-800 font-semibold">Application has been rejected</p>
                <p class="text-sm text-red-700">No further actions can be taken</p>
            </div>
        `;
    }
}

function closeApplicationModal() {
    const modal = document.getElementById('applicationDetailModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    // Ensure main content is visible and styled
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.style.visibility = 'visible';
        contentArea.style.opacity = '1';
    }
    
    currentApplicationId = null;
}

async function updateApplicationStatus(newStatus) {
    if (!currentApplicationId) {
        alert('Error: Application not found');
        return;
    }

    const remarks = document.getElementById('adminRemarks').value;
    
    if (!confirm(`Are you sure you want to ${newStatus.replace('_', ' ')} this application?`)) {
        return;
    }

    try {
        const response = await apiCall(`/api/admin/applications/${currentApplicationId}`, {
            method: 'PUT',
            body: {
                status: newStatus,
                remarks: remarks
            }
        });

        if (response?.success) {
            alert(`Application ${newStatus.replace('_', ' ')} successfully!`);
            closeApplicationModal();
            loadApplications(); // Reload applications table
        } else {
            alert(response?.message || 'Failed to update application status');
        }
    } catch (error) {
        console.error('Error updating application:', error);
        alert('Failed to update application status');
    }
}

async function rejectApplication() {
    const remarks = document.getElementById('adminRemarks').value;
    
    if (!remarks.trim()) {
        alert('Please provide a reason for rejection');
        return;
    }

    if (!confirm('Are you sure you want to reject this application? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await apiCall(`/api/admin/applications/${currentApplicationId}`, {
            method: 'PUT',
            body: {
                status: 'rejected',
                rejectionReason: remarks,
                remarks: remarks
            }
        });

        if (response?.success) {
            alert('Application rejected successfully!');
            closeApplicationModal();
            loadApplications(); // Reload applications table
        } else {
            alert(response?.message || 'Failed to reject application');
        }
    } catch (error) {
        console.error('Error rejecting application:', error);
        alert('Failed to reject application');
    }
}

// ============================================
// GLOBAL UTILITIES
// ============================================

function formatCurrency(amount) {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatStatus(status) {
    return status.replace('_', ' ').toUpperCase();
}


