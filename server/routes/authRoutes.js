/**
 * Authentication Routes
 * Handles customer and admin authentication endpoints
 * Includes registration, login, and token verification
 */

const express = require('express');
const { body, validationRules } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * CUSTOMER AUTHENTICATION ROUTES
 */

/**
 * POST /api/auth/customer/register
 * Register new customer
 * Public endpoint
 */
router.post(
  '/customer/register',
  [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide valid email'),
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone must be 10 digits'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('street').trim().notEmpty().withMessage('Street address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('pincode')
      .matches(/^[0-9]{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('monthlyIncome').isFloat({ min: 0 }).withMessage('Monthly income must be a positive number'),
    body('occupation').trim().notEmpty().withMessage('Occupation is required'),
    body('employmentType')
      .isIn(['salaried', 'self-employed', 'business', 'retired', 'other'])
      .withMessage('Invalid employment type'),
  ],
  authController.customerRegister
);

/**
 * POST /api/auth/customer/login
 * Login customer
 * Public endpoint
 */
router.post(
  '/customer/login',
  [
    body('email').isEmail().withMessage('Please provide valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.customerLogin
);

/**
 * ADMIN AUTHENTICATION ROUTES
 */

/**
 * POST /api/auth/admin/login
 * Admin login with email and password
 * Public endpoint
 */
router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Please provide valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.adminLogin
);

/**
 * POST /api/auth/admin/register
 * Create new admin (only super admins can do this)
 * Protected endpoint - requires admin permissions
 */
router.post(
  '/admin/register',
  verifyToken,
  verifyAdmin,
  checkPermission('manage-admins'),
  [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide valid email'),
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone must be 10 digits'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['super_admin', 'loan_officer', 'customer_service', 'compliance_officer'])
      .withMessage('Invalid role'),
    body('department')
      .isIn(['loan_management', 'kyc_verification', 'customer_support', 'compliance', 'management'])
      .withMessage('Invalid department'),
  ],
  authController.adminRegister
);

/**
 * GET /api/auth/verify
 * Verify JWT token
 * Protected endpoint
 */
router.get('/verify', verifyToken, authController.verifyTokenEndpoint);

module.exports = router;
