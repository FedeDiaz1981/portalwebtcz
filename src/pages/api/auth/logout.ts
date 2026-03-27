import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

async function logout(context: Parameters<APIRoute>[0]) {
  const supabase = createSupabaseServerClient(context);
  await supabase.auth.signOut();
  return Response.redirect(new URL("/login", context.request.url), 303);
}

export const GET: APIRoute = logout;
export const POST: APIRoute = logout;
