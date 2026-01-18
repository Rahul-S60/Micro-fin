/**
 * Email Service
 * Handles sending emails for password reset and notifications
 * Supports Gmail SMTP and Ethereal for testing
 */

const nodemailer = require('nodemailer');

// ============================================
// EMAIL CONFIGURATION DETECTION
// ============================================

// Check if credentials are placeholder values
const isPlaceholder = (value) => {
  if (!value) return true;
  const placeholders = [
    'your-email@gmail.com',
    'your-app-specific-password',
    'your-email',
    'your-password',
    'your-app-password'
  ];
  return placeholders.some(ph => value.includes(ph) || value.includes(ph.toLowerCase()));
};

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const hasValidCredentials = emailUser && emailPassword && !isPlaceholder(emailUser) && !isPlaceholder(emailPassword);

// ============================================
// TRANSPORTER SETUP - Gmail or Ethereal
// ============================================

let transporter;
let emailConfigStatus = {
  configured: false,
  provider: 'none',
  reason: ''
};

if (hasValidCredentials) {
  // Use Gmail with real credentials
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
  emailConfigStatus = {
    configured: true,
    provider: 'Gmail',
    reason: 'Valid Gmail credentials found'
  };
  console.log('📧 Email Service: Gmail SMTP');
  
  // Test connection immediately
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Gmail Authentication Failed!');
      console.error('   Error:', error.message);
      console.log('\n🔧 Quick Fixes:');
      console.log('   1. Generate NEW App Password at: https://myaccount.google.com/apppasswords');
      console.log('   2. Copy EXACTLY as shown (16 characters, may have spaces)');
      console.log('   3. Remove ALL spaces: xayvpxjupqjqzhlu');
      console.log('   4. Update .env with EMAIL_USER and EMAIL_PASSWORD');
      console.log('   5. Restart server: npm run dev\n');
    } else {
      console.log('✅ Gmail connection verified - Ready to send emails!');
    }
  });
} else if (process.env.NODE_ENV !== 'production') {
  // Use Ethereal for development/testing (doesn't actually send emails)
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER || 'test@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'test-password',
    },
  });
  emailConfigStatus = {
    configured: false,
    provider: 'Ethereal (Test Mode)',
    reason: 'No valid Gmail credentials. Using Ethereal for email preview only.'
  };
  console.log('📧 Email Service: Ethereal (TEST MODE - Emails not actually sent)');
  console.log('⚠️  Email Credentials Missing!');
  console.log('   To send real emails, set EMAIL_USER and EMAIL_PASSWORD in .env');
  console.log('   Then restart the server.');
} else {
  // Production without credentials - ERROR
  transporter = null;
  emailConfigStatus = {
    configured: false,
    provider: 'none',
    reason: 'Production mode but no valid credentials'
  };
  console.error('❌ CRITICAL: Email service not configured for production!');
}


/**
 * Send Password Reset Email - Customer
 * @param {string} email - Customer email
 * @param {string} resetToken - Password reset token
 * @param {number} port - Server port
 */
const sendCustomerPasswordResetEmail = async (email, resetToken, port = 5000) => {
  try {
    // Check if email service is properly configured
    if (!transporter) {
      console.error('❌ Email service not initialized');
      throw new Error('Email service is not configured');
    }

    const resetLink = `http://localhost:${port}/customer/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: emailUser || 'noreply@microfinance.com',
      to: email,
      subject: 'Password Reset Request - MicroFinance System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            
            <p style="color: #666; font-size: 14px;">
              We received a request to reset your password for your MicroFinance account.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              Click the button below to reset your password. This link will expire in 30 minutes.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;
                        display: inline-block;">
                Reset Your Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Or copy this link in your browser:
            </p>
            <p style="color: #2563eb; font-size: 12px; word-break: break-all;">
              ${resetLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request this password reset, please ignore this email or contact support.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              © 2024 MicroFinance System. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Request
        
        We received a request to reset your password. Click the link below to reset your password.
        This link will expire in 30 minutes.
        
        ${resetLink}
        
        If you didn't request this, please ignore this email.
      `
    };

    if (hasValidCredentials) {
      // Send real email
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to', email);
      console.log('📨 Message ID:', info.messageId);
      return { success: true, messageId: info.messageId, delivered: true };
    } else {
      // Test mode - show preview link in console
      console.log('\n⚠️  EMAIL DELIVERY TESTING MODE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 TEST PASSWORD RESET EMAIL');
      console.log('To: ' + email);
      console.log('Subject: Password Reset Request - MicroFinance System');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🔗 RESET LINK:');
      console.log(resetLink);
      console.log('\n📌 To send real emails:');
      console.log('1. Get Gmail App Password');
      console.log('2. Update .env: EMAIL_USER and EMAIL_PASSWORD');
      console.log('3. Restart server: npm run dev');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return { success: true, delivered: false, testMode: true, resetLink };
    }
  } catch (error) {
    console.error('❌ Error in password reset email:', error.message);
    console.log('📌 Configuration Status:', emailConfigStatus);
    throw error;
  }
};

/**
 * Send Password Reset Email - Admin
 * @param {string} email - Admin email
 * @param {string} resetToken - Password reset token
 * @param {number} port - Server port
 */
const sendAdminPasswordResetEmail = async (email, resetToken, port = 5000) => {
  try {
    // Check if email service is properly configured
    if (!transporter) {
      console.error('❌ Email service not initialized');
      throw new Error('Email service is not configured');
    }

    const resetLink = `http://localhost:${port}/admin/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: emailUser || 'noreply@microfinance.com',
      to: email,
      subject: 'Admin Password Reset Request - MicroFinance System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333; margin-top: 0;">Admin Password Reset Request</h2>
            
            <p style="color: #666; font-size: 14px;">
              We received a request to reset your admin password for the MicroFinance system.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              Click the button below to reset your password. This link will expire in 30 minutes.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;
                        display: inline-block;">
                Reset Your Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Or copy this link in your browser:
            </p>
            <p style="color: #dc2626; font-size: 12px; word-break: break-all;">
              ${resetLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request this password reset, please ignore this email or contact support immediately.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              © 2024 MicroFinance System. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Admin Password Reset Request
        
        We received a request to reset your admin password. Click the link below to reset your password.
        This link will expire in 30 minutes.
        
        ${resetLink}
        
        If you didn't request this, please ignore this email and contact support.
      `
    };

    if (hasValidCredentials) {
      // Send real email
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Admin password reset email sent to', email);
      console.log('📨 Message ID:', info.messageId);
      return { success: true, messageId: info.messageId, delivered: true };
    } else {
      // Test mode - show preview link in console
      console.log('\n⚠️  EMAIL DELIVERY TESTING MODE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 TEST ADMIN PASSWORD RESET EMAIL');
      console.log('To: ' + email);
      console.log('Subject: Admin Password Reset Request - MicroFinance System');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🔗 RESET LINK:');
      console.log(resetLink);
      console.log('\n📌 To send real emails:');
      console.log('1. Get Gmail App Password');
      console.log('2. Update .env: EMAIL_USER and EMAIL_PASSWORD');
      console.log('3. Restart server: npm run dev');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return { success: true, delivered: false, testMode: true, resetLink };
    }
  } catch (error) {
    console.error('❌ Error in admin password reset email:', error.message);
    console.log('📌 Configuration Status:', emailConfigStatus);
    throw error;
  }
};

/**
 * Verify email transporter connection
 */
const verifyEmailConfig = async () => {
  if (!transporter) {
    console.warn('⚠️  Email service not initialized');
    return false;
  }

  try {
    if (hasValidCredentials) {
      await transporter.verify();
      console.log('✅ Email service is configured and ready (Gmail SMTP)');
      console.log('   Sending emails to:', emailUser);
      return true;
    } else {
      console.log('⚠️  Email service in TEST MODE (no real emails will be sent)');
      console.log('   Provider: Ethereal (Test Email Service)');
      console.log('   To enable real Gmail emails:');
      console.log('   1. Visit https://myaccount.google.com/apppasswords');
      console.log('   2. Get Gmail App Password (16 characters)');
      console.log('   3. Update .env file:');
      console.log('      EMAIL_USER=your-gmail@gmail.com');
      console.log('      EMAIL_PASSWORD=app-password-here');
      console.log('   4. Restart server: npm run dev');
      return false;
    }
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.log('\n📌 Troubleshooting:');
    console.log('   - Check if EMAIL_USER and EMAIL_PASSWORD are set in .env');
    console.log('   - Verify Gmail App Password is correct (use exactly as provided)');
    console.log('   - Ensure 2-Step Verification is enabled on Gmail account');
    console.log('   - Restart server after updating .env: npm run dev');
    return false;
  }
};

/**
 * Get email configuration status
 */
const getEmailStatus = () => {
  return {
    ...emailConfigStatus,
    usingRealEmail: hasValidCredentials,
    testMode: !hasValidCredentials && process.env.NODE_ENV !== 'production'
  };
};

module.exports = {
  sendCustomerPasswordResetEmail,
  sendAdminPasswordResetEmail,
  verifyEmailConfig,
  getEmailStatus,
  transporter
};

