import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type IUser = {
    uuid: string;
    name: string;
    email: string;
    role: string;
} | null;

type AuthState = {
    user: IUser;
    loading: boolean;
    initialized: boolean; 
};

const initialState: AuthState = {
    user: null,
    loading: false,
    initialized: false,
};

const authSlice= createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<IUser>) {
            state.user = action.payload;
        },
        clearUser(state) {
            state.user = null;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setInitialized(state, action: PayloadAction<boolean>) {
            state.initialized = action.payload;
        },
    }
});

export const { setUser, clearUser, setLoading, setInitialized } = authSlice.actions;
export default authSlice.reducer;