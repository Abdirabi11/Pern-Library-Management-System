import api from "./axios"
import type { AxiosRequestConfig } from "axios"

// small wrapper for ad-hoc calls
export async function protectedFetch<T = any>(config: AxiosRequestConfig ){
    try {
        const res= await api.request<T>(config)
        return res.data;
    } catch (err) {
        throw err;
    }
};