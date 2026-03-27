import type { SupabaseClient } from "@supabase/supabase-js";

export type PortalClient = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type PortalApplication = {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
};

export async function getCurrentPortalClient(supabase: SupabaseClient, userId: string) {
  const baseQuery = () =>
    supabase
      .from("clients")
      .select(
        `
          id,
          name,
          slug,
          client_memberships!inner (
            user_id,
            is_active
          )
        `
      )
      .eq("client_memberships.user_id", userId)
      .eq("client_memberships.is_active", true)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

  const { data, error } = await supabase
    .from("clients")
    .select(
      `
        id,
        name,
        slug,
        logo_url,
        client_memberships!inner (
          user_id,
          is_active
        )
      `
    )
    .eq("client_memberships.user_id", userId)
    .eq("client_memberships.is_active", true)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    const { data: fallbackData, error: fallbackError } = await baseQuery();

    if (fallbackError) {
      console.error("No pudimos resolver el cliente actual del portal.", error);
      return null;
    }

    if (!fallbackData) {
      return null;
    }

    return {
      id: fallbackData.id,
      name: fallbackData.name,
      slug: fallbackData.slug,
      logoUrl: null
    } satisfies PortalClient;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logo_url ?? null
  } satisfies PortalClient;
}

export async function getAuthorizedApplications(supabase: SupabaseClient, clientId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
        id,
        name,
        slug,
        url,
        description,
        icon,
        sort_order,
        client_application_access!inner (
          client_id,
          is_enabled
        )
      `
    )
    .eq("client_application_access.client_id", clientId)
    .eq("client_application_access.is_enabled", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("No pudimos resolver las aplicaciones autorizadas del cliente.", error);
    return [];
  }

  return (data ?? []).map((application) => ({
    id: application.id,
    name: application.name,
    slug: application.slug,
    url: application.url,
    description: application.description ?? null,
    icon: application.icon ?? null,
    sortOrder: application.sort_order ?? 0
  })) satisfies PortalApplication[];
}
