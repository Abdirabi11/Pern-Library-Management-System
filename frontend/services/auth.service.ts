import {api, refreshClient} from "@/lib/axios";

export type LoginPayload= {
    email: string;
    password: string;
};

export type SignupPayload={
    name: string; 
    email: string; 
    password: string;
}

export type User= {
    uuid: string;
    name: string;
    email: string;
    role: "admin" | "librarian" | "student" | string;
};

const PATH = "/auth";

export const authService= {
    signup: async (payload:SignupPayload):Promise<{user?: User} | any> =>{
        const res= await api.post(`${PATH}/signup`, payload, {withCredentials: true});
        return res.data;
    },
    login: async (payload: LoginPayload): Promise<{user?: User} | any>=>{
        const res= await api.post(`${PATH}/login`, payload, {withCredentials: true});
        return res.data;
    },
    logout: async (): Promise<void>=>{
        const res= await api.post(`${PATH}/logout`, {}, {withCredentials: true});
        return;
    },
    me: async (): Promise<{user?: User}>=>{
        const res= await api.get(`/${PATH}/getMe`, {withCredentials: true});
        return res.data;
    },
    refresh: async ()=>{
        const res= await refreshClient.post(`${PATH}/refresh`, {}, {withCredentials: true});
        return res.data;
    },  
};