"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, User } from "@/services/auth.service";
import { useDispatch } from "react-redux";
import { setUser, clearUser, setInitialized, setLoading } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "../axios";

export const authKeys = {
    root: ["auth"] as const,
    me: ["auth", "getMe"] as const,
};

function handleError(err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Something went wrong";
    toast.error(msg);
};

export function useMeQuery() {
    const dispatch = useDispatch();
    return useQuery<User, Error>({
        queryKey: authKeys.me,
        queryFn: async () => {
            const user = await authService.me();
            return user;
        },
        retry: 0,
        onSuccess: (user) => {
            dispatch(setUser(user));
        },
        onError: (err: any) => {
            dispatch(clearUser());
            handleError(err);
        },
    });
};

export function useSignupMutation(){
    const qc= useQueryClient()
    const router= useRouter()
    return useMutation({
        mutationFn: async (payload:{name: string, email: string, password: string})=>{
            const res= await authService.signup(payload);
            return res;
        },
        onSuccess:(data) =>{
            toast.success("Account created. Please login.");
            qc.invalidateQueries(authKeys.me);
            router.push("/login");
        },
        onError: (err)=>{
            handleError(err);
        }
    })
}

export function useLoginMutation(){
    const queryClient= useQueryClient();
    const dispatch= useDispatch();
    const router= useRouter();

    return useMutation({
        mutationFn: async (payload: {email: string; password: string })=> {
            const res= await authService.login(payload);
            return res.user;
        },
        onSuccess: (user: User)=>{
            try {
                dispatch(setUser(user));
                queryClient.setQueryData(["auth", "me"], user);
               
                if (user.role === "admin") router.push("/dashboard/admin");
                else if (user.role === "librarian") router.push("/dashboard/librarian");
                else router.push("/dashboard/student");
            } catch (e: any) {
                handleError(e);
                router.push("/login");
            }
        },
        onError: (err) => {
            handleError(err);
        },
    })
};

export function useLogoutMutation(){
    const dispatch= useDispatch();
    const router= useRouter();

    return useMutation({
        mutationFn: async ()=>{
            await authService.logout();
        },
        onSuccess: ()=>{
            dispatch(clearUser());
            router.push("/login");
        },
        onError: (err) => {
            handleError(err);
        },
    })
};