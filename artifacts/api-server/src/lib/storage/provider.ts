export interface SaveResult {
  path: string;
  url: string;
  size: number;
}

export interface StorageProvider {
  save(key: string, data: Buffer, mime: string): Promise<SaveResult>;
  url(path: string): string;
  delete(path: string): Promise<void>;
}
