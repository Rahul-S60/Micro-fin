/**
 * Test Email Script
 * Run with: node test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD || process.env.APP_PASSWORD;

console.log('🔍 Email Configuration Check:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('EMAIL_USER:', emailUser);
console.log('APP_PASSWORD:', emailPassword ? '✓ Set' : '✗ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!emailUser || !emailPassword) {
  console.error('\n❌ Missing email credentials!');
  console.error('Please set EMAIL_USER and APP_PASSWORD in .env file');
  process.exit(1);
}

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

// Test email options
const mailOptions = {
  from: emailUser,
  to: emailUser, // Send to yourself for testing
  subject: '📧 MicroFinance Email Test',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h2 style="color: #333;">Email Test Successful! ✅</h2>
        
        <p style="color: #666; font-size: 14px;">
          This is a test email from your MicroFinance System.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          If you're seeing this, your email service is working correctly!
        </p>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="color: #1976d2; font-weight: bold; margin: 0;">Configuration Details:</p>
          <p style="color: #666; font-size: 12px; margin: 10px 0;">
            <strong>Provider:</strong> Gmail SMTP<br>
            <strong>Time:</strong> ${new Date().toLocaleString()}<br>
            <strong>Status:</strong> Connected and Verified
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; margin-bottom: 0;">
          © 2024 MicroFinance System. All rights reserved.
        </p>
      </div>
    </div>
  `,
};

async function sendTestEmail() {
  try {
    console.log('\n📤 Attempting to send email...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Verify connection first
    console.log('\n🔗 Verifying Gmail connection...');
    await transporter.verify();
    console.log('✅ Gmail connection verified!');
    
    // Send the test email
    console.log('\n📨 Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ Email sent successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Message ID:', info.messageId);
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('\n📧 Check your inbox for the test email!');
    
  } catch (error) {
    console.error('\n❌ Error sending email:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔧 Authentication Failed! Try these steps:');
      console.error('1. Visit: https://myaccount.google.com/apppasswords');
      console.error('2. Generate a new App Password (16 characters)');
      console.error('3. Remove all spaces from the app password');
      console.error('4. Update APP_PASSWORD in .env file');
      console.error('5. Run this script again: node test-email.js');
    } else if (error.code === 'ESOCKET') {
      console.error('\n🔧 Network Error! Try these steps:');
      console.error('1. Check your internet connection');
      console.error('2. Verify Gmail SMTP port 465 is accessible');
      console.error('3. Check if firewall/antivirus is blocking the connection');
    }
  }
}

sendTestEmail();