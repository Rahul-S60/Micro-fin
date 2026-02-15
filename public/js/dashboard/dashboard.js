/**
 * Dashboard Section Functions
 * Loads and displays dashboard statistics and recent applications
 */

/**
 * Load dashboard data and statistics
 */
async function loadDashboard() {
    try {
        const response = await fetch('/api/customers/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const stats = data.data.statistics;
            const totalAppsEl = document.getElementById('totalApplications');
            const approvedLoansEl = document.getElementById('approvedLoans');
            const activeLoansEl = document.getElementById('activeLoans');
            const totalBorrowedEl = document.getElementById('totalBorrowed');

            if (totalAppsEl) totalAppsEl.textContent = stats.totalApplications;
            if (approvedLoansEl) approvedLoansEl.textContent = stats.approvedLoans;
            if (activeLoansEl) activeLoansEl.textContent = stats.activeLoans;
            if (totalBorrowedEl) totalBorrowedEl.textContent = '₹' + (stats.totalBorrowed / 100000).toFixed(1) + 'L';
            
            // Load recent applications
            loadRecentApplications();
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

/**
 * Load recent applications and render timeline
 */
async function loadRecentApplications() {
    try {
        const response = await fetch('/api/customers/loans', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const html = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Loan Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Applied On</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.slice(0, 5).map(loan => `
                            <tr>
                                <td>${loan.loanId?.name || 'N/A'}</td>
                                <td>₹${loan.loanAmount?.toLocaleString()}</td>
                                <td><span class="badge badge-${loan.status === 'approved' ? 'success' : loan.status === 'pending' ? 'warning' : loan.status === 'active' ? 'info' : 'neutral'}">${loan.status}</span></td>
                                <td>${new Date(loan.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            const container = document.getElementById('applicationsContainer');
            if (container) container.innerHTML = html;

            // Render extended timelines for all applications
            const timelineContainerHTML = data.data.map((app, idx) => {
                const created = new Date(app.createdAt);
                const status = app.status;
                const approvalDate = app.approvalDate ? new Date(app.approvalDate) : null;
                const rejectionDate = app.rejectionDate ? new Date(app.rejectionDate) : null;
                const activationDate = app.activatedAt ? new Date(app.activatedAt) : null;
                const lastUpdate = app.lastStatusUpdate ? new Date(app.lastStatusUpdate) : null;

                // Build timeline steps based on actual status
                const steps = [];
                
                // Step 1: Always submitted
                steps.push({
                    title: 'Application Submitted',
                    date: created.toLocaleDateString() + ' ' + created.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                    state: 'completed',
                    icon: 'fa-paper-plane',
                    note: `Amount: ₹${app.loanAmount?.toLocaleString()}`
                });

                // Step 2: Under Review (or passed)
                const underReviewDate = lastUpdate || (approvalDate || rejectionDate || null);
                steps.push({
                    title: 'Under Review',
                    date: status === 'pending' || status === 'under_review' ? 'In progress' : (underReviewDate ? underReviewDate.toLocaleDateString() : ''),
                    state: status === 'pending' || status === 'under_review' ? 'current' : 'completed',
                    icon: 'fa-magnifying-glass',
                    note: 'Loan officer reviewing details'
                });

                // Step 3: Decision/Approval/Rejection
                if (status === 'rejected') {
                    steps.push({
                        title: 'Application Rejected',
                        date: rejectionDate ? rejectionDate.toLocaleDateString() : '',
                        state: 'completed',
                        icon: 'fa-times-circle',
                        note: app.rejectionReason || 'Application did not meet criteria',
                        isError: true
                    });
                } else if (status === 'approved' || status === 'active' || status === 'closed') {
                    steps.push({
                        title: 'Application Approved',
                        date: approvalDate ? approvalDate.toLocaleDateString() : '',
                        state: 'completed',
                        icon: 'fa-check-circle',
                        note: 'Approved by loan officer'
                    });
                } else {
                    steps.push({
                        title: 'Awaiting Decision',
                        date: '',
                        state: 'pending',
                        icon: 'fa-hourglass-end',
                        note: 'Your application is being reviewed'
                    });
                }

                // Step 4: Activation (if applicable)
                if (status === 'active' || status === 'closed') {
                    steps.push({
                        title: 'Loan Activated',
                        date: activationDate ? activationDate.toLocaleDateString() : '',
                        state: 'completed',
                        icon: 'fa-play-circle',
                        note: 'EMI schedule started'
                    });
                } else if (status === 'approved') {
                    steps.push({
                        title: 'Ready for Activation',
                        date: '',
                        state: 'current',
                        icon: 'fa-play-circle',
                        note: 'Admin will activate your loan'
                    });
                }

                // Step 5: Closed (if applicable)
                if (status === 'closed') {
                    steps.push({
                        title: 'Loan Closed',
                        date: app.closedAt ? new Date(app.closedAt).toLocaleDateString() : '',
                        state: 'completed',
                        icon: 'fa-check',
                        note: 'Repayment complete'
                    });
                }

                const timelineHTML = `
                    <div class="mb-6 ${idx > 0 ? 'mt-8 pt-6 border-t-2 border-gray-200' : ''}">
                        <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <i class="fas fa-${app.loanId?.category === 'personal' ? 'user' : app.loanId?.category === 'business' ? 'briefcase' : 'graduation-cap'} text-indigo-600"></i>
                            ${app.loanId?.name || 'Loan'} - ${app.loanAmount?.toLocaleString()} ₹
                        </h4>
                        <div class="application-timeline">
                            ${steps.map(s => `
                                <div class="timeline-item ${s.state}${s.isError ? ' error' : ''}">
                                    <div class="timeline-dot"><i class="fas ${s.icon}" style="color: ${s.isError ? '#ef4444' : ''}"></i></div>
                                    <div class="timeline-content">
                                        <h4>${s.title}</h4>
                                        ${s.date ? `<p class="text-sm text-gray-500">${s.date}</p>` : ''}
                                        <p class="text-gray-600 text-sm">${s.note}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                return timelineHTML;
            }).join('');

            const timelineContainer = document.getElementById('applicationTimeline');
            if (timelineContainer) timelineContainer.innerHTML = timelineContainerHTML;
        } else {
            const container = document.getElementById('applicationsContainer');
            if (container) container.innerHTML = '<p class="text-gray-600 text-center py-8">No loan applications yet. Apply for your first loan!</p>';
            const timelineContainer = document.getElementById('applicationTimeline');
            if (timelineContainer) timelineContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        const container = document.getElementById('applicationsContainer');
        if (container) container.innerHTML = '<p class="text-red-600">Failed to load applications</p>';
    }
}

/**
 * Load loan products for display
 */
async function loadLoans() {
    try {
        const response = await fetch('/api/loans');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const microLoans = data.data.filter(l => (l.name || '').toLowerCase().includes('micro loan'));
            const list = (microLoans.length > 0 ? microLoans : data.data).slice(0, 6);
            const loansHtml = list.map(loan => `
                <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div class="mb-4">
                        <h3 class="font-bold text-lg mb-1">${loan.name}</h3>
                        <span class="badge badge-primary">${loan.category}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">${loan.description || 'No description'}</p>
                    <div class="space-y-2 mb-4">
                        <p class="text-sm"><strong>Rate:</strong> ${loan.annualInterestRate}% p.a.</p>
                        <p class="text-sm"><strong>Amount:</strong> ₹${loan.minAmount?.toLocaleString()} - ₹${loan.maxAmount?.toLocaleString()}</p>
                        <p class="text-sm"><strong>Tenure:</strong> ${loan.minTenureMonths}-${loan.maxTenureMonths} months</p>
                        <p class="text-xs text-gray-700"><strong>Eligibility:</strong> Min income ₹${(loan.minMonthlyIncome || 0).toLocaleString()} • Age ${loan.minAge || 0}-${loan.maxAge || 0} • Credit score ${loan.requiredCreditScore && loan.requiredCreditScore > 0 ? '≥ ' + loan.requiredCreditScore : 'not required'}</p>
                    </div>
                    <button class="btn btn-primary w-full apply-now-btn" data-loan-id="${loan._id}">
                        <i class="fas fa-check"></i> Apply Now
                    </button>
                </div>
            `).join('');
            const container = document.getElementById('loansContainer');
            if (container) container.innerHTML = loansHtml;
        } else {
            const container = document.getElementById('loansContainer');
            if (container) container.innerHTML = '<p class="text-gray-600">No loan products available</p>';
        }
    } catch (error) {
        console.error('Error loading loans:', error);
        const container = document.getElementById('loansContainer');
        if (container) container.innerHTML = '<p class="text-red-600">Failed to load loan products</p>';
    }
}

/**
 * Navigate to apply loan section and start application
 */
async function applyForLoan(loanId) {
    showSection('apply-loan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (loanId) {
        if (!window.availableLoans) {
            console.log('Loans not loaded yet, waiting...');
            await loadApplyLoan();
        }
        
        if (typeof startLoanApplicationFromId === 'function') {
            startLoanApplicationFromId(loanId);
        } else {
            console.error('startLoanApplicationFromId function not found');
        }
    }
}

// Event delegation for Apply Now buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('.apply-now-btn')) {
        const loanId = e.target.closest('.apply-now-btn').dataset.loanId;
        if (loanId) {
            applyForLoan(loanId);
        }
    }
});
