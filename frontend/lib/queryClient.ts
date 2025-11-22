import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const queryClient= new QueryClient({
    defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
          onError: (error: any) => {
            return toast.error(error?.message || "Something went wrong");
          },
        },
        mutations: {
          onError: (error: any) => {
            toast.error(error?.message || "Action failed");
          },
        },
    },
});