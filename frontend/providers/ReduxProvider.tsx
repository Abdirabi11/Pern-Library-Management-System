"use client";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { setStore } from "@/lib/storeRef";
import React from "react";


export function ReduxProvider({children}: {children: React.ReactNode}) {
    setStore(store);
    return <Provider store={store}>{children}</Provider>;
}