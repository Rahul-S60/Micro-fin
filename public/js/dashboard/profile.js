/**
 * Profile Section Functions
 * Handles loading and updating customer profile information
 */

/**
 * Load customer profile data
 */
async function loadProfile() {
    try {
        const response = await fetch('/api/customers/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const profile = data.data;
            
            const fields = {
                'firstName': profile.firstName,
                'lastName': profile.lastName,
                'email': profile.email,
                'phone': profile.phone,
                'street': profile.address?.street,
                'city': profile.address?.city,
                'state': profile.address?.state,
                'pincode': profile.address?.pincode,
                'monthlyIncome': profile.monthlyIncome,
                'occupation': profile.occupation
            };
            
            Object.keys(fields).forEach(key => {
                const element = document.querySelector(`[name="${key}"]`);
                if (element) {
                    element.value = fields[key] || '';
                }
            });
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        if (typeof showNotification !== 'undefined') {
            showNotification('Failed to load profile', 'error', 'Load Error');
        }
    }
}

// ============================================
// INPUT VALIDATION FOR PROFILE FORM
// ============================================

// First Name - only letters
document.addEventListener('input', (e) => {
    if (e.target.name === 'firstName' && e.target.closest('#profileForm')) {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    }
});

// Last Name - only letters
document.addEventListener('input', (e) => {
    if (e.target.name === 'lastName' && e.target.closest('#profileForm')) {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    }
});

// Phone - only numbers, max 10 digits
document.addEventListener('input', (e) => {
    if (e.target.name === 'phone' && e.target.closest('#profileForm')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    }
});

// City - only letters
document.addEventListener('input', (e) => {
    if (e.target.name === 'city' && e.target.closest('#profileForm')) {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    }
});

// State - only letters
document.addEventListener('input', (e) => {
    if (e.target.name === 'state' && e.target.closest('#profileForm')) {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    }
});

// Pincode - only numbers, max 6 digits
document.addEventListener('input', (e) => {
    if (e.target.name === 'pincode' && e.target.closest('#profileForm')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    }
});

// Monthly Income - only numbers
document.addEventListener('input', (e) => {
    if (e.target.name === 'monthlyIncome' && e.target.closest('#profileForm')) {
        if (parseFloat(e.target.value) < 0) {
            e.target.value = 0;
        }
    }
});

// ============================================
// PROFILE FORM SUBMISSION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                phone: formData.get('phone'),
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode'),
                monthlyIncome: parseFloat(formData.get('monthlyIncome')),
                occupation: formData.get('occupation')
            };

            // Basic validation
            const errorEl = document.getElementById('profileError');
            if (!data.firstName || !data.lastName) {
                if (errorEl) errorEl.textContent = 'First and last name are required';
                return;
            }

            if (!data.phone || data.phone.length !== 10) {
                if (errorEl) errorEl.textContent = 'Phone number must be 10 digits';
                return;
            }

            if (!data.pincode || data.pincode.length !== 6) {
                if (errorEl) errorEl.textContent = 'Pincode must be 6 digits';
                return;
            }

            if (isNaN(data.monthlyIncome) || data.monthlyIncome < 0) {
                if (errorEl) errorEl.textContent = 'Monthly income must be a valid positive number';
                return;
            }

            try {
                const response = await fetch('/api/customers/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    if (errorEl) errorEl.textContent = '';
                    
                    const successEl = document.getElementById('profileSuccess');
                    if (successEl) {
                        successEl.classList.remove('hidden');
                    }
                    
                    // Update stored user data
                    localStorage.setItem('user', JSON.stringify(result.data));
                    const userNameEl = document.getElementById('userName');
                    if (userNameEl) {
                        userNameEl.textContent = result.data.firstName + ' ' + result.data.lastName;
                    }
                    
                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        if (successEl) {
                            successEl.classList.add('hidden');
                        }
                    }, 3000);
                    
                    if (typeof showNotification !== 'undefined') {
                        showNotification('Profile updated successfully', 'success', 'Profile Updated');
                    }
                } else {
                    if (errorEl) errorEl.textContent = result.message;
                    
                    if (typeof showNotification !== 'undefined') {
                        showNotification(result.message || 'Failed to update profile', 'error', 'Update Failed');
                    }
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                if (errorEl) errorEl.textContent = 'Failed to update profile. Please try again.';
                
                if (typeof showNotification !== 'undefined') {
                    showNotification('Network error. Please try again.', 'error', 'Error');
                }
            }
        });
    }
});

// Load My Loans section
async function loadMyLoans() {
    try {
        const response = await fetch('/api/customers/loans', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            const statusColors = {
                pending: { color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: 'fa-hourglass-half' },
                under_review: { color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: 'fa-magnifying-glass' },
                approved: { color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800', icon: 'fa-check-circle' },
                rejected: { color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-800', icon: 'fa-times-circle' },
                active: { color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-800', icon: 'fa-play-circle' },
                closed: { color: 'bg-slate-50 border-slate-200', badge: 'bg-slate-100 text-slate-800', icon: 'fa-ban' }
            };

            const html = `
                <div class="grid grid-cols-1 gap-4">
                    ${data.data.map(loan => {
                        const status = loan.status || 'pending';
                        const statusConfig = statusColors[status] || statusColors.pending;
                        const appDate = new Date(loan.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        });
                        return `
                            <div class="border ${statusConfig.color} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex-1">
                                        <h3 class="text-lg font-bold text-slate-900">${loan.loanId?.name || 'Loan Application'}</h3>
                                        <p class="text-sm text-slate-500">
                                            <i class="fas fa-chart-line mr-1"></i>
                                            ${loan.loanId?.category ? loan.loanId.category.charAt(0).toUpperCase() + loan.loanId.category.slice(1) : 'Loan'}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <span class="${statusConfig.badge} px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                                            <i class="fas ${statusConfig.icon}"></i>
                                            ${status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-200">
                                    <div>
                                        <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Loan Amount</p>
                                        <p class="font-bold text-slate-900 text-lg">₹${loan.loanAmount ? loan.loanAmount.toLocaleString('en-IN') : '0'}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Tenure</p>
                                        <p class="font-bold text-slate-900 text-lg">${loan.tenureMonths || 0} <span class="text-sm">months</span></p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Interest Rate</p>
                                        <p class="font-bold text-slate-900 text-lg">${loan.interestRate || 0}% <span class="text-sm">p.a.</span></p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Monthly EMI</p>
                                        <p class="font-bold text-slate-900 text-lg">₹${loan.monthlyEMI ? loan.monthlyEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p class="text-slate-500">Applied On</p>
                                        <p class="font-semibold text-slate-900">${appDate}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Purpose</p>
                                        <p class="font-semibold text-slate-900">${loan.purpose || '-'}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Application #</p>
                                        <p class="font-semibold text-slate-900">${loan.applicationNumber || '-'}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Total Amount</p>
                                        <p class="font-semibold text-slate-900">₹${loan.totalAmount ? loan.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            const container = document.getElementById('myLoansContainer');
            if (container) container.innerHTML = html;
        } else {
            const container = document.getElementById('myLoansContainer');
            if (container) {
                container.innerHTML = `
                    <div class="card-ghost text-center py-12">
                        <i class="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
                        <p class="text-gray-600 mb-2 text-lg font-semibold">No Loans Yet</p>
                        <p class="text-gray-500 mb-6">You haven't applied for any loans yet. Start your first loan application today!</p>
                        <button onclick="showSection('apply-loan')" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                            <i class="fas fa-plus"></i> Apply for Loan
                        </button>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading loans:', error);
        const container = document.getElementById('myLoansContainer');
        if (container) {
            container.innerHTML = `
                <div class="card-ghost text-center py-8">
                    <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                    <p class="text-red-600 font-semibold">Failed to load your loans</p>
                    <p class="text-gray-600 text-sm mt-2">Please try refreshing the page or contact support.</p>
                </div>
            `;
        }
        
        if (typeof showNotification !== 'undefined') {
            showNotification('Failed to load your loans', 'error', 'Load Error');
        }
    }
}
