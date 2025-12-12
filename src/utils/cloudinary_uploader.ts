/**
 * Uploads a file to Cloudinary using signed upload parameters
 * @param fileUri - Local file URI (from image picker or camera)
 * @param uploadUrl - Cloudinary upload URL
 * @param params - Signed upload parameters (timestamp, signature, api_key, folder)
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
  }
): Promise<string> {
  try {
    // Get file extension from URI
    const fileExtension = fileUri.split('.').pop() || 'jpg';
    const fileName = `file_${Date.now()}.${fileExtension}`;

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

    // Upload to Cloudinary
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let fetch set it with boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
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
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
}

