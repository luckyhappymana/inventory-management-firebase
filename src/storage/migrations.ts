import { STORAGE_VERSION } from './config';

interface StorageMetadata {
  version: string;
  lastUpdated: string;
}

export function initializeStorage(): void {
  const metadata = localStorage.getItem('storage_metadata');
  
  if (!metadata) {
    const newMetadata: StorageMetadata = {
      version: STORAGE_VERSION,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('storage_metadata', JSON.stringify(newMetadata));
  }
}