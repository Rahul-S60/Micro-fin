/**
 * KYC Verification Section Functions
 * Handles KYC form submission and status updates
 */

/**
 * Load KYC status
 */
async function loadKYCStatus() {
    try {
        const response = await fetch('/api/customers/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const kycStatus = data.data.kycStatus || 'not_verified';
            const statusText = document.getElementById('kycStatusText');
            const statusAlert = document.getElementById('kycStatusAlert');
            
            if (statusText) {
                statusText.textContent = kycStatus === 'verified' ? 'Verified ✓' : 
                                       kycStatus === 'pending' ? 'Pending Review' : 'Not Verified';
            }
            
            if (statusAlert) {
                statusAlert.className = 'alert alert-' + (kycStatus === 'verified' ? 'success' : 
                                                         kycStatus === 'pending' ? 'warning' : 'info') + ' mb-6';
            }
            
            // If verified, show success message
            if (kycStatus === 'verified') {
                const kycForm = document.getElementById('kycForm');
                if (kycForm) {
                    kycForm.innerHTML = `
                        <div class="text-center py-8">
                            <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                            <p class="text-lg font-bold text-gray-800">Your KYC is verified!</p>
                            <p class="text-sm text-gray-600">You can now apply for loans</p>
                        </div>
                    `;
                }
                
                if (typeof showNotification !== 'undefined') {
                    showNotification('KYC verified successfully', 'success', 'KYC Verified');
                }
            }
        }
    } catch (error) {
        console.error('Error loading KYC status:', error);
    }
}

// ============================================
// KYC FORM SUBMISSION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const kycForm = document.getElementById('kycForm');
    if (kycForm) {
        kycForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const aadharNumber = formData.get('aadharNumber');
            const panNumber = formData.get('panNumber');
            const consent = formData.get('kycConsent');
            
            if (!aadharNumber || aadharNumber.length !== 12) {
                const errorEl = document.getElementById('kycError');
                if (errorEl) errorEl.textContent = 'Invalid Aadhar number. Must be 12 digits.';
                return;
            }
            
            if (!panNumber || panNumber.length !== 10) {
                const errorEl = document.getElementById('kycError');
                if (errorEl) errorEl.textContent = 'Invalid PAN number. Must be 10 characters.';
                return;
            }
            
            if (!consent) {
                const errorEl = document.getElementById('kycError');
                if (errorEl) errorEl.textContent = 'Please give consent to verify your documents.';
                return;
            }
            
            const data = {
                aadharNumber: aadharNumber,
                panNumber: panNumber.toUpperCase()
            };

            try {
                const response = await fetch('/api/customers/verify-kyc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                const errorEl = document.getElementById('kycError');

                if (result.success) {
                    if (errorEl) errorEl.textContent = '';
                    
                    if (typeof showNotification !== 'undefined') {
                        showNotification('KYC submitted successfully! Your documents are under review.', 'success', 'KYC Submitted');
                    }
                    
                    loadKYCStatus();
                } else {
                    if (errorEl) errorEl.textContent = result.message;
                    
                    if (typeof showNotification !== 'undefined') {
                        showNotification(result.message || 'Failed to submit KYC', 'error', 'KYC Error');
                    }
                }
            } catch (error) {
                console.error('Error submitting KYC:', error);
                const errorEl = document.getElementById('kycError');
                if (errorEl) errorEl.textContent = 'Failed to submit KYC. Please try again.';
                
                if (typeof showNotification !== 'undefined') {
                    showNotification('Network error. Please try again.', 'error', 'Error');
                }
            }
        });
    }
});

// ============================================
// INPUT VALIDATION FOR KYC FORM
// ============================================

// Aadhar field in KYC section - only numbers, max 12
document.addEventListener('input', (e) => {
    if (e.target.name === 'aadharNumber' && e.target.closest('#kycForm')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    }
});

// PAN field in KYC section - uppercase letters and numbers, max 10
document.addEventListener('input', (e) => {
    if (e.target.name === 'panNumber' && e.target.closest('#kycForm')) {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }
});
