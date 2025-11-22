import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken"

const AUTH_SECRET= process.env.JWT_SECRET!

const PUBLIC_PATHS = [
    "/login",
    "/signup",
    "/public",
    "/unauthorized"
];

// const ALLOWLIST = ["/api/auth/refresh"];

const ROLE_PROTECTED: Record<string, string[]> = {
    "/dashboard/admin": ["admin"],
    "/dashboard/librarian": ["librarian", "admin"],
    "/dashboard/student": ["student", "admin"],
    "/admin": ["admin"],
    "/librarian": ["librarian", "admin"],
    "/student": ["student", "admin"],
};

export async function middleware(req: NextRequest){
    const {pathname}= req.nextUrl;

    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    };
    
    const token= req.cookies.get("accessToken")?.value;
    if(!token){
        return NextResponse.redirect(new URL("/login", req.url));
    };
   
    //Validate JWT
    try {
        const decoded= jwt.verify(token, process.env.JWT_SECRET!!) as any
        // 
        //role based protection
        for (const routePrefix of Object.keys(ROLE_PROTECTED)){
            if (pathname.startsWith(routePrefix)) {
                const allowed = ROLE_PROTECTED[routePrefix];
                if (!allowed.includes(decoded.role)) {
                    return NextResponse.redirect(new URL("/unauthorized", req.url));
                }
            }
        };

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user", JSON.stringify({ uuid: decoded.uuid, role: decoded.role, name: decoded.name }));
        
        return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (err) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
};

export const config = {
    matcher: [
      "/api/:path*",           
      "/dashboard/:path*",
      "/admin/:path*",
      "/librarian/:path*",
      "/student/:path*",
      "/books/:path*",
      "/profile",
    ],
};
