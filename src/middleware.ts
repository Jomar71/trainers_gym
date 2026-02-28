import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register']
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth')

    // If trying to access a protected route without being logged in
    if (!isLoggedIn && !isPublicRoute && pathname !== '/') {
        const loginUrl = new URL('/login', req.url)
        return NextResponse.redirect(loginUrl)
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (isLoggedIn && (pathname === '/login' || pathname === '/')) {
        const dashboardUrl = new URL('/dashboard', req.url)
        return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
