import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: '',
  access_token: '',
  id: '',
  isAdmin: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Cập nhật thông tin người dùng
    setUser: (state, action) => {
      const { 
        name, 
        email, 
        phone, 
        address, 
        avatar, 
        access_token, 
        id, 
        _id, 
        isAdmin 
      } = action.payload;

      // Cập nhật từng thuộc tính người dùng
      state.name = name || state.name;
      state.email = email || state.email;
      state.phone = phone || state.phone;
      state.address = address || state.address;
      state.avatar = avatar || state.avatar;
      state.access_token = access_token || state.access_token;
      state.id = id || state.id;
      state._id = _id || state._id;
      state.isAdmin = isAdmin || state.isAdmin;
    },

    // Đặt lại thông tin người dùng khi logout
    logoutUser: () => {
      // Xóa token và các thông tin trong localStorage khi đăng xuất
      localStorage.removeItem('access_token');
      return initialState;
    },
  },
});

// Xuất các action
export const { setUser, logoutUser } = userSlice.actions;

// Xuất reducer
export default userSlice.reducer;
