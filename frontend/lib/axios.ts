import { clearUser, setUser } from "@/redux/slices/authSlice";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getStore } from "./storeRef";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5006/api";

const api= axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

const refreshClient= axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: {
    resolve: (value?: AxiosResponse<any>) => void;
    reject: (err: any) => void;
    config: AxiosRequestConfig;
}[]= [];

const processQueue = (error: any, tokenResponse?: AxiosResponse) => {
    failedQueue.forEach((p) => {
      if (error) p.reject(error);
      else p.resolve(tokenResponse);
    });
    failedQueue = [];
};
  

api.interceptors.response.use(
    (res)=> res,
    async (err: AxiosError & {config?: AxiosRequestConfig})=>{
        const originalConfig= err.config;

        if(err.response?.status === 401 && originalConfig && !(originalConfig as any)._retry){
            if(isRefreshing){
                return new Promise(( resolve, reject)=>{
                    failedQueue.push({resolve, reject, config: originalConfig})
                })
                .then(()=> api.request(originalConfig))
                .catch( (e)=>Promise.reject(e));
            }

            (originalConfig as any)._retry = true;
            isRefreshing = true;

            try {
                const refreshRes= await refreshClient.post("/auth/refresh", {}, {withCredentials: true});

                const store = getStore();
                if (store) {
                  if (refreshRes.data?.user) store.dispatch(setUser(refreshRes.data.user));
                }

                processQueue(null, refreshRes)
                isRefreshing= false

                return api.request(originalConfig);
            } catch (refreshError) {
                processQueue(refreshError, undefined);
                isRefreshing = false;

                const store = getStore();
                if (store) {
                  store.dispatch(clearUser());
                }
        
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(err);
    }
);

export { api, refreshClient };
export default api;