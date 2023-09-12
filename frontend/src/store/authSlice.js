import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuth: false,
    user: null,
    phone: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth(state, action) {
            state.isAuth = action.payload.isAuth;
            state.user = action.payload.user;
        },
        setPhone(state, action) {
            state.phone = action.payload.phone;
        },
    },
});

export const { setAuth, setPhone } = authSlice.actions;
export default authSlice.reducer;