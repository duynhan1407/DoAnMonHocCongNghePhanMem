import { useState } from 'react';
import axios from 'axios';

const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (file, access_token) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:3000/api/upload', formData, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setIsUploading(false);
            return response.data;
        } catch (error) {
            setIsUploading(false);
            throw new Error(error.response?.data?.message || 'File upload failed');
        }
    };

    return { uploadFile, isUploading };
};

export default useFileUpload;
