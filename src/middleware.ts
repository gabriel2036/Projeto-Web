// middleware.ts

export { default } from "next-auth/middleware"

export const config = {
  // O matcher define quais rotas serão protegidas
  // Todas as rotas listadas aqui exigirão login para serem acedidas
  matcher: [
    '/interest', 
    '/friends',
    '/match/:path*',
    '/dashboard', 
  ],
}