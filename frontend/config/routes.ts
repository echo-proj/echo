export const routeConfig = {
    protectedRoutes: [
        '/documents',
    ],

    guestOnlyRoutes: [
        '/login',
        '/register',
    ],
    publicRoutes: [
        '/',
    ],
    defaultUnauthenticatedRedirect: '/login',
    defaultAuthenticatedRedirect: '/documents',
};
