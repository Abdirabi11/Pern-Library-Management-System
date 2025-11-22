"use client";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppInit } from "@/providers/AppInit";
import { Toaster } from "react-hot-toast";

function ThemeProvider({children}: {children: React.ReactNode}){
    return <>{children}</>
};

const Providers = ({children}: {children: React.ReactNode}) => {

  return (
    <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AppInit>{children}</AppInit>
                <Toaster/>
            </ThemeProvider>
        </QueryClientProvider>
    </ReduxProvider>
  )
}

export default Providers