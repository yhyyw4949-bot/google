export interface FileValidationResult {
  isValid: boolean;
  mimeType?: string;
  extension?: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function validateReceiptFileBuffer(buffer: Buffer, declaredFilename: string): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, error: 'الملف فارغ، يرجى اختيار ملف صالح.' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (15 ميجابايت).' };
  }

  // 1. PNG: 89 50 4E 47
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { isValid: true, mimeType: 'image/png', extension: 'png' };
  }

  // 2. JPEG / JPG: Starts with FF D8
  if (
    buffer.length >= 2 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8
  ) {
    return { isValid: true, mimeType: 'image/jpeg', extension: 'jpg' };
  }

  // 3. WEBP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { isValid: true, mimeType: 'image/webp', extension: 'webp' };
  }

  // 4. PDF: %PDF
  if (
    buffer.length >= 4 &&
    buffer.subarray(0, 4).toString('ascii') === '%PDF'
  ) {
    return { isValid: true, mimeType: 'application/pdf', extension: 'pdf' };
  }

  // 5. HEIC / HEIF / AVIF (Apple iPhones / modern Androids): bytes 4-8 = ftyp
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buffer.subarray(8, 12).toString('ascii').toLowerCase();
    if (['heic', 'mif1', 'msf1', 'hevc', 'heix', 'avif'].includes(brand)) {
      return { isValid: true, mimeType: 'image/heic', extension: 'heic' };
    }
  }

  // 6. GIF: GIF87a or GIF89a
  if (buffer.length >= 3 && buffer.subarray(0, 3).toString('ascii') === 'GIF') {
    return { isValid: true, mimeType: 'image/gif', extension: 'gif' };
  }

  // 7. BMP: BM
  if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return { isValid: true, mimeType: 'image/bmp', extension: 'bmp' };
  }

  // 8. Fallback by declared filename extension for image/document formats
  const cleanFilename = (declaredFilename || '').toLowerCase().trim();
  const ext = cleanFilename.split('.').pop() || '';

  if (['jpg', 'jpeg'].includes(ext)) {
    return { isValid: true, mimeType: 'image/jpeg', extension: 'jpg' };
  }
  if (ext === 'png') {
    return { isValid: true, mimeType: 'image/png', extension: 'png' };
  }
  if (ext === 'webp') {
    return { isValid: true, mimeType: 'image/webp', extension: 'webp' };
  }
  if (ext === 'pdf') {
    return { isValid: true, mimeType: 'application/pdf', extension: 'pdf' };
  }
  if (['heic', 'heif'].includes(ext)) {
    return { isValid: true, mimeType: 'image/heic', extension: 'heic' };
  }

  return {
    isValid: false,
    error: 'صيغة الملف غير مدعومة. الصيغ المسموح بها: JPG, PNG, WebP, PDF, HEIC.',
  };
}
