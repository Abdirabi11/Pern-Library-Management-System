import api from "@/lib/axios";

export type StatsDto= {
    totalUsers?: number;
    totalBooks?: number;
    totalBorrowed?: number;
    totalRequests?: number;
};

export type TopBorrowedDto= {book_uuid: string, title: string; borrow_count: number }[];
export type MonthlyBorrowDto = { month: string; count: number }[];
export type ActiveUsersDto = { user_uuid: string; name: string; actions_count: number }[];

export const analyticsService= {
    getStats: async ()=>{
        const res= await api.get("dashboard/getStats")
        return res.data as StatsDto;
    },
    getTopBorrowed: async (limit= 10)=>{
        const res= await api.get("dashboard/getTopBorrowed", { params: { limit }})
        return res.data as TopBorrowedDto;
    },
    getActiveUsers: async (limit= 10)=>{
        const res= await api.get("dashboard/getActive", { params: { limit }})
        return res.data as ActiveUsersDto;
    },
    getMonthlyBorrowStats: async (year?: number) => {
        const res = await api.get("/dashboard/borrowStats", { params: { year } });
        return res.data as MonthlyBorrowDto;
    },
    getRequestTrends: async (since?: string) => {
        const res = await api.get("/dashboard/getRequestTrends", { params: { since } });
        return res.data;
    },
    getBorrowedVsReturned: async () => {
        const res = await api.get("/dashboard/borrowedReturned");
        return res.data;
    },
    getSystemUsage: async (period?: string) => {
        const res = await api.get("/dashboard/systemUsage", { params: { period } });
        return res.data;
    },
};