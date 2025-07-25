import axios from 'axios';

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to be uploaded
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file) => {
    const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_UPLOAD_URL;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    try {
        // Create a FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset); // Use the preset configured in Cloudinary

        // Make the POST request to Cloudinary
        const response = await axios.post(cloudinaryUrl, formData);

        if (response?.data?.secure_url) {
            return response.data.secure_url; // Return the URL of the uploaded image
        } else {
            throw new Error('Failed to upload image to Cloudinary.');
        }
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};
