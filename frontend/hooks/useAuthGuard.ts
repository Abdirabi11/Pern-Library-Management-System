"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


type GuardOptions= {
    roles?: string[];
    redirect?: string;
};

export function useAuthGuard(options: GuardOptions={}){
    const {roles= [], redirect= "/login"}= options;

    const router= useRouter();
    const {user, initialized, loading}= useSelector(
        (state: RootState) => state.user
    );

    useEffect(()=>{
        if(!initialized) return;
        if(!user){
            router.replace(redirect);
            return;
        };
        if (roles.length > 0 && !roles.includes(user.role)) {
            router.replace("/unauthorized");
        }
    },[initialized, user, roles, redirect, router]);

    return{
        user,
        authorized: 
            initialized && user && (roles.length === 0 || roles.includes(user.role))
    };
}