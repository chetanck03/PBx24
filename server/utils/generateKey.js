import { generateEncryptionKey } from '../services/encryptionService.js';

/**
 * Utility script to generate a new encryption key
 * Run with: node utils/generateKey.js
 */

console.log('\n🔐 Generating new encryption key...\n');
const key = generateEncryptionKey();
console.log('Your new encryption key:');
console.log(key);
console.log('\n⚠️  IMPORTANT: Store this key securely in your .env file as ENCRYPTION_KEY');
console.log('⚠️  Never commit this key to version control!');
console.log('⚠️  If you lose this key, you will not be able to decrypt existing data!\n');
