export interface FileValidationResult {
  isValid: boolean;
  mimeType?: string;
  extension?: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateReceiptFileBuffer(buffer: Buffer, declaredFilename: string): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, error: 'File is empty.' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'File exceeds maximum allowed size of 5MB.' };
  }

  // Check magic bytes
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, mimeType: 'image/png', extension: 'png' };
  }

  // JPEG / JPG: FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { isValid: true, mimeType: 'image/jpeg', extension: 'jpg' };
  }

  // WEBP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { isValid: true, mimeType: 'image/webp', extension: 'webp' };
  }

  // PDF: %PDF
  if (
    buffer.length >= 4 &&
    buffer.subarray(0, 4).toString('ascii') === '%PDF'
  ) {
    return { isValid: true, mimeType: 'application/pdf', extension: 'pdf' };
  }

  return {
    isValid: false,
    error: 'Invalid file format. Supported file types are JPG, PNG, WebP, and PDF only.',
  };
}
