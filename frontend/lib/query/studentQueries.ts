import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { studentService } from "../../services/student.service"

export const studentKeys= {
    root: ["student"] as const,

    borrowed: ["student", "borrowed-books"] as const,
  
    books: ["books"] as const,
    book: (uuid: string) => ["book", uuid] as const,
  
    category: (category: string) => ["books", category] as const,
  
    search: (query: string) => ["books", "search", query] as const,
};

function handleError(err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Something went wrong";
    toast.error(msg);
};

export const useBooks = () =>
  useQuery({
    queryKey: studentKeys.books,
    queryFn: studentService.getAllBooks,
    onError: handleError,
});

export const useBook = (uuid: string) =>
  useQuery({
    queryKey: uuid ? studentKeys.book(uuid) : undefined,
    queryFn: () => studentService.getBookByUuid(uuid!),
    enabled: !!uuid,
    onError: handleError,
});

export const useBooksByCategory = (category: string) =>
  useQuery({
    queryKey: category ? studentKeys.category(category) : undefined,
    queryFn: () => studentService.getBooksByCategory(category!),
    enabled: !!category,
    onError: handleError,
});

export const useSearchBooks = (query: string) =>
  useQuery({
    queryKey: studentKeys.search(query),
    queryFn: () => studentService.searchBooks(query),
    enabled: query.length > 1,
    onError: handleError,
});

export const useGetBorrwedBooks= ()=>{
    return useQuery({
        queryKey: studentKeys.borrowed,
        queryFn: () => studentService.getBorrowedBook(),
        onError: handleError,
    })
};

export const useBorrowBook= ()=>{
    const qc= useQueryClient();

    return useMutation({
        mutationFn: (bookUuid: string) => studentService.borrowBook(bookUuid),
        onSuccess: () => qc.invalidateQueries(studentKeys.borrowed),
        onError: handleError,
    })
};

export const useReturnBook= ()=>{
    const qc= useQueryClient();
    return useMutation({
        mutationFn: (recordUuid: string) => studentService.returnBook(recordUuid),
        onSuccess: () => qc.invalidateQueries(studentKeys.borrowed),
        onError: handleError,
    })
};