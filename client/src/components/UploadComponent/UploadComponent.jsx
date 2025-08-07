import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const UploadComponent = ({ onChange, maxCount = 8, fileList = [], ...props }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      
      const response = await axios.post(
        process.env.REACT_APP_CLOUDINARY_UPLOAD_URL,
        formData
      );

      onSuccess(response.data.secure_url);
      
      if (onChange) {
        onChange({
          file: {
            ...file,
            status: 'done',
            url: response.data.secure_url
          },
          fileList: [...fileList, {
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: response.data.secure_url
          }]
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Lỗi khi tải ảnh lên: ' + error.message);
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Upload
      customRequest={handleUpload}
      accept="image/*"
      listType="picture"
      maxCount={maxCount}
      fileList={fileList}
      {...props}
    >
      <button disabled={uploading || fileList.length >= maxCount}>
        <UploadOutlined /> {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
      </button>
    </Upload>
  );
};

export default UploadComponent;
