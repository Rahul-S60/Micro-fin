/**
 * Authentication Controller
 * Handles customer and admin registration, login, and token generation
 * Implements JWT-based authentication with bcrypt password hashing
 */

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @param {string} role - User role (customer or admin)
 * @param {string} email - User email
 * @returns {string} - JWT token
 */
const generateToken = (id, role, email) => {
  return jwt.sign(
    {
      id,
      role,
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY || '7d',
    }
  );
};

/**
 * Customer Registration
 * POST /api/auth/customer/register
 * Creates new customer account with validation
 */
const customerRegister = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      street,
      city,
      state,
      pincode,
      monthlyIncome,
      occupation,
      employmentType,
    } = req.body;

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this email or phone already exists.',
      });
    }

    // Create new customer
    const customer = new Customer({
      firstName,
      lastName,
      email,
      phone,
      password,
      address: {
        street,
        city,
        state,
        pincode,
      },
      monthlyIncome,
      occupation,
      employmentType,
    });

    await customer.save();

    // Generate token
    const token = generateToken(customer._id, 'customer', customer.email);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Customer registered successfully.',
      token,
      customer: customer.getPublicProfile(),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error.message,
    });
  }
};

/**
 * Customer Login
 * POST /api/auth/customer/login
 * Authenticates customer and returns JWT token
 */
const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find customer and select password field
    const customer = await Customer.findOne({ email }).select('+password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check account status
    if (customer.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is ' + customer.accountStatus + '.',
      });
    }

    // Compare passwords
    const isPasswordValid = await customer.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken(customer._id, 'customer', customer.email);

    // Return response
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      customer: customer.getPublicProfile(),
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message,
    });
  }
};

/**
 * Admin Login
 * POST /api/auth/admin/login
 * Authenticates admin and returns JWT token
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find admin and select password field
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(403).json({
        success: false,
        message: 'Account locked due to multiple failed login attempts. Try again later.',
      });
    }

    // Check account status
    if (admin.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is ' + admin.accountStatus + '.',
      });
    }

    // Compare passwords
    const isPasswordValid = await admin.matchPassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id, 'admin', admin.email);

    // Return response (exclude password)
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      admin: adminData,
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message,
    });
  }
};

/**
 * Admin Register (create new admin)
 * POST /api/auth/admin/register
 * Only super admins can create new admins
 */
const adminRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, role, department } =
      req.body;

    // Verify caller is super admin
    if (req.user.role !== 'admin' || !req.admin.permissions.canManageAdmins) {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can create new admins.',
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Check if admin exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email or phone already exists.',
      });
    }

    // Create new admin
    const admin = new Admin({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      department,
      createdBy: req.user.id,
    });

    await admin.save();

    // Return response
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully.',
      admin: adminData,
    });
  } catch (error) {
    console.error('Admin Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin creation failed.',
      error: error.message,
    });
  }
};

/**
 * Verify Token
 * GET /api/auth/verify
 * Verifies JWT token validity
 */
const verifyTokenEndpoint = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      message: 'Token is valid.',
      user: decoded,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token verification failed.',
      error: error.message,
    });
  }
};

module.exports = {
  customerRegister,
  customerLogin,
  adminLogin,
  adminRegister,
  verifyTokenEndpoint,
  generateToken,
};
