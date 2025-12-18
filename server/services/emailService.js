import { Resend } from 'resend';

// Initialize Resend client
let resend = null;

const getResendClient = () => {
  if (resend) return resend;
  
  if (!process.env.RESEND_API_KEY) {
    console.error('[EMAIL] RESEND_API_KEY not set');
    throw new Error('Email service not configured: RESEND_API_KEY missing');
  }
  
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('[EMAIL] Resend client initialized');
  return resend;
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (email, otp, name = 'User') => {
  console.log(`[EMAIL] Sending OTP to: ${email}`);
  
  try {
    const client = getResendClient();
    
    const { data, error } = await client.emails.send({
      from: 'PhoneBid <onboarding@resend.dev>',
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
            <p style="margin: 20px 0 0 0; color: #999; font-size: 12px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
            © ${new Date().getFullYear()} PhoneBid Marketplace
          </p>
        </div>
      `
    });

    if (error) {
      console.error('[EMAIL] Resend error:', error);
      throw new Error(error.message);
    }

    console.log('[EMAIL] OTP sent successfully, ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[EMAIL] Failed to send OTP:', error.message);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, name) => {
  console.log(`[EMAIL] Sending welcome email to: ${email}`);
  
  try {
    const client = getResendClient();
    
    const { data, error } = await client.emails.send({
      from: 'PhoneBid <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to PhoneBid Marketplace!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; color: #c4ff0d; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 Welcome to PhoneBid!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Welcome to PhoneBid Marketplace - where you can buy and sell phones anonymously!</p>
            <p><strong>What you can do:</strong></p>
            <ul>
              <li>Browse phones and place bids anonymously</li>
              <li>List your phones for auction</li>
              <li>Your identity is protected with anonymous IDs</li>
            </ul>
            <p>Best regards,<br><strong>PhoneBid Team</strong></p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('[EMAIL] Welcome email error:', error);
    } else {
      console.log('[EMAIL] Welcome email sent, ID:', data?.id);
    }
  } catch (error) {
    console.error('[EMAIL] Welcome email failed:', error.message);
    // Don't throw - welcome email is not critical
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken, name) => {
  console.log(`[EMAIL] Sending password reset to: ${email}`);
  
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  try {
    const client = getResendClient();
    
    const { data, error } = await client.emails.send({
      from: 'PhoneBid <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your PhoneBid Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; color: #c4ff0d; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🔑 Password Reset</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #c4ff0d; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666;"><strong>This link expires in 1 hour.</strong></p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('[EMAIL] Password reset error:', error);
      throw new Error(error.message);
    }

    console.log('[EMAIL] Password reset email sent, ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[EMAIL] Password reset failed:', error.message);
    throw error;
  }
};

/**
 * Send bid acceptance email to buyer
 */
export const sendBidAcceptanceEmail = async (email, name, phoneDetails, bidAmount) => {
  console.log(`[EMAIL] Sending bid acceptance to buyer: ${email}`);
  
  try {
    const client = getResendClient();
    
    const { data, error } = await client.emails.send({
      from: 'PhoneBid <onboarding@resend.dev>',
      to: email,
      subject: '🎉 Your Bid Has Been Accepted! - PhoneBid',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0;">Your Bid Has Been Accepted</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Great news! The seller has accepted your bid.</p>
            <div style="background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${phoneDetails.brand} ${phoneDetails.model}</p>
              <p style="margin: 0 0 10px 0;"><strong>Storage:</strong> ${phoneDetails.storage}</p>
              <p style="margin: 0 0 10px 0;"><strong>Condition:</strong> ${phoneDetails.condition}</p>
              <p style="margin: 0;"><strong>Your Winning Bid:</strong></p>
              <p style="font-size: 28px; font-weight: bold; color: #10b981; margin: 5px 0;">₹${bidAmount.toLocaleString()}</p>
            </div>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0;"><strong>⚠️ Next Step:</strong> Pay ₹2,000 deposit to admin within 24 hours.</p>
            </div>
            <p>Best regards,<br><strong>PhoneBid Team</strong></p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('[EMAIL] Bid acceptance error:', error);
      throw new Error(error.message);
    }

    console.log('[EMAIL] Bid acceptance email sent, ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[EMAIL] Bid acceptance failed:', error.message);
    throw error;
  }
};

/**
 * Send bid acceptance email to seller
 */
export const sendBidAcceptanceEmailToSeller = async (email, name, phoneDetails, bidAmount, buyerAnonymousId) => {
  console.log(`[EMAIL] Sending sale notification to seller: ${email}`);
  
  try {
    const client = getResendClient();
    
    const { data, error } = await client.emails.send({
      from: 'PhoneBid <onboarding@resend.dev>',
      to: email,
      subject: '💰 Your Phone Has Been Sold! - PhoneBid',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #c4ff0d 0%, #a3e635 100%); color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">💰 Phone Sold!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Congratulations! Your phone has been sold.</p>
            <div style="background: white; border-left: 4px solid #c4ff0d; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${phoneDetails.brand} ${phoneDetails.model}</p>
              <p style="margin: 0 0 10px 0;"><strong>Storage:</strong> ${phoneDetails.storage}</p>
              <p style="margin: 0;"><strong>Sold For:</strong></p>
              <p style="font-size: 28px; font-weight: bold; color: #16a34a; margin: 5px 0;">₹${bidAmount.toLocaleString()}</p>
              <p style="margin: 10px 0 0 0;"><strong>Buyer ID:</strong> ${buyerAnonymousId}</p>
            </div>
            <p>The buyer will pay a deposit within 24 hours. Admin will contact you with next steps.</p>
            <p>Best regards,<br><strong>PhoneBid Team</strong></p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('[EMAIL] Seller notification error:', error);
      throw new Error(error.message);
    }

    console.log('[EMAIL] Seller notification sent, ID:', data?.id);
    return { success: true, id: data?.id };
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
