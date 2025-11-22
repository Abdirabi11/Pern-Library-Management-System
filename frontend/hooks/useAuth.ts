import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store"
import { setUser, clearUser, setLoading } from "../redux/slices/authSlice"
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export function useAuth(){
    const router = useRouter();
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state: RootState) => state.user);

 
    const { refetch: loadUser } = useQuery({
        queryKey: ["auth", "getMe"],
        queryFn: authService.me,
        enabled: false, 
        retry: 0,
    });
 
    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: async () => {
        const res = await loadUser();
        dispatch(setUser(res.data));
        router.push("/dashboard");
        },
    });

    const logoutMutation= useMutation({
        mutationFn: authService.logout,
        onSuccess: async ()=>{
            dispatch(clearUser())
            router.push("/login")
        }
    });

    useEffect(()=>{
        async function init(){
            dispatch(setLoading(true))
            try {
                const result= await loadUser()
            } catch (err) {
                dispatch(clearUser());
            }finally{
                dispatch(setLoading(false));
            }
        }
        init();
    }, []);

    return {
        user,
        loading,
        login: loginMutation.mutate,
        loginStatus: loginMutation.status,
        logout: logoutMutation.mutate,
    }
}