import axios from 'axios';
import { configLoader } from './config/loader';
import { IImgBBConfig } from './config/types';

// Get ImgBB configuration from centralized config
/**
 * ImgBB configuration and image upload functionality
 * Handles image uploads to ImgBB service using configured credentials
 */

// Get ImgBB configuration for the current request
const getImgBBConfig = async (): Promise<IImgBBConfig> => {
  const config = await configLoader.loadConfig();
  return config.imgbb;
};

export async function uploadImage(base64Image: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', base64Image);

    // Get current configuration
    const { apiKey, apiUrl } = await getImgBBConfig();
    
    const response = await axios.post(`${apiUrl}?key=${apiKey}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.data.url;
    } else {
      throw new Error('Failed to upload image to ImgBB');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
