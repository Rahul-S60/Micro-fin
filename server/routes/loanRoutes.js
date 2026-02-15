/**
 * Loan Routes
 * Handles loan products and loan applications
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const loanController = require('../controllers/loanController');
const { verifyToken, verifyCustomer, verifyAdmin } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * LOAN PRODUCT ROUTES
 */

/**
 * GET /api/loans
 * Get all active loan products
 * Public endpoint
 */
router.get('/', loanController.getAllLoans);

/**
 * GET /api/loans/:id
 * Get single loan product details
 * Public endpoint
 */
router.get('/:id', loanController.getLoanById);

/**
 * POST /api/loans
 * Create new loan product
 * Protected: Admin only
 */
router.post(
  '/',
  verifyToken,
  verifyAdmin,
  checkPermission('manage-customers'),
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Loan name must be at least 3 characters'),
    body('description').trim().isLength({ min: 10 }),
    body('category').isIn(['personal', 'business', 'education', 'home', 'auto', 'agricultural']),
    body('minAmount').isFloat({ min: 1000 }),
    body('maxAmount').isFloat({ min: 1000 }),
    body('annualInterestRate').isFloat({ min: 0, max: 100 }),
  ],
  loanController.createLoan
);

/**
 * PUT /api/loans/:id
 * Update loan product
 * Protected: Admin only
 */
router.put(
  '/:id',
  verifyToken,
  verifyAdmin,
  checkPermission('manage-customers'),
  loanController.updateLoan
);

/**
 * LOAN APPLICATION ROUTES
 */

/**
 * POST /api/loans/apply
 * Apply for loan
 * Protected: Customer only
 */
router.post(
  '/apply',
  verifyToken,
  verifyCustomer,
  (req, res, next) => {
    // Multer 2.0 compatible file upload middleware with error handling
    const fields = upload.fields([
      { name: 'aadharFile', maxCount: 1 },
      { name: 'panFile', maxCount: 1 },
      { name: 'otherFiles', maxCount: 5 }
    ]);
    
    fields(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err.message);
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message,
          code: err.code,
        });
      }
      next();
    });
  },
  [
    body('loanId').isMongoId().withMessage('Invalid loan ID'),
    body('loanAmount')
      .custom((value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 1000) {
          throw new Error('Minimum loan amount is 1000');
        }
        return true;
      }),
    body('tenureMonths')
      .custom((value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
          throw new Error('Tenure must be at least 1 month');
        }
        return true;
      }),
    body('purpose').trim().notEmpty().withMessage('Purpose is required').isLength({ min: 5 }).withMessage('Purpose must be at least 5 characters'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }
    next();
  },
  loanController.applyForLoan
);

/**
 * GET /api/loans/customer/:customerId
 * Get customer's loan applications
 * Protected: Customer or Admin
 */
router.get(
  '/customer/:customerId',
  verifyToken,
  loanController.getCustomerApplications
);

/**
 * GET /api/loans/application/:applicationId
 * Get loan application details
 * Protected: Customer or Admin
 */
router.get(
  '/application/:applicationId',
  verifyToken,
  loanController.getApplicationDetails
);

module.exports = router;
