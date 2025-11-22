"use client";
import {useEffect} from 'react'

export default function GlobalError({error ,reset}){
    useEffect(()=>{
        console.error("Global UI Error:", error);
    },[error]);
    return (
        <html>
            <body className="flex flex-col items-center justify-center h-screen text-center p-6 bg-gray-900 text-white">
                <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                <p className="opacity-80 mb-6">{error?.message || "Unexpected error occurred."}</p>
                <button
                 onClick={() => reset()}
                 className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
                >
                    Try Again
                </button>
            </body>
        </html>
    )
}
