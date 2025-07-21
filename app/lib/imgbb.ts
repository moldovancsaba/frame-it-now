import axios from 'axios';

const IMGBB_API_KEY = '9285b95f2c425d764a48cf047e772c1f';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export async function uploadImage(base64Image: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', base64Image);

    const response = await axios.post(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, formData, {
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
