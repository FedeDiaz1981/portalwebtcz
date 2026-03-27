import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase/server";

function isAssetRequest(pathname: string) {
  return (
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/scripts") ||
    pathname === "/favicon.png" ||
    pathname === "/favicon.svg"
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  if (isAssetRequest(pathname)) {
    return next();
  }

  const supabase = createSupabaseServerClient(context);
  context.locals.supabase = supabase;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  context.locals.user = user;

  if (pathname.startsWith("/clientes") && !user) {
    return context.redirect("/login");
  }

  if (pathname === "/login" && user) {
    return context.redirect("/clientes/aplicaciones");
  }

  return next();
});
