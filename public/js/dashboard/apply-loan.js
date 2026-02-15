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
            window.availableLoans = data.data;
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
    
    // ============================================
    // Render Required Documents Section
    // ============================================
    const docsSection = document.getElementById('documentsSection');
    const docsContainer = document.getElementById('documentsContainer');
    
    if (docsSection && docsContainer) {
        if (loan.requiredDocuments && loan.requiredDocuments.length > 0) {
            docsSection.classList.remove('hidden');
            docsContainer.innerHTML = '';
            
            loan.requiredDocuments.forEach((doc, idx) => {
                const docId = `doc_${idx}_${doc.name.replace(/\s+/g, '_')}`;
                const isRequired = doc.isRequired !== false;
                const requiredLabel = isRequired ? '<span class="text-red-500">*</span>' : '<span class="text-gray-500">(Optional)</span>';
                
                let acceptAttribute = '.pdf,image/*';
                if (doc.fileType === 'pdf') {
                    acceptAttribute = '.pdf';
                } else if (doc.fileType === 'image') {
                    acceptAttribute = 'image/*';
                }
                
                const docHTML = `
                    <div class="border rounded-lg p-4 bg-gray-50">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 mb-1">
                                    <i class="fas fa-file-alt text-indigo-600 mr-2"></i> ${doc.name} ${requiredLabel}
                                </label>
                                ${doc.description ? `<p class="text-xs text-gray-600">${doc.description}</p>` : ''}
                            </div>
                        </div>
                        <input 
                            type="file" 
                            id="${docId}" 
                            name="documents" 
                            class="document-upload-input form-control"
                            data-doc-name="${doc.name}"
                            data-doc-required="${isRequired}"
                            accept="${acceptAttribute}"
                            ${isRequired ? 'required' : ''}
                        >
                        <p class="text-xs text-gray-500 mt-2">Maximum file size: 5MB. Allowed formats: PDF, JPG, PNG</p>
                        <div class="mt-2 text-xs" id="${docId}-status"></div>
                    </div>
                `;
                docsContainer.innerHTML += docHTML;
            });
        } else {
            docsSection.classList.add('hidden');
        }
    }
    
    // ============================================
    // Render Essential Information (Always collected for all loans)
    // ============================================
    const reqWrap = document.getElementById('additionalRequirements');
    if (reqWrap) {
        reqWrap.innerHTML = '';
        
        // Essential Identity & Address Information - ALWAYS shown for all loans
        reqWrap.innerHTML = `
            <div class="border-b pb-6 mb-6">
                <h4 class="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <i class="fas fa-id-card text-indigo-600"></i> Essential Information
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Aadhar Information -->
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            Aadhar Number <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="aadharNumber" id="aadharNumber" class="form-control" pattern="[0-9]{12}" maxlength="12" placeholder="Enter 12-digit Aadhar" required>
                        <p class="text-xs text-gray-500 mt-1">Required for identity verification</p>
                    </div>

                    <!-- Aadhar File Upload -->
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            Aadhar Document <span class="text-red-500">*</span>
                        </label>
                        <input type="file" name="aadharFile" id="aadharFile" class="form-control" accept=".pdf,image/*" required>
                        <p class="text-xs text-gray-500 mt-1">Upload Aadhar proof (PDF/JPG/PNG)</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <!-- PAN Information -->
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            PAN Number <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="panNumber" id="panNumber" class="form-control" maxlength="10" placeholder="ABCDE1234F" required>
                        <p class="text-xs text-gray-500 mt-1">Tax identification number (uppercase)</p>
                    </div>

                    <!-- PAN File Upload -->
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            PAN Document <span class="text-red-500">*</span>
                        </label>
                        <input type="file" name="panFile" id="panFile" class="form-control" accept=".pdf,image/*" required>
                        <p class="text-xs text-gray-500 mt-1">Upload PAN proof (PDF/JPG/PNG)</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <!-- Address -->
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            Full Address <span class="text-red-500">*</span>
                        </label>
                        <textarea name="address" id="address" class="form-control" rows="2" placeholder="Street address, city, state, zip code" required></textarea>
                        <p class="text-xs text-gray-500 mt-1">Complete residential address</p>
                    </div>

                    <!-- Phone Number -->
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            Contact Number <span class="text-red-500">*</span>
                        </label>
                        <input type="tel" name="phone" id="phone" class="form-control" pattern="[0-9]{10}" maxlength="10" placeholder="10-digit mobile number" required>
                        <p class="text-xs text-gray-500 mt-1">10-digit mobile number</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <!-- Monthly Income -->
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            Monthly Income (₹) <span class="text-red-500">*</span>
                        </label>
                        <input type="number" name="monthlyIncome" id="monthlyIncome" class="form-control" min="0" placeholder="Enter monthly income" required>
                        <p class="text-xs text-gray-500 mt-1" id="incomeHint">Min required: ₹${loan.minMonthlyIncome?.toLocaleString() || '0'}</p>
                    </div>

                    <!-- Age -->
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            Age <span class="text-red-500">*</span>
                        </label>
                        <input type="number" name="age" id="age" class="form-control" min="18" max="100" placeholder="Enter your age" required>
                        <p class="text-xs text-gray-500 mt-1">Age ${loan.minAge || 18} - ${loan.maxAge || 60}</p>
                    </div>
                </div>
            </div>
        `;

        // Additional loan-specific documents if configured
        if (loan.requirements && loan.requirements.length) {
            const otherReqs = loan.requirements.filter(r => !/aadhar|pan/i.test(r));
            if (otherReqs.length) {
                reqWrap.innerHTML += `
                    <div class="border-b pb-6 mb-6">
                        <h4 class="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <i class="fas fa-file-contract text-indigo-600"></i> Additional Requirements
                        </h4>
                        <div class="text-sm text-gray-700">
                            <p class="font-semibold mb-2">Documents required:</p>
                            <ul class="list-disc pl-5 text-xs text-gray-600 mb-3">
                                ${otherReqs.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                            <p class="text-xs text-gray-500 mb-2">You may attach up to 5 additional documents:</p>
                            <input type="file" name="otherFiles" id="otherFiles" class="form-control" multiple accept=".pdf,image/*">
                        </div>
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

// Phone Number field - only numbers, max 10 digits
document.addEventListener('input', (e) => {
    if (e.target.id === 'phone') {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    }
});

// Age field - only numbers, max 3 digits
document.addEventListener('input', (e) => {
    if (e.target.id === 'age') {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
    }
});

// Monthly Income field - only numbers
document.addEventListener('input', (e) => {
    if (e.target.id === 'monthlyIncome') {
        if (parseFloat(e.target.value) < 0) {
            e.target.value = 0;
        }
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

            // ============================================
            // Validate Essential Information (Always Required)
            // ============================================
            const aadharEl = document.getElementById('aadharNumber');
            const aadharFileEl = document.getElementById('aadharFile');
            const panEl = document.getElementById('panNumber');
            const panFileEl = document.getElementById('panFile');
            const addressEl = document.getElementById('address');
            const phoneEl = document.getElementById('phone');
            const incomeEl = document.getElementById('monthlyIncome');
            const ageEl = document.getElementById('age');

            // Validate Aadhar
            if (!aadharEl || !aadharEl.value || aadharEl.value.length !== 12) {
                errEl.textContent = 'Please enter a valid 12-digit Aadhar number';
                return;
            }
            if (!aadharFileEl || !aadharFileEl.files || aadharFileEl.files.length === 0) {
                errEl.textContent = 'Please upload Aadhar document (required)';
                return;
            }

            // Validate PAN
            if (!panEl || !panEl.value || panEl.value.length !== 10) {
                errEl.textContent = 'Please enter a valid PAN number (10 characters)';
                return;
            }
            if (!panFileEl || !panFileEl.files || panFileEl.files.length === 0) {
                errEl.textContent = 'Please upload PAN document (required)';
                return;
            }

            // Validate Address
            if (!addressEl || !addressEl.value || addressEl.value.trim().length < 10) {
                errEl.textContent = 'Please enter a complete address (at least 10 characters)';
                return;
            }

            // Validate Phone
            const phone = phoneEl ? phoneEl.value.trim() : '';
            if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
                errEl.textContent = 'Please enter a valid 10-digit mobile number';
                return;
            }

            // Validate Monthly Income
            const income = incomeEl ? parseFloat(incomeEl.value) : 0;
            if (isNaN(income) || income < selectedLoan.minMonthlyIncome) {
                errEl.textContent = `Monthly income must be at least ₹${selectedLoan.minMonthlyIncome?.toLocaleString() || '0'}`;
                return;
            }

            // Validate Age
            const age = ageEl ? parseInt(ageEl.value) : 0;
            if (isNaN(age) || age < (selectedLoan.minAge || 18) || age > (selectedLoan.maxAge || 60)) {
                errEl.textContent = `Age must be between ${selectedLoan.minAge || 18} and ${selectedLoan.maxAge || 60} years`;
                return;
            }

            // Validate file sizes for essential docs
            const allFiles = [aadharFileEl?.files[0], panFileEl?.files[0]].filter(f => f);
            for (let file of allFiles) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    errEl.textContent = `File "${file.name}" exceeds maximum size of 5MB`;
                    return;
                }
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

                // Essential Information (Required for all loans)
                formData.append('aadharNumber', aadharEl.value.trim());
                formData.append('panNumber', panEl.value.trim());
                formData.append('address', addressEl.value.trim());
                formData.append('phone', phoneEl.value.trim());
                formData.append('monthlyIncome', Number(incomeEl.value));
                formData.append('age', Number(ageEl.value));

                // Essential document files
                if (aadharFileEl && aadharFileEl.files[0]) {
                    formData.append('aadharFile', aadharFileEl.files[0]);
                }
                if (panFileEl && panFileEl.files[0]) {
                    formData.append('panFile', panFileEl.files[0]);
                }

                // Files - All structured document uploads
                const documentInputs = document.querySelectorAll('.document-upload-input');
                let fileCount = 0;
                
                documentInputs.forEach((input, idx) => {
                    if (input.files && input.files.length > 0) {
                        for (let file of input.files) {
                            formData.append(`documents`, file);
                            fileCount++;
                        }
                    }
                });

                // Legacy field support for optional additional files
                const otherFilesEl = document.getElementById('otherFiles');
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
