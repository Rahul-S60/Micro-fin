/**
 * Apply for Loan Section Functions
 * Handles loan application form, validation, and submission
 */

let selectedLoan = null;

/**
 * Load available loan products for the apply section
 */
async function loadApplyLoan() {
    try {
        const response = await fetch('/api/loans');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const microLoans = data.data.filter(l => (l.name || '').toLowerCase().includes('micro loan'));
            window.availableLoans = microLoans.length > 0 ? microLoans : data.data;
            const html = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${window.availableLoans.map(loan => `
                        <div class="card-ghost hover:shadow-xl transition-all">
                            <div class="mb-4">
                                <h3 class="text-xl font-bold mb-2">${loan.name}</h3>
                                <span class="badge badge-primary">${loan.category}</span>
                            </div>
                            <p class="text-sm text-gray-600 mb-4">${loan.description || 'Apply for this loan product'}</p>
                            <div class="space-y-2 mb-6">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Interest Rate</span>
                                    <span class="font-bold text-indigo-600">${loan.annualInterestRate}% p.a.</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Amount Range</span>
                                    <span class="font-bold">₹${(loan.minAmount/1000)}K - ₹${(loan.maxAmount/100000)}L</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Tenure</span>
                                    <span class="font-bold">${loan.minTenureMonths}-${loan.maxTenureMonths} months</span>
                                </div>
                                <div class="text-xs text-gray-700">
                                    <span class="font-semibold">Eligibility:</span>
                                    <span>Min income ₹${(loan.minMonthlyIncome || 0).toLocaleString()} • Age ${loan.minAge || 0}-${loan.maxAge || 0} • Credit score ${loan.requiredCreditScore && loan.requiredCreditScore > 0 ? '≥ ' + loan.requiredCreditScore : 'not required'}</span>
                                </div>
                                ${(loan.requirements && loan.requirements.length) ? `
                                <ul class="mt-2 text-xs text-gray-600 list-disc pl-5">
                                    ${loan.requirements.slice(0,3).map(req => `<li>${req}</li>`).join('')}
                                </ul>
                                ` : ''}
                            </div>
                            <button class="btn btn-primary w-full apply-for-loan-btn" data-loan-id="${loan._id}">
                                <i class="fas fa-paper-plane"></i> Apply for This Loan
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            const container = document.getElementById('applyLoanContainer');
            if (container) container.innerHTML = html;
        } else {
            const container = document.getElementById('applyLoanContainer');
            if (container) container.innerHTML = '<p class="text-gray-600">No loan products available at the moment</p>';
        }
    } catch (error) {
        console.error('Error loading loan products:', error);
        const container = document.getElementById('applyLoanContainer');
        if (container) container.innerHTML = '<p class="text-red-600">Failed to load loan products</p>';
    }
}

/**
 * Start a loan application from loan ID
 */
async function startLoanApplicationFromId(id) {
    console.log('Apply button clicked for loan ID:', id);
    
    if (!window.availableLoans) {
        console.error('No available loans loaded yet');
        if (typeof showNotification !== 'undefined') {
            showNotification('Please wait while loan products are loading...', 'warning', 'Loading');
        }
        await loadApplyLoan();
        
        if (!window.availableLoans) {
            console.error('Still no loans after loading');
            if (typeof showNotification !== 'undefined') {
                showNotification('Failed to load loan products', 'error', 'Error');
            }
            return;
        }
    }
    
    const loan = window.availableLoans.find(l => l._id === id);
    if (!loan) {
        console.error('Loan not found:', id);
        if (typeof showNotification !== 'undefined') {
            showNotification('Loan product not found', 'error', 'Error');
        }
        return;
    }
    
    selectedLoan = loan;
    console.log('Starting loan application for:', loan.name);
    
    const formWrap = document.getElementById('applyLoanFormContainer');
    if (!formWrap) {
        console.error('Form container not found');
        return;
    }
    
    // Populate form fields
    const selectedLoanNameEl = document.getElementById('selectedLoanName');
    const selectedLoanMetaEl = document.getElementById('selectedLoanMeta');
    const applyAmountEl = document.getElementById('applyAmount');
    const amountHintEl = document.getElementById('amountHint');
    const applyTenureEl = document.getElementById('applyTenure');
    const tenureHintEl = document.getElementById('tenureHint');
    const applyPurposeEl = document.getElementById('applyPurpose');
    const applyErrorEl = document.getElementById('applyError');
    
    if (selectedLoanNameEl) selectedLoanNameEl.value = `${loan.name}`;
    if (selectedLoanMetaEl) selectedLoanMetaEl.textContent = `${loan.category} • ${loan.annualInterestRate}% p.a.`;
    
    if (applyAmountEl) {
        applyAmountEl.min = loan.minAmount;
        applyAmountEl.max = loan.maxAmount;
        applyAmountEl.value = loan.minAmount;
    }
    if (amountHintEl) amountHintEl.textContent = `Allowed range: ₹${loan.minAmount.toLocaleString()} - ₹${loan.maxAmount.toLocaleString()}`;
    
    if (applyTenureEl) {
        applyTenureEl.min = loan.minTenureMonths;
        applyTenureEl.max = loan.maxTenureMonths;
        applyTenureEl.value = loan.minTenureMonths;
    }
    if (tenureHintEl) tenureHintEl.textContent = `Allowed range: ${loan.minTenureMonths}-${loan.maxTenureMonths} months`;
    
    if (applyPurposeEl) applyPurposeEl.value = loan.name || '';
    if (applyErrorEl) applyErrorEl.textContent = '';
    
    // Render additional requirement inputs
    const reqWrap = document.getElementById('additionalRequirements');
    if (reqWrap) {
        reqWrap.innerHTML = '';
        
        if (loan.requirements && loan.requirements.length) {
            const items = loan.requirements.map(r => r.toLowerCase());
            reqWrap.innerHTML += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
            
            // Aadhar number + file
            if (items.some(x => x.includes('aadhar'))) {
                reqWrap.innerHTML += `
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Aadhar Number</label>
                        <input type="text" name="aadharNumber" id="aadharNumber" class="form-control" pattern="[0-9]{12}" maxlength="12" placeholder="Enter 12-digit Aadhar">
                        <p class="text-xs text-gray-500 mt-1">Or upload Aadhar document</p>
                        <input type="file" name="aadharFile" id="aadharFile" class="mt-2" accept=".pdf,image/*">
                    </div>
                `;
            }

            // PAN number + file
            if (items.some(x => x.includes('pan'))) {
                reqWrap.innerHTML += `
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">PAN Number</label>
                        <input type="text" name="panNumber" id="panNumber" class="form-control" maxlength="10" placeholder="Enter PAN (ABCDE1234F)">
                        <p class="text-xs text-gray-500 mt-1">Or upload PAN document</p>
                        <input type="file" name="panFile" id="panFile" class="mt-2" accept=".pdf,image/*">
                    </div>
                `;
            }

            reqWrap.innerHTML += `</div>`;

            // Generic other documents
            const otherReqs = loan.requirements.filter(r => !/aadhar|pan/i.test(r));
            if (otherReqs.length) {
                reqWrap.innerHTML += `
                    <div class="mt-3 text-sm text-gray-700">
                        <p class="font-semibold">Additional documents required:</p>
                        <ul class="list-disc pl-5 text-xs text-gray-600">
                            ${otherReqs.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                        <p class="mt-2 text-xs text-gray-500">You may attach up to 5 additional documents here:</p>
                        <input type="file" name="otherFiles" id="otherFiles" class="mt-2" multiple accept=".pdf,image/*">
                    </div>
                `;
            }
        }
    }
    
    formWrap.classList.remove('hidden');
    
    if (typeof showNotification !== 'undefined') {
        showNotification(`Ready to apply for ${loan.name}`, 'success', 'Application Form Loaded');
    }
    
    setTimeout(() => {
        formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    return true;
}

/**
 * Wrapper function for apply button clicks
 */
function handleApplyClick(loanId) {
    console.log('=== Apply Button Clicked ===');
    console.log('Loan ID:', loanId);
    
    const button = event?.target?.closest('button');
    if (button) {
        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        startLoanApplicationFromId(loanId)
            .then(() => {
                console.log('Application form loaded successfully');
            })
            .catch(err => {
                console.error('Error in startLoanApplicationFromId:', err);
                if (typeof showNotification !== 'undefined') {
                    showNotification('Error starting application', 'error', 'Error');
                }
                button.disabled = false;
                button.innerHTML = originalHTML;
            });
    } else {
        startLoanApplicationFromId(loanId).catch(err => {
            console.error('Error in startLoanApplicationFromId:', err);
            if (typeof showNotification !== 'undefined') {
                showNotification('Error starting application', 'error', 'Error');
            }
        });
    }
}

// ============================================
// INPUT VALIDATION FOR APPLY FORM
// ============================================

// Tenure field - only numbers
document.addEventListener('input', (e) => {
    if (e.target.id === 'applyTenure') {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }
});

// Aadhar Number field - only numbers, max 12 digits
document.addEventListener('input', (e) => {
    if (e.target.id === 'aadharNumber') {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    }
});

// Loan Amount field - prevent negative values
document.addEventListener('input', (e) => {
    if (e.target.id === 'applyAmount') {
        if (parseFloat(e.target.value) < 0) {
            e.target.value = 0;
        }
    }
});

// Purpose field - letters, spaces, and basic punctuation only
document.addEventListener('input', (e) => {
    if (e.target.id === 'applyPurpose') {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s\-&,.']/g, '');
    }
});

// PAN Number field - uppercase letters and numbers only
document.addEventListener('input', (e) => {
    if (e.target.id === 'panNumber') {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }
});

// ============================================
// FORM SUBMISSION AND EVENT HANDLERS
// ============================================

// Cancel button
document.addEventListener('DOMContentLoaded', () => {
    const cancelBtn = document.getElementById('cancelApplyBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const formContainer = document.getElementById('applyLoanFormContainer');
            if (formContainer) formContainer.classList.add('hidden');
            selectedLoan = null;
        });
    }
});

// Form submission
document.addEventListener('DOMContentLoaded', () => {
    const applyForm = document.getElementById('applyLoanForm');
    if (applyForm) {
        applyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const errEl = document.getElementById('applyError');
            if (!errEl) return;
            
            errEl.textContent = '';
            
            if (!selectedLoan) {
                errEl.textContent = 'Please select a loan product.';
                return;
            }
            
            const applyAmountEl = document.getElementById('applyAmount');
            const applyTenureEl = document.getElementById('applyTenure');
            const applyPurposeEl = document.getElementById('applyPurpose');
            
            const amount = parseFloat(applyAmountEl.value);
            const tenure = parseInt(applyTenureEl.value, 10);
            const purpose = applyPurposeEl.value.trim();
            
            if (isNaN(amount) || amount < selectedLoan.minAmount || amount > selectedLoan.maxAmount) {
                errEl.textContent = `Amount must be between ₹${selectedLoan.minAmount.toLocaleString()} and ₹${selectedLoan.maxAmount.toLocaleString()}`;
                return;
            }
            
            if (isNaN(tenure) || tenure < selectedLoan.minTenureMonths || tenure > selectedLoan.maxTenureMonths) {
                errEl.textContent = `Tenure must be between ${selectedLoan.minTenureMonths} and ${selectedLoan.maxTenureMonths} months`;
                return;
            }
            
            if (purpose.length < 5) {
                errEl.textContent = 'Purpose must be at least 5 characters.';
                return;
            }

            const applyingToast = typeof notificationManager !== 'undefined'
                ? notificationManager.loading('Submitting Application', 'We are submitting your application...')
                : null;

            try {
                const formData = new FormData();
                formData.append('loanId', selectedLoan._id);
                formData.append('loanAmount', amount);
                formData.append('tenureMonths', tenure);
                formData.append('purpose', purpose);

                // Optional fields
                const aadharNumberEl = document.getElementById('aadharNumber');
                const panNumberEl = document.getElementById('panNumber');
                if (aadharNumberEl && aadharNumberEl.value.trim()) {
                    formData.append('aadharNumber', aadharNumberEl.value.trim());
                }
                if (panNumberEl && panNumberEl.value.trim()) {
                    formData.append('panNumber', panNumberEl.value.trim());
                }

                // Files
                const aadharFileEl = document.getElementById('aadharFile');
                const panFileEl = document.getElementById('panFile');
                const otherFilesEl = document.getElementById('otherFiles');
                
                if (aadharFileEl && aadharFileEl.files && aadharFileEl.files[0]) {
                    formData.append('aadharFile', aadharFileEl.files[0]);
                }
                if (panFileEl && panFileEl.files && panFileEl.files[0]) {
                    formData.append('panFile', panFileEl.files[0]);
                }
                if (otherFilesEl && otherFilesEl.files && otherFilesEl.files.length) {
                    for (let i = 0; i < otherFilesEl.files.length; i++) {
                        formData.append('otherFiles', otherFilesEl.files[i]);
                    }
                }

                const res = await fetch('/api/loans/apply', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                const result = await res.json();
                
                if (applyingToast && typeof applyingToast.close === 'function') {
                    applyingToast.close();
                }

                if (result.success) {
                    showNotification(result.message || 'Application submitted successfully', 'success', 'Application Submitted');
                    
                    if (result.reviewETA || (result.nextSteps && result.nextSteps.length)) {
                        const info = [
                            result.reviewETA ? `Decision ETA: ${result.reviewETA}` : null,
                            ...(Array.isArray(result.nextSteps) ? result.nextSteps.map(s => `• ${s}`) : [])
                        ].filter(Boolean).join('\n');
                        if (info) showNotification(info, 'info', 'What happens next');
                    }
                    
                    if (result.kycRequired) {
                        showNotification('Complete KYC to speed up review', 'warning', 'KYC Required');
                    }
                    
                    // Refresh data
                    if (typeof loadDashboard === 'function') loadDashboard();
                    if (typeof loadRecentApplications === 'function') loadRecentApplications();
                    if (typeof loadMyLoans === 'function') loadMyLoans();
                    
                    // Reset form
                    const formContainer = document.getElementById('applyLoanFormContainer');
                    if (formContainer) formContainer.classList.add('hidden');
                    selectedLoan = null;
                    showSection('dashboard');
                } else {
                    errEl.textContent = result.message || 'Failed to submit application';
                    showNotification(result.message || 'Failed to submit application', 'error', 'Submission Failed');
                }
            } catch (error) {
                console.error('Apply error:', error);
                errEl.textContent = 'Failed to submit application. Please try again.';
                showNotification('Network or server error', 'error', 'Submission Failed');
            }
        });
    }
});

// Apply for This Loan buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('.apply-for-loan-btn')) {
        const loanId = e.target.closest('.apply-for-loan-btn').dataset.loanId;
        if (loanId) {
            handleApplyClick(loanId);
        }
    }
});

// Show apply section
document.addEventListener('click', (e) => {
    if (e.target.closest('.show-apply-section-btn')) {
        showSection('apply-loan');
    }
});
