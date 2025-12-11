import { createTransport } from 'nodemailer';

// Create transporter
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email, otp, name = 'User') => {
  const mailOptions = {
    from: `"PhoneBid Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your PhoneBid Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verification Code</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Your verification code for PhoneBid Marketplace is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>PhoneBid Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PhoneBid Marketplace. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"PhoneBid Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to PhoneBid Marketplace!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to PhoneBid!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Welcome to PhoneBid Marketplace - where you can buy and sell phones anonymously!</p>
            <p><strong>What you can do:</strong></p>
            <ul>
              <li>Browse phones and place bids anonymously</li>
              <li>List your phones for auction</li>
              <li>Manage your wallet and transactions</li>
              <li>Complete KYC verification</li>
            </ul>
            <p>Your identity is protected with anonymous IDs throughout the platform.</p>
            <a href="${process.env.CLIENT_URL}/marketplace" class="button">Start Browsing</a>
            <p>Best regards,<br>PhoneBid Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken, name) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"PhoneBid Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - PhoneBid',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy this link: ${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>PhoneBid Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Password reset email error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send bid acceptance notification email
 */
export const sendBidAcceptanceEmail = async (email, name, phoneDetails, bidAmount) => {
  const dashboardUrl = `${process.env.CLIENT_URL}/dashboard`;
  
  const mailOptions = {
    from: `"PhoneBid Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Your Bid Has Been Accepted! - PhoneBid',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .price { font-size: 32px; font-weight: bold; color: #10b981; }
          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          ul { padding-left: 20px; }
          li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="font-size: 18px; margin: 10px 0;">Your Bid Has Been Accepted</p>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>Great news! The seller has accepted your bid. You are now the winner of this auction!</p>
            
            <div class="highlight-box">
              <h3 style="margin-top: 0; color: #10b981;">📱 Phone Details</h3>
              <p><strong>Phone:</strong> ${phoneDetails.brand} ${phoneDetails.model}</p>
              <p><strong>Storage:</strong> ${phoneDetails.storage}</p>
              <p><strong>Condition:</strong> ${phoneDetails.condition}</p>
              <p><strong>Your Winning Bid:</strong></p>
              <div class="price">₹${bidAmount.toLocaleString()}</div>
            </div>
            
            <div class="warning-box">
              <h3 style="margin-top: 0; color: #f59e0b;">⚠️ Important - Next Steps</h3>
              <p><strong>You need to pay an initial deposit of ₹2,000 to the admin within 24 hours.</strong></p>
              <p>This deposit secures your purchase and will be adjusted in your final payment.</p>
            </div>
            
            <h3>📋 What Happens Next:</h3>
            <ul>
              <li><strong>Step 1:</strong> Pay ₹2,000 deposit to admin within 24 hours</li>
              <li><strong>Step 2:</strong> Admin will verify the payment</li>
              <li><strong>Step 3:</strong> You'll receive further instructions about phone inspection and final payment</li>
              <li><strong>Step 4:</strong> Complete the transaction and receive your phone</li>
            </ul>
            
            <h3>💰 Payment Details:</h3>
            <p>Please check your dashboard for payment instructions and admin contact details.</p>
            
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>The deposit must be paid within 24 hours to secure your purchase</li>
              <li>Failure to pay within 24 hours may result in cancellation</li>
              <li>Keep all transaction receipts for your records</li>
              <li>Contact admin if you have any questions</li>
            </ul>
            
            <p>Thank you for using PhoneBid Marketplace!</p>
            
            <p>Best regards,<br><strong>PhoneBid Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PhoneBid Marketplace. All rights reserved.</p>
            <p>This is an automated email. For support, please contact admin through the platform.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Bid acceptance email error:', error);
    throw new Error('Failed to send bid acceptance email');
  }
};

/**
 * Send bid acceptance notification email to SELLER
 */
export const sendBidAcceptanceEmailToSeller = async (email, name, phoneDetails, bidAmount, buyerAnonymousId) => {
  const dashboardUrl = `${process.env.CLIENT_URL}/dashboard`;
  
  const mailOptions = {
    from: `"PhoneBid Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Phone Has Been Sold! - PhoneBid',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #c4ff0d 0%, #a3e635 100%); color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight-box { background: white; border-left: 4px solid #c4ff0d; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .price { font-size: 32px; font-weight: bold; color: #16a34a; }
          .info-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #1a1a1a; color: #c4ff0d; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          ul { padding-left: 20px; }
          li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Phone Has Been Sold!</h1>
            <p style="font-size: 18px; margin: 10px 0;">Congratulations on your successful sale</p>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>Great news! You have successfully accepted a bid and sold your phone on PhoneBid Marketplace.</p>
            
            <div class="highlight-box">
              <h3 style="margin-top: 0; color: #16a34a;">Phone Sold</h3>
              <p><strong>Phone:</strong> ${phoneDetails.brand} ${phoneDetails.model}</p>
              <p><strong>Storage:</strong> ${phoneDetails.storage}</p>
              <p><strong>Condition:</strong> ${phoneDetails.condition}</p>
              <p><strong>Sold For:</strong></p>
              <div class="price">Rs. ${bidAmount.toLocaleString()}</div>
              <p style="margin-top: 10px;"><strong>Buyer ID:</strong> ${buyerAnonymousId}</p>
            </div>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #10b981;">What Happens Next</h3>
              <p>The buyer has been notified and will pay an initial deposit of Rs. 2,000 to the admin within 24 hours.</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ul>
              <li><strong>Step 1:</strong> Wait for buyer's deposit confirmation from admin</li>
              <li><strong>Step 2:</strong> Admin will coordinate the phone inspection</li>
              <li><strong>Step 3:</strong> After successful inspection, buyer completes payment</li>
              <li><strong>Step 4:</strong> You'll receive your payment (minus platform fees)</li>
            </ul>
            
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Keep your phone in the same condition as listed</li>
              <li>Be available for the inspection process</li>
              <li>Admin will contact you with further instructions</li>
            </ul>
            
            <p>Thank you for selling on PhoneBid Marketplace!</p>
            
            <p>Best regards,<br><strong>PhoneBid Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PhoneBid Marketplace. All rights reserved.</p>
            <p>This is an automated email. For support, please contact admin through the platform.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Seller bid acceptance email error:', error);
    throw new Error('Failed to send seller notification email');
  }
};

export default {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBidAcceptanceEmail,
  sendBidAcceptanceEmailToSeller
};
