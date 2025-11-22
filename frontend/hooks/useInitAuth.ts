"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setInitialized, setLoading, clearUser } from "@/redux/slices/authSlice";
import { authService } from "@/services/auth.service";

export function useInitAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    async function init() {
      dispatch(setLoading(true));
      try {
        const res = await authService.me(); 
        const user = (res && res.user) ? res.user : res
        if (mounted && user) dispatch(setUser(user));
      } catch (err) {
        if (mounted) dispatch(clearUser());
      } finally {
        if (mounted) {
          dispatch(setInitialized(true));
          dispatch(setLoading(false));
        }
      }
    }
    init();
    return () => { mounted = false; }
  }, [dispatch])}
