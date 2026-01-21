# Admin Dashboard Quick Reference

## 📋 Features Built

### 1. Customers Management
**Route:** `/admin/customers`
- View all customers with pagination
- Search by name, email, phone
- Filter by KYC & Account Status
- Verify KYC with remarks
- Export to CSV
- View loan history

### 2. Loan Applications
**Route:** `/admin/applications`
- View all applications
- Filter by status (Pending, Under Review, Approved, Rejected, Active)
- Approve/Reject applications
- Activate approved loans
- Export to CSV
- View application details

### 3. Loan Products
**Route:** `/admin/loan-products`
- Add new loan products
- Edit/Delete existing products
- Configure:
  - Name & Category
  - Loan amount range
  - Interest rate & fees
  - Tenure range
  - Description & status

### 4. KYC Verification
**Route:** `/admin/kyc`
- View customers pending verification
- Filter by KYC status
- View KYC details
- Approve/Reject with remarks
- Search customers

### 5. Admin Settings
**Route:** `/admin/settings`

**Tabs:**
- **Profile:** Update first/last name
- **Security:** Change password, session management
- **System:** System info, email config, maintenance

## 🚀 Quick Navigation

From any admin page, use the sidebar to jump to:
- Dashboard (`/admin/dashboard`)
- Customers (`/admin/customers`)
- Applications (`/admin/applications`)
- Loan Products (`/admin/loan-products`)
- KYC Verification (`/admin/kyc`)
- Settings (`/admin/settings`)
- Logout

## 🔍 Common Actions

### Approve a Loan Application
1. Go to Applications (`/admin/applications`)
2. Find pending application
3. Click ✓ button
4. Add remarks (optional)
5. Click Submit

### Verify Customer KYC
1. Go to KYC (`/admin/kyc`)
2. Find customer
3. Click ✓ button
4. Select status (Verified/Rejected)
5. Add remarks
6. Click Submit Decision

### Add New Loan Product
1. Go to Loan Products (`/admin/loan-products`)
2. Click "New Product" button
3. Fill in product details
4. Set interest rate & fees
5. Configure tenure range
6. Click Save Product

### Search & Filter
- **Search:** Type in search box, results filter automatically
- **Filter:** Select filter criteria, click Filter button
- **Reset:** Click Reset to clear all filters

## 📊 Dashboard Statistics

Each page shows real-time stats:
- Customers: Total, Verified, KYC Pending
- Applications: Total, Pending, Approved, Active, Rejected
- Products: Total, Active
- KYC: Total, Pending, Verified

## 📁 File Locations

### Views
- `views/admin/customers.ejs` - Customers page
- `views/admin/applications.ejs` - Applications page
- `views/admin/loan-products.ejs` - Loan products page
- `views/admin/kyc.ejs` - KYC verification page
- `views/admin/settings.ejs` - Settings page

### Controllers
- `server/controllers/adminController.js` - Admin logic

### Routes
- `server/routes/adminRoutes.js` - Admin API routes
- `server/app.js` - Page routes

## 🔐 Authentication

All admin pages require:
- Valid JWT token in localStorage: `adminToken`
- Admin object in localStorage: `admin`
- If not authenticated, redirected to `/admin/login`

## ✨ Key Features by Page

### Customers Page
- Pagination (10 per page)
- Search box
- KYC & Account status filters
- CSV export
- Customer detail modal
- KYC verification modal

### Applications Page
- Pagination
- Search box
- Status filter
- Date filter
- CSV export
- Application detail modal
- Approve/Reject/Activate modals

### Loan Products Page
- Grid layout cards
- Add/Edit/Delete modals
- Product details modal
- Validation for amount & tenure ranges
- Category selection

### KYC Page
- Customer list
- Status filter
- Search box
- Pagination
- KYC details modal
- Verification decision modal

### Settings Page
- Tabbed interface
- Profile updates
- Password change with validation
- Session information
- Email status check
- Cache clearing option

## 🎯 Best Practices

1. **Always add remarks** when approving/rejecting
2. **Verify KYC before** approving loan applications
3. **Check loan product terms** before creating applications
4. **Review customer details** before final decisions
5. **Export data regularly** for backup
6. **Change password regularly** (Settings > Security)

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify JWT token is valid
3. Ensure backend APIs are running
4. Check database connection
5. Review email configuration if email features used

## 🔄 Workflow Example

**Complete Loan Processing Workflow:**

1. **Customer Applies** → Application created
2. **View Application** → Go to Applications page
3. **Verify KYC** → Go to KYC page, verify customer
4. **Approve Application** → Back to Applications, approve
5. **Activate Loan** → Click activate button
6. **EMI Starts** → Loan processing complete

