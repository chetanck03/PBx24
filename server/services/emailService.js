import nodemailer from 'nodemailer';

// Create transporter with Gmail
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  console.log('[EMAIL] Gmail transporter initialized');
  return transporter;
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email, otp, name = 'User') => {
  console.log(`[EMAIL] Sending OTP to: ${email}`);
  
  try {
    const transport = getTransporter();
    
    await transport.sendMail({
      from: `"PhoneBid" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${otp} is your PhoneBid verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; color: #c4ff0d; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">PhoneBid</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Verification Code</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 15px 0;">Hi <strong>${name}</strong>,</p>
            <p style="margin: 0 0 20px 0; color: #666;">Use this code to verify your account:</p>
            <div style="background: #fff; border: 3px solid #c4ff0d; padding: 25px; text-align: center; margin: 20px 0; border-radius: 10px;">
              <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #1a1a1a;">${otp}</span>
            </div>
            <p style="margin: 20px 0 0 0; padding: 15px; background: #fff3cd; border-radius: 5px; color: #856404;">
              <strong>⏰ Expires in 10 minutes</strong>
            </p>
          </div>
        </div>
      `
    });

    console.log('[EMAIL] OTP sent successfully');
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send OTP:', error.message);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"PhoneBid" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to PhoneBid Marketplace!',
      html: `<div style="font-family: Arial;"><h1>Welcome ${name}!</h1><p>Thanks for joining PhoneBid.</p></div>`
    });
    console.log('[EMAIL] Welcome email sent');
  } catch (error) {
    console.error('[EMAIL] Welcome email failed:', error.message);
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken, name) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"PhoneBid" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your PhoneBid Password',
      html: `<div style="font-family: Arial;"><h1>Password Reset</h1><p>Hi ${name},</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>Expires in 1 hour.</p></div>`
    });
    console.log('[EMAIL] Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Password reset failed:', error.message);
    throw error;
  }
};

/**
 * Send bid acceptance email to buyer
 */
export const sendBidAcceptanceEmail = async (email, name, phoneDetails, bidAmount) => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"PhoneBid" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Your Bid Has Been Accepted! - PhoneBid',
      html: `<div style="font-family: Arial;"><h1>Congratulations ${name}!</h1><p>Your bid of ₹${bidAmount.toLocaleString()} for ${phoneDetails.brand} ${phoneDetails.model} has been accepted!</p></div>`
    });
    console.log('[EMAIL] Bid acceptance email sent');
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Bid acceptance failed:', error.message);
    throw error;
  }
};

/**
 * Send bid acceptance email to seller
 */
export const sendBidAcceptanceEmailToSeller = async (email, name, phoneDetails, bidAmount, buyerAnonymousId) => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"PhoneBid" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '💰 Your Phone Has Been Sold! - PhoneBid',
      html: `<div style="font-family: Arial;"><h1>Phone Sold!</h1><p>Hi ${name}, your ${phoneDetails.brand} ${phoneDetails.model} sold for ₹${bidAmount.toLocaleString()} to buyer ${buyerAnonymousId}.</p></div>`
    });
    console.log('[EMAIL] Seller notification sent');
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Seller notification failed:', error.message);
    throw error;
  }
};

export default {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBidAcceptanceEmail,
  sendBidAcceptanceEmailToSeller
};
