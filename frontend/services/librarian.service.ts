import api from "@/lib/axios";

export type LibrarianRequestDto = {
    uuid: string;
    requester_uuid: string;
    request_type: "add_book" | "delete_book";
    book_data?: any;
    status: "pending" | "approved" | "rejected";
    created_at?: string;
};

export const librarianService= {
    requestAddBook: async (payload: { title: string; description?: string; author_uuid?: string; category?: string; total_copies?: number }) => {
        const res= await api.post('/books/request-add', payload)
        return res.data 
    },
    requestDeleteBook: async (bookUuid: string, reason?:string)=>{
        const res= await api.post(`/books/request-delete/${bookUuid}`, {reason})
        return res.data;
    },
    // listRequests: async (page = 1, limit = 50) => {
    //     const res = await api.get("/books/requests", { params: { page, limit } });
    //     return res.data as { items: LibrarianRequestDto[]; meta?: any };
    // },
    // getRequest: async (uuid: string) => {
    // const res = await api.get(`/books/requests/${uuid}`);
    // return res.data as LibrarianRequestDto;
    // },
    getManagedBooks: async (page = 1, limit = 50) => {
    const res = await api.get("/books/getBook", { params: { page, limit } });
    return res.data;
    },
    // markRequestRead: async (uuid: string) => {
    //     const res = await api.post(`/books/requests/${uuid}/mark-read`);
    //     return res.data;
    // },
}