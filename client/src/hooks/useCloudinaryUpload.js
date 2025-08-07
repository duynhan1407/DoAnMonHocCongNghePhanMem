import axios from 'axios';
import { message } from 'antd';

const useCloudinaryUpload = () => {
  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      
      const response = await axios.post(
        process.env.REACT_APP_CLOUDINARY_UPLOAD_URL,
        formData
      );

      return response.data.secure_url;
    } catch (error) {
      message.error('Lỗi khi tải ảnh lên: ' + error.message);
      throw error;
    }
  };

  const uploadMultipleImages = async (files) => {
    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      message.error('Lỗi khi tải nhiều ảnh lên: ' + error.message);
      throw error;
    }
  };

  return { uploadToCloudinary, uploadMultipleImages };
};

export default useCloudinaryUpload;
