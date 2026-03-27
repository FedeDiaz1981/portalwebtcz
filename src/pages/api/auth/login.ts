import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function redirectWithError(request: Request, message: string) {
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("error", message);
  return Response.redirect(redirectUrl, 303);
}

export const POST: APIRoute = async (context) => {
  const formData = await context.request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return redirectWithError(context.request, "Completá email y contrasena.");
  }

  const supabase = createSupabaseServerClient(context);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return redirectWithError(
      context.request,
      "No pudimos iniciar sesion. Revisá tus credenciales."
    );
  }

  return Response.redirect(new URL("/clientes/aplicaciones", context.request.url), 303);
};
