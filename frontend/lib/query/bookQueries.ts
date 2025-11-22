"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { booksService } from "@/services/books.service";
import { toast } from "react-hot-toast";

export const bookKeys = {
  root: ["books"] as const,

  list: (page: number, limit: number) =>
    ["books", page, limit] as const,

  search: (query: string) => ["books", "search", query] as const,

  book: (uuid: string) => ["book", uuid] as const,
};

function handleError(err: any) {
  const msg = err?.response?.data?.message ?? err?.message ?? "Something went wrong";
  toast.error(msg);
}


export function useBooksQuery(page = 1, limit = 20) {
    return useQuery({
      queryKey: bookKeys.list(page, limit),
      queryFn: () => booksService.list(page, limit),
      keepPreviousData: true,
      onError: handleError,
    });
};

export function useBookQuery(uuid?: string) {
  return useQuery({
    queryKey: uuid ? bookKeys.book(uuid) : undefined,
    queryFn: () => booksService.getByUuid(uuid!),
    enabled: !!uuid,
    onError: handleError,
  });
}''
  
export function useSearchBooks() {
return useMutation({
  mutationFn: (q: string) => booksService.search(q),
  onError: handleError,
})
};


export function useRequestBorrowMutation() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (bookUuid: string) => booksService.requestBorrow(bookUuid),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: bookKeys.list(1, 20) });
        qc.invalidateQueries({ queryKey: ["borrowed"] });
      },
      onError: handleError,
    })
};