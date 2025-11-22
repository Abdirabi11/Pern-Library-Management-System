import api from "@/lib/axios";

export type Book = {
    uuid: string;
    title: string;
    description?: string;
    author_uuid?: string;
    category?: string;
    published_year?: number;
    total_copies?: number;
    available_copies?: number;
    cover_image?: string;
};

export const booksService= {
    list: async (page=1, limit= 20)=>{
        const res= await api.get("/books/getBook", { params: { page, limit } });
        return res.data;
    },
    getByUuid: async (uuid: string)=>{
        const res= await api.get(`/books/getBook/${uuid}`);
        return res.data;
    },
    getByCategory: async (category: string)=>{
        const res= await api.get(`/books/getBook/${category}`);
        return res.data;
    },
    search: async (q: string)=>{
        const res= await api.get("/books/search", {params: { q }});
        return res.data;
    },
    add: async (payload: Partial<Book>)=>{
        const res= await api.post("/books/add-book", payload);
        return res.data;
    },
    edit: async (uuid: string, payload: Partial<Book>)=>{
        const res= await api.post(`/books/edit-book/${uuid}`, payload);
        return res.data;
    },
    remove: async (uuid: string)=>{
        const res= await api.delete(`/books/remove-book/${uuid}`);
        return res.data;
    },
};