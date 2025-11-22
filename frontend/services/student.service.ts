import api from "@/lib/axios";

export type StudentDto= {
    uuid: string,
    name: string,
    bookUuid: string
};

export const studentService= {
    getAllBooks: async () => {
        const res = await api.get("/books/getBook");
        return res.data.books;
    },
    getBookByUuid: async (uuid: string) => {
        const res = await api.get(`/books/getBook/${uuid}`);
        return res.data.book;
    },
    getBooksByCategory: async (category: string) => {
        const res = await api.get(`/books/getBook/category/${category}`);
        return res.data.books;
    },
    searchBooks: async (query: string) => {
        const res = await api.get(`/books/search?query=${query}`);
        return res.data.books;
    },
    borrowBook: async (bookUuid: string)=>{
        const res= await api.post(`/books/borrowBook/${bookUuid}`);
        return res.data;
    },
    getBorrowedBook: async ()=>{
        const res= await api.get(`/books/borrowBook`);
        return res.data;
    },
    returnBook: async (recordUuid: string)=>{
        const res = await api.post(`/books/return-book/${recordUuid}`);
        return res.data;
    }
};