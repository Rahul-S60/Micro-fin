# Navachethana Microfinance System

A modern, production-ready microfinance management system built with Node.js, Express, MongoDB, and EJS.

## 🌟 Features

### Customer Portal
- User Registration & Authentication with email verification
- Loan Application Management for various microfinance products
- KYC Verification with document uploads
- Dashboard Analytics tracking loan status and applications
- Profile Management
- Real-time Notifications

### Admin Portal
- Customer Management
- Loan Application Processing (approve/reject)
- KYC Document Verification
- Loan Product Configuration
- Analytics & Reports with Chart.js
- System Settings

### Security & Compliance
- Full CSP compliance
- JWT Authentication
- Password Encryption with bcrypt
- Role-based Access Control
- Secure File Uploads
- Password Reset Flow

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: EJS
- **Authentication**: JWT
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Charts**: Chart.js
- **Security**: Helmet.js, CSP
- **Email**: Nodemailer

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB (v4.0+)
- npm or yarn
- Gmail account (optional, for emails)

## ⚙️ Installation

1. **Clone the repository**
   \\\ash
   git clone https://github.com/Rahul-S60/Micro-fin.git
   cd micro-finance-system
   \\\

2. **Install dependencies**
   \\\ash
   npm install
   \\\

3. **Configure environment variables**
   
   Create \.env\ file:
   \\\env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/microfinance
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   \\\

4. **Seed initial data**
   \\\ash
   npm run seed:admin
   npm run seed:loans
   \\\

5. **Start the server**
   \\\ash
   npm start
   \\\

6. **Access the application**
   - Customer Portal: http://localhost:5000
   - Admin Portal: http://localhost:5000/admin/login

## 🔑 Default Credentials

**Admin**: admin@microfinance.com / Admin@123

## 📁 Project Structure

\\\
micro-finance-system/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── views/
│   ├── admin/
│   ├── customer/
│   └── shared/
├── public/
│   ├── css/
│   ├── js/
│   └── img/
└── package.json
\\\

## 🛡️ Security Features

- CSP Headers preventing XSS attacks
- Event Delegation (no inline handlers)
- bcrypt Password Hashing
- JWT Secure Authentication
- Input Validation with express-validator
- File Upload Security with multer

## 📊 Loan Products

1. Micro Loan - Emergency Needs (₹5K-₹50K)
2. Micro Loan - Agricultural Inputs (₹10K-₹1L)
3. Small Business Loan (₹50K-₹5L)
4. Education Loan (₹20K-₹2L)
5. Home Improvement Loan (₹50K-₹3L)

## 🔧 API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/admin/login
- POST /api/auth/forgot-password

### Customer
- GET /api/customer/dashboard
- PUT /api/customer/profile
- POST /api/customer/kyc/upload

### Loans
- GET /api/loans/products
- POST /api/loans/apply
- GET /api/loans/applications

### Admin
- GET /api/admin/customers
- GET /api/admin/applications
- PUT /api/admin/applications/:id/approve

## 📝 License

MIT License

## 👥 Author

**Rahul** - [GitHub](https://github.com/Rahul-S60)

## 🗺️ Roadmap

- [ ] SMS notifications
- [ ] Payment gateway integration
- [ ] Mobile app
- [ ] Multi-language support
- [ ] PDF reports

---

**Built with ❤️ for financial inclusion**
