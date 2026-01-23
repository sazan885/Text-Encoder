
import { EncryptedPackage, EncodeResult } from '../types';

/**
 * Service providing high-level cryptographic operations using the Web Crypto API.
 * Now supports a "Special Access Key" for multi-factor encryption.
 */
export class CryptoService {
  private static ALGO = 'AES-GCM';
  private static PBKDF2_ITERATIONS = 100000;
  // Fixed salt for the PBKDF2 derivation (in a production app, this could be per-package)
  private static SALT = new TextEncoder().encode('dynamic-crypto-salt-v1');

  /**
   * Derives a 256-bit key from a user-provided password/string.
   */
  private static async deriveKeyBits(password: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: this.SALT,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      passwordKey,
      256
    );

    return new Uint8Array(derivedBits);
  }

  /**
   * Blends two 256-bit keys using bitwise XOR.
   */
  private static xorKeys(key1: Uint8Array, key2: Uint8Array): Uint8Array {
    const result = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      result[i] = key1[i] ^ key2[i];
    }
    return result;
  }

  /**
   * Encodes data by generating a unique dynamic key and blending it with the specialKey.
   */
  static async encode(data: string, specialKey: string): Promise<EncodeResult> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    // 1. Generate the Dynamic Key (Part A)
    const dynamicKeyRaw = window.crypto.getRandomValues(new Uint8Array(32));
    
    // 2. Derive the Special Key Bits (Part B)
    const specialKeyBits = await this.deriveKeyBits(specialKey);

    // 3. Blend them to create the Final Encryption Key
    const finalKeyBits = this.xorKeys(dynamicKeyRaw, specialKeyBits);

    // 4. Encrypt with the Final Key
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      finalKeyBits,
      this.ALGO,
      false,
      ['encrypt']
    );

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: this.ALGO, iv },
      cryptoKey,
      encodedData
    );

    const packageData: EncryptedPackage = {
      ciphertext: this.bufferToBase64(ciphertextBuffer),
      iv: this.bufferToBase64(iv),
      key: this.bufferToBase64(dynamicKeyRaw), // Store only the random part
      authTag: 'AES-GCM-Integrated',
      timestamp: Date.now()
    };

    // Obfuscation Layer
    const serializedPackage = btoa(JSON.stringify(packageData));

    return {
      package: serializedPackage,
      raw: packageData
    };
  }

  /**
   * Decodes a bundle by blending the bundled dynamic key with the user-provided specialKey.
   */
  static async decode(bundle: string, specialKey: string): Promise<string> {
    try {
      const jsonStr = atob(bundle);
      const pkg: EncryptedPackage = JSON.parse(jsonStr);

      // 1. Get Dynamic Key from package
      const dynamicKeyRaw = this.base64ToBuffer(pkg.key);

      // 2. Re-derive the Special Key Bits from user input
      const specialKeyBits = await this.deriveKeyBits(specialKey);

      // 3. Re-blend to get the Final Key
      const finalKeyBits = this.xorKeys(dynamicKeyRaw, specialKeyBits);

      // 4. Import and Decrypt
      const ivBuffer = this.base64ToBuffer(pkg.iv);
      const ciphertextBuffer = this.base64ToBuffer(pkg.ciphertext);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        finalKeyBits,
        this.ALGO,
        false,
        ['decrypt']
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: this.ALGO, iv: ivBuffer },
        cryptoKey,
        ciphertextBuffer
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
      throw new Error("Invalid Special Key or tampered package. Decryption failed.");
    }
  }

  private static bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
