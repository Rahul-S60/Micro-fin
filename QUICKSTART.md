# 🚀 Quick Start Guide

## Prerequisites
- Node.js v14+ installed
- MongoDB running locally or Atlas connection string
- Postman (for API testing)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/micro-finance-system
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRY=7d
```

### 3. Start MongoDB (if local)
```bash
mongod
```

### 4. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Server runs on `http://localhost:5000`

---

## 🎯 Testing the Application

### 1. Access Landing Page
```
http://localhost:5000/
```

### 2. Customer Flow
- Register: `http://localhost:5000/customer/register`
- Login: `http://localhost:5000/customer/login`
- Dashboard: `http://localhost:5000/customer/dashboard`

### 3. Admin Flow
- Login: `http://localhost:5000/admin/login`
- Dashboard: `http://localhost:5000/admin/dashboard`

---

## 📊 Key API Endpoints

### Public Endpoints
- `GET /api/loans` - Get all active loan products
- `GET /api/health` - Health check

### Customer Endpoints (Authenticated)
- `POST /api/auth/customer/register` - Register customer
- `POST /api/auth/customer/login` - Login customer
- `GET /api/customers/profile` - Get customer profile
- `PUT /api/customers/profile` - Update profile
- `GET /api/customers/dashboard` - Get dashboard data
- `POST /api/loans/apply` - Apply for loan
- `GET /api/customers/loans` - Get customer's loans

### Admin Endpoints (Authenticated)
- `POST /api/auth/admin/login` - Admin login
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/applications` - Get all loan applications
- `PUT /api/admin/application/:id/approve` - Approve loan
- `PUT /api/admin/application/:id/reject` - Reject loan
- `PUT /api/admin/customer/:id/kyc` - Verify KYC

---

## 🧪 Test with Postman

### Step 1: Customer Registration
```
POST http://localhost:5000/api/auth/customer/register
{
  "firstName": "Rahul",
  "lastName": "Kumar",
  "email": "rahul@test.com",
  "phone": "9876543210",
  "password": "Test@123",
  "confirmPassword": "Test@123",
  "street": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "monthlyIncome": 50000,
  "occupation": "Engineer",
  "employmentType": "salaried"
}
```

### Step 2: Customer Login
```
POST http://localhost:5000/api/auth/customer/login
{
  "email": "rahul@test.com",
  "password": "Test@123"
}
```
Save the `token` from response.

### Step 3: Get Loans
```
GET http://localhost:5000/api/loans
```

### Step 4: Apply for Loan
```
POST http://localhost:5000/api/loans/apply
Headers: Authorization: Bearer {token}
{
  "loanId": "{loan_id_from_previous_response}",
  "loanAmount": 50000,
  "tenureMonths": 12,
  "purpose": "Business expansion"
}
```

### Step 5: Admin Login
```
POST http://localhost:5000/api/auth/admin/login
{
  "email": "admin@test.com",
  "password": "Admin@123"
}
```

### Step 6: Approve Loan
```
PUT http://localhost:5000/api/admin/application/{application_id}/approve
Headers: Authorization: Bearer {admin_token}
{
  "remarks": "Approved for disbursement"
}
```

---

## 🔒 Default Test Credentials

### Demo Admin Account
- Email: `admin@test.com`
- Password: `Admin@123`
- Role: `super_admin`

**Note**: Create this admin account in MongoDB for testing.

---

## 📁 Project Structure Overview

```
micro-finance-system/
├── server/              # Backend application
│   ├── config/         # Database config
│   ├── models/         # MongoDB schemas
│   ├── controllers/    # Business logic
│   ├── routes/         # API routes
│   ├── middleware/     # Auth, error handling
│   ├── app.js          # Express setup
│   └── server.js       # Entry point
├── views/              # EJS templates
│   ├── customer/       # Customer pages
│   ├── admin/          # Admin pages
│   └── shared/         # Shared layouts
├── public/             # Static assets
│   ├── css/            # Stylesheets
│   └── js/             # Client JS
├── .env                # Environment config
├── package.json        # Dependencies
└── README.md           # Full documentation
```

---

## ⚠️ Important Notes

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` for production
2. **Security**: Never commit `.env` file to version control
3. **Database**: Use MongoDB Atlas for cloud deployment
4. **Passwords**: All passwords are bcrypt hashed before storage
5. **CORS**: Currently allows all origins - restrict in production

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
Solution: Ensure MongoDB is running on localhost:27017
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
Solution: Change PORT in .env or kill process on port 5000
```

### JWT Token Invalid
```
Solution: Ensure token is included in Authorization header as "Bearer <token>"
```

### CORS Error
```
Solution: Check if frontend origin is allowed in CORS configuration
```

---

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Introduction](https://jwt.io)
- [Tailwind CSS](https://tailwindcss.com)
- [EJS Template Engine](https://ejs.co)

---

## 🎓 What You'll Learn

By working with this system, you'll understand:
- ✅ Full-stack web development
- ✅ RESTful API design
- ✅ Database modeling
- ✅ Authentication & Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Error handling & validation
- ✅ Security best practices
- ✅ Production-ready code structure

---

## 💡 Next Steps

1. Run `npm install` to install dependencies
2. Configure `.env` with your MongoDB connection
3. Start server with `npm run dev`
4. Access http://localhost:5000
5. Test with provided credentials
6. Explore the codebase and understand the architecture
7. Extend with additional features

---

**Happy Coding! 🚀**

For detailed API documentation, see `README.md`
