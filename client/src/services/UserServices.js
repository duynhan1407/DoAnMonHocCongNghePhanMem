import { message } from "antd";
import { baseGet, basePost, basePut, baseDelete } from "./baseService";

// Hàm decode payload của JWT
export const decodeJwtPayload = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

// API đăng nhập người dùng
export const loginUser = async (data) => {
    const res = await basePost(`/api/user/sign-in`, data);
    // Lưu access_token và thông tin user vào localStorage
    if (res?.access_token) {
        localStorage.setItem('access_token', res.access_token);
        // In ra payload của access_token
        const payload = decodeJwtPayload(res.access_token);
        console.log('JWT payload:', payload);
    }
    if (res?.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
        // Nếu là admin, lưu thêm cờ isAdmin
        if (res.user.isAdmin) {
            localStorage.setItem('isAdmin', 'true');
        } else {
            localStorage.removeItem('isAdmin');
        }
    }
    return res;
};

// API đăng ký người dùng mới
export const signupUser = async (data) => basePost(`/user/sign-up`, data);


export const getDetailUser = async (id) => {
    try {
        return await baseGet(`/user/get-detail/${id}`);
    } catch (error) {
        message.error(error?.response?.data?.message || 'An error occurred while fetching user details.');
        throw error;
    }
};

// API lấy danh sách tất cả người dùng
export const getAllUser = async () => {
    try {
        return await baseGet(`/user/getAll`);
    } catch (error) {
        message.error(error?.response?.data?.message || 'An error occurred while fetching users.');
        throw error;
    }
};

// API đăng xuất người dùng
export const logoutUser = async () => basePost(`/user/log-out`);

export const updateUser = async (id, data) => {
  try {
    return await basePut(`/user/update-user/${id}`, data);
  } catch (error) {
    message.error(error?.response?.data?.message || 'Failed to update user.');
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    return await baseDelete(`/user/delete/${id}`);
  } catch (error) {
    message.error(error?.response?.data?.message || 'Failed to delete user.');
    throw error;
  }
};
