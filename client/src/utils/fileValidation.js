import { triggerToast } from '../components/common/ToastNotifier';

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Validates that an image or attachment file does not exceed the 50 MB server limit.
 * Automatically triggers a modern floating toast notification if invalid.
 * @param {File} file - The file object to validate.
 * @param {number} [maxSizeBytes=MAX_FILE_SIZE_BYTES] - Maximum size limit in bytes (default 50MB).
 * @returns {{ valid: boolean, message?: string }}
 */
export const validateImageFileSize = (file, maxSizeBytes = MAX_FILE_SIZE_BYTES) => {
  if (!file) return { valid: true };

  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const limitInMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    const message = `File size (${sizeInMB} MB) exceeds the ${limitInMB} MB server limit. Please select a smaller file.`;
    
    // Automatically trigger custom floating toast notification (no native browser alert!)
    triggerToast(message, 'error');

    return {
      valid: false,
      message
    };
  }

  return { valid: true };
};
