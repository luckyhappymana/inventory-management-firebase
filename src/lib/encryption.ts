import { bytesToBase64, base64ToBytes } from '../utils/base64';

// Use Web Crypto API for encryption/decryption
const ENCRYPTION_KEY = 'inventory-management-system-2025';
const SALT = new Uint8Array([
  0x63, 0x72, 0x79, 0x70, 0x74, 0x6f, 0x67, 0x72,
  0x61, 0x70, 0x68, 0x69, 0x63, 0x73, 0x61, 0x6c
]);

async function getKey(): Promise<CryptoKey> {
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ENCRYPTION_KEY),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: SALT,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('Key derivation failed:', error);
    throw new Error('暗号化キーの生成に失敗しました');
  }
}

export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getKey();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const encryptedArray = new Uint8Array(encryptedData);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);

    // Convert to base64
    return bytesToBase64(combined);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('データの暗号化に失敗しました');
  }
}

export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const key = await getKey();
    
    // Convert base64 to array
    const combined = base64ToBytes(encryptedData);
    
    // Extract IV and data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );

    // Convert decrypted data back to string
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('データの復号化に失敗しました');
  }
}