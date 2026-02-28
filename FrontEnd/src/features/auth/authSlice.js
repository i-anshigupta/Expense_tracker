import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API base URL
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

// Get user from localStorage (if already logged in)
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

/**
 * REGISTER USER
 */
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, thunkAPI) => {
        try {
            const res = await axios.post(`${API_URL}/register`, userData);
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Registration failed"
            );
        }
    }
);

/**
 * LOGIN USER
 */
export const loginUser = createAsyncThunk(
    "auth/login",
    async (userData, thunkAPI) => {
        try {
            const res = await axios.post(`${API_URL}/login`, userData);
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

/**
 * UPDATE PROFILE (name, avatarColor)
 */
export const updateProfileApi = createAsyncThunk(
    "auth/updateProfile",
    async (payload, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            const res = await axios.put(`${API_URL}/me`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Update failed");
        }
    }
);

/**
 * CHANGE PASSWORD
 */
export const changePasswordApi = createAsyncThunk(
    "auth/changePassword",
    async (payload, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            const res = await axios.put(`${API_URL}/change-password`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Password change failed");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: user || null,
        token: token || null,
        isLoading: false,
        isSuccess: false,
        isError: false,
        message: "",
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";

            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
        resetAuthState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        },
        // setUser: update user in store + localStorage (used after profile edit)
        setUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder
            // REGISTER
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.user;
                state.token = action.payload.token;

                localStorage.setItem("user", JSON.stringify(action.payload.user));
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // LOGIN
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.user;
                state.token = action.payload.token;

                localStorage.setItem("user", JSON.stringify(action.payload.user));
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // UPDATE PROFILE
            .addCase(updateProfileApi.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateProfileApi.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.user;
                localStorage.setItem("user", JSON.stringify(action.payload.user));
            })
            .addCase(updateProfileApi.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // CHANGE PASSWORD
            .addCase(changePasswordApi.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(changePasswordApi.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(changePasswordApi.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { logout, resetAuthState, setUser } = authSlice.actions;

export default authSlice.reducer;
