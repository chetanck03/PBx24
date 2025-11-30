import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment variable
 * @returns {Buffer} Encryption key
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  if (key.length !== KEY_LENGTH * 2) { // Hex string is 2x the byte length
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH * 2} characters (${KEY_LENGTH} bytes in hex)`);
  }
  
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param {string} text - Plaintext to encrypt
 * @returns {string} Encrypted text in format: {iv}:{authTag}:{encryptedData}
 */
export function encrypt(text) {
  if (!text) {
    return text;
  }
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted text using AES-256-GCM
 * @param {string} encryptedText - Encrypted text in format: {iv}:{authTag}:{encryptedData}
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedText) {
  if (!encryptedText) {
    return encryptedText;
  }
  
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a unique anonymous ID with specified prefix
 * @param {string} prefix - Prefix for the ID (e.g., 'USER', 'SELLER', 'BIDDER')
 * @param {number} length - Length of random part (default: 8)
 * @returns {string} Anonymous ID in format: PREFIX_XXXXXXXX
 */
export function generateAnonymousId(prefix = 'USER', length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = crypto.randomBytes(length);
  
  let randomPart = '';
  for (let i = 0; i < length; i++) {
    randomPart += characters[randomBytes[i] % characters.length];
  }
  
  return `${prefix}_${randomPart}`;
}

/**
 * Generate a secure encryption key (for initial setup)
 * This should be run once and stored in environment variables
 * @returns {string} Hex-encoded encryption key
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Validate encryption key format
 * @param {string} key - Encryption key to validate
 * @returns {boolean} True if valid
 */
export function validateEncryptionKey(key) {
  if (!key) {
    return false;
  }
  
  if (key.length !== KEY_LENGTH * 2) {
    return false;
  }
  
  // Check if valid hex string
  return /^[0-9a-f]+$/i.test(key);
}

/**
 * Check if encryption is properly configured
 * @returns {boolean} True if encryption is ready to use
 */
export function isEncryptionConfigured() {
  try {
    const key = process.env.ENCRYPTION_KEY;
    return validateEncryptionKey(key);
  } catch {
    return false;
  }
}

export default {
  encrypt,
  decrypt,
  generateAnonymousId,
  generateEncryptionKey,
  validateEncryptionKey,
  isEncryptionConfigured
};
