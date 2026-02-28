import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/(dashboard)");
  const isOnAuthPages = req.nextUrl.pathname.startsWith("/(auth)");
  const isOnClientPages = req.nextUrl.pathname.startsWith("/(client)");

  // Protect dashboard routes
  if (isOnDashboard && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return Response.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isOnAuthPages && isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return Response.redirect(url);
  }

  // Allow access to client pages only if authenticated
  if (isOnClientPages && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return Response.redirect(url);
  }

  // Allow access to public routes
  return null;
});

// Apply middleware to protected routes
export const config = {
  matcher: [
    "/(dashboard)/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/(auth)/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/(client)/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};