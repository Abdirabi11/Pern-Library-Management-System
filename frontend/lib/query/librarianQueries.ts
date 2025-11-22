"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { librarianService } from "@/services/librarian.service";
import { toast } from "react-hot-toast";

// export function useLibrarianRequestsQuery(page = 1, limit = 50) {
//     return useQuery(["librarian", "requests", page, limit], () => librarianService.listRequests(page, limit), {
//       keepPreviousData: true,
//     });
// }

// export function useLibrarianRequestQuery(uuid?: string) {
//     return useQuery(["librarian", "request", uuid], () => librarianService.getRequest(uuid!), { enabled: !!uuid });
// }

export const librarianKeys = {
    root: ["librarian"] as const,
  
    requests: (page?: number, limit?: number) =>
      page && limit
        ? ["librarian", "requests", page, limit] as const
        : ["librarian", "requests"] as const,
  
    request: (uuid: string) => ["librarian", "request", uuid] as const,
  
    books: (page: number, limit: number) =>
      ["librarian", "books", page, limit] as const,
};

function handleError(err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Something went wrong";
    toast.error(msg);
};

export function useManagedBooksQuery(page = 1, limit = 50) {
    return useQuery({
      queryKey: librarianKeys.books(page, limit),
      queryFn: () => librarianService.getManagedBooks(page, limit),
      keepPreviousData: true,
      onError: handleError,
    });
}

export function useRequestAddBookMutation(){
    const qc= useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => librarianService.requestAddBook(payload),
        onSuccess: () => {
          qc.invalidateQueries(librarianKeys.requests());
          qc.invalidateQueries(["admin", "requests"]);
        },
        onError: handleError,
    });
};

export function useRequestDeleteBookMutation(){
    const qc= useQueryClient();
    return useMutation({
        mutationFn: ({ bookUuid, reason }: { bookUuid: string; reason?: string }) =>
            librarianService.requestDeleteBook(bookUuid, reason),
        onSuccess: () => {
            qc.invalidateQueries(librarianKeys.requests());
            qc.invalidateQueries(["admin", "requests"]);
        },
        onError: handleError,
    });
};