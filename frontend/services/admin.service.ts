import api from "@/lib/axios";

export type UserType= {
    uuid: string;
    name: string;
    email: string;
    role: "admin" | "librarian" | "student" | string;
    created_at?: string;
};

export type RequestType= {
    uuid: string;
    requester_uuid: string;
    request_type: "add_book" | "delete_book" | "borrow_book" | "return_book" | string;
    book_uuid?: string;
    book_data?: any;
    status: "pending" | "approved" | "rejected";
    remarks?: string | null;
    created_at?: string;
};

export type ActionLogType={
    uuid: string;
    performer_uuid: string;
    performer_type: string;
    role?: string;
    action_type?: string;
    details?: any;
    entity_type?: string;
    entity_uuid?: string;
    created_at?: string;
};

const PATH= "/admin"

export const adminService= {
    getUsers: async(page=1, limit=50)=>{
        const res= await api.get(`${PATH}/users`, {params: {page, limit}})
        return res.data as { items: UserType[]; meta?: any };
    },
    getUser: async (uuid: string) => {
        const res = await api.get(`${PATH}/users/${uuid}`);
        return res.data as UserType;
    },
    updateUserRole: async(uuid: string, role: string)=>{
        const res= await api.put(`${PATH}/users/${uuid}/role`, {role})
        return res.data;
    },
    createUser: async (payload: {name: string, email: string, role:string, password?:string})=>{
        const res= await api.post(`${PATH}/users`, payload);
        return res.data;
    },
    deleteUser: async (uuid: string)=>{
        const res = await api.delete(`${PATH}/users/${uuid}`);
        return res.data;
    },
    listAllRequests: async (page=1, limit=50)=>{
        const res= await api.get(`${PATH}/requests`, {params: {page, limit}});
        return res.data as { items: RequestType[]; meta?: any };
    },
    getRequest: async (uuid: string)=>{
        const res= await api.get(`${PATH}/requests/${uuid}`)
        return res.data as RequestType;
    },
    approveRequest: async (uuid: string)=>{
        const res= await api.post(`${PATH}/requests/${uuid}/approve`)
        return res.data as RequestType;
    },
    rejectRequest: async (uuid: string, remarks?: string)=>{
        const res= await api.post(`${PATH}/requests/${uuid}/reject`, {remarks})
        return res.data as RequestType;
    },
    revokeRequest: async (uuid: string) => {
        const res = await api.post(`${PATH}/requests/${uuid}/revoke`);
        return res.data;
    },
    getLogs: async (page=1, limit=50)=>{
        const res= await api.get(`${PATH}/logs`, {params: {page, limit}})
        return res.data as { items: ActionLogType[]; meta?: any };
    },
    getLog: async (uuid: string) => {
        const res = await api.get(`${PATH}/logs/${uuid}`);
        return res.data as ActionLogType;
    },
};