import React, { useEffect, useState } from 'react';
import { Button, Upload, Input, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as UserServices from '../../services/UserServices';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState('');

    // Fetch user details on initial load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    message.error('Please log in first.');
                    navigate('/sign-in');  // Redirect to login page if not logged in
                    return;
                }

                const decoded = jwtDecode(token);
                if (decoded?.id) {
                    const res = await UserServices.getDetailUser(decoded.id, token);
                    setUser(res.data);
                    setName(res.data.name);
                    setEmail(res.data.email);
                    setAddress(res.data.address);
                    setPhone(res.data.phone);
                    setAvatar(res.data.avatar);
                }
            } catch (error) {
                message.error('Failed to load user data.');
            }
        };

        fetchUser();
    }, [navigate]);

    // Handle profile update
    const handleUpdate = async () => {
        setLoading(true);
        try {
            const updatedUser = { name, email, address, phone, avatar, isProfileUpdated: true };
            const res = await UserServices.updateUser(user._id, updatedUser, localStorage.getItem('access_token'));
            if (res) {
                message.success('User updated successfully!');
                // Update local state without re-fetching data
                setUser(prevUser => ({ ...prevUser, name, email, address, phone, avatar }));
            }
        } catch (error) {
            message.error(error?.response?.data?.message || 'Failed to update user.');
        } finally {
            setLoading(false);
            navigate('/');  // Redirect to home page after successful update
        }
    };

    // Handle avatar change
    const handleAvatarChange = async ({ fileList }) => {
        const file = fileList[0];
        if (file && file.originFileObj) {
            const base64 = await getBase64(file.originFileObj);
            setAvatar(base64);  // Set the base64 string for avatar
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Profile</h2>
            <div style={{ marginBottom: '10px' }}>
                <label>Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Avatar</label>
                <Upload
                    action="http://localhost:3001/api/upload"  // Adjust the backend URL as necessary
                    listType="picture-card"
                    onChange={handleAvatarChange}
                    showUploadList={false}  // Hide default upload list
                >
                    <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
                {avatar && (
                    <img
                        src={avatar}
                        alt="avatar"
                        style={{
                            height: '60px',
                            width: '60px',
                            borderRadius: '50%',
                            marginTop: '10px',
                            objectFit: 'cover',
                        }}
                    />
                )}
            </div>
            <Button type="primary" onClick={handleUpdate} loading={loading} style={{ marginTop: '20px' }}>
                Update Profile
            </Button>
        </div>
    );
};

// Utility function to convert file to Base64
const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export default ProfilePage;
