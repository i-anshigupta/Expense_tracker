import { configureStore } from "@reduxjs/toolkit";

// Reducers (we will add slices step-by-step)
import authReducer from "./auth/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    devTools: import.meta.env.MODE !== "production",
});
