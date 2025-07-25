import React, { useState } from 'react';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

const UploadComponent = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý khi chọn tệp
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Xử lý upload tệp lên Cloudinary
  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file.');
      return;
    }
    setLoading(true);
    setMessage('Uploading...');
    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      setMessage('File uploaded successfully!');
    } catch (error) {
      setMessage('Error uploading file.');
      if (error.response) {
        setMessage(`Error: ${error.response.data?.error?.message || error.response.data?.message || 'Unknown error'}`);
        console.error('Cloudinary error:', error.response.data);
      } else {
        console.error('Upload error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      <p>{message}</p>
      {imageUrl && (
        <div>
          <p>Image URL:</p>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">{imageUrl}</a>
          <br />
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: 300, marginTop: 10 }} />
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
