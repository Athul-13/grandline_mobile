/**
 * Validates file before upload
 * @param fileUri - Local file URI to validate
 * @returns Error message if invalid, null if valid
 */
function validateFileBeforeUpload(fileUri: string): string | null {
  if (!fileUri || !fileUri.trim()) {
    return 'File URI is required';
  }

  // Check if it's a valid file URI format
  if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://') && !fileUri.startsWith('ph://')) {
    return 'Invalid file URI format';
  }

  // Check file extension
  const fileExtension = fileUri.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return `Invalid file format. Allowed formats: ${allowedExtensions.join(', ')}`;
  }

  return null;
}

/**
 * Uploads a file to Cloudinary using signed upload parameters with retry logic
 * @param fileUri - Local file URI (from image picker or camera)
 * @param uploadUrl - Cloudinary upload URL
 * @param params - Signed upload parameters (timestamp, signature, api_key, folder)
 * @param retries - Number of retry attempts (default: 2)
 * @returns The uploaded file URL from Cloudinary
 */
export async function uploadFileToCloudinary(
  fileUri: string,
  uploadUrl: string,
  params: {
    timestamp: number;
    signature: string;
    api_key: string;
    folder: string;
  },
  retries: number = 2
): Promise<string> {
  // Validate file before upload
  const validationError = validateFileBeforeUpload(fileUri);
  if (validationError) {
    throw new Error(validationError);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Get file extension from URI
      const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `file_${Date.now()}_${attempt}.${fileExtension}`;

      // Create form data for React Native
      const formData = new FormData();
      
      // Append file - React Native FormData handles file URIs directly
      formData.append('file', {
        uri: fileUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);

      // Append signed parameters
      formData.append('timestamp', params.timestamp.toString());
      formData.append('signature', params.signature);
      formData.append('api_key', params.api_key);
      formData.append('folder', params.folder);

      // Upload to Cloudinary with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          // Don't set Content-Type header - let fetch set it with boundary
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Upload failed: ${response.status}`;
          
          // Provide user-friendly error messages
          if (response.status === 400) {
            errorMessage = 'Invalid file format or size. Please try a different image.';
          } else if (response.status === 401) {
            errorMessage = 'Upload authorization failed. Please try again.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error during upload. Please try again.';
          } else {
            errorMessage = `Upload failed: ${errorText || 'Unknown error'}`;
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();

        // Extract secure URL from Cloudinary response
        if (result.secure_url) {
          return result.secure_url;
        }

        if (result.url) {
          return result.url;
        }

        throw new Error('Cloudinary response missing URL');
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Upload timeout. Please check your connection and try again.');
        }
        throw fetchError;
      }
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on validation errors or client errors (4xx)
      if (error?.message?.includes('Invalid') || error?.message?.includes('required')) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === retries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`Upload attempt ${attempt + 1} failed, retrying...`, error.message);
    }
  }

  // If we get here, all retries failed
  const finalError = lastError || new Error('Upload failed after multiple attempts');
  console.error('Error uploading file to Cloudinary after retries:', finalError);
  throw finalError;
}

