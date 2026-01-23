
export interface EncryptedPackage {
  ciphertext: string;
  iv: string;
  key: string;
  authTag: string; // Authenticated Encryption with Associated Data (AEAD)
  timestamp: number;
}

export interface EncodeResult {
  package: string;
  raw: EncryptedPackage;
}

export enum CryptoStatus {
  IDLE = 'IDLE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
