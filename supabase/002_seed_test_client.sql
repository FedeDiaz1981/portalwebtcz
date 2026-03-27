-- Seed inicial para probar el portal de clientes.
-- Antes de correrlo:
-- 1. Crear un usuario en Supabase Auth.
-- 2. Reemplazar el email de abajo por el del usuario de prueba.

do $$
declare
  target_email text := 'cliente.demo@technized.com';
  target_user_id uuid;
  test_client_id uuid;
  app_tiempo_id uuid;
  app_novedades_id uuid;
  app_herramientas_id uuid;
begin
  select id
  into target_user_id
  from public.profiles
  where email = target_email
  limit 1;

  if target_user_id is null then
    raise exception 'No existe un profile para el email % . Primero crea el usuario en Supabase Auth.', target_email;
  end if;

  insert into public.clients (name, slug, logo_url, is_active)
  values (
    'Cliente Demo Technized',
    'cliente-demo-technized',
    '/assets/apps/tiempo-empleado/blatorh-logo.png',
    true
  )
  on conflict (slug) do update
  set name = excluded.name,
      logo_url = excluded.logo_url,
      is_active = excluded.is_active
  returning id into test_client_id;

  if test_client_id is null then
    select id
    into test_client_id
    from public.clients
    where slug = 'cliente-demo-technized'
    limit 1;
  end if;

  insert into public.applications (name, slug, url, description, icon, sort_order, is_active)
  values
    (
      'Tiempo de Empleado',
      'tiempo-empleado',
      '/clientes/aplicaciones/tiempo-empleado',
      'Procesamiento de presencias y ausencias para clientes.',
      'clock',
      1,
      true
    ),
    (
      'Novedades',
      'novedades',
      '/clientes/novedades',
      'Comunicados y novedades privadas para clientes.',
      'newspaper',
      2,
      true
    ),
    (
      'Herramientas',
      'herramientas',
      '/clientes/herramientas',
      'Accesos y recursos exclusivos por suscripcion.',
      'tool',
      3,
      true
    )
  on conflict (slug) do update
  set name = excluded.name,
      url = excluded.url,
      description = excluded.description,
      icon = excluded.icon,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active;

  select id into app_tiempo_id from public.applications where slug = 'tiempo-empleado' limit 1;
  select id into app_novedades_id from public.applications where slug = 'novedades' limit 1;
  select id into app_herramientas_id from public.applications where slug = 'herramientas' limit 1;

  insert into public.client_memberships (client_id, user_id, role, is_active)
  values (test_client_id, target_user_id, 'owner', true)
  on conflict (client_id, user_id) do update
  set role = excluded.role,
      is_active = excluded.is_active;

  insert into public.client_application_access (client_id, application_id, is_enabled)
  values
    (test_client_id, app_tiempo_id, true),
    (test_client_id, app_novedades_id, true),
    (test_client_id, app_herramientas_id, true)
  on conflict (client_id, application_id) do update
  set is_enabled = excluded.is_enabled;
end $$;

select
  c.name as client_name,
  c.logo_url,
  p.email as user_email,
  a.name as application_name,
  caa.is_enabled
from public.client_application_access caa
join public.clients c on c.id = caa.client_id
join public.applications a on a.id = caa.application_id
join public.client_memberships cm on cm.client_id = c.id
join public.profiles p on p.id = cm.user_id
where c.slug = 'cliente-demo-technized'
order by a.sort_order asc;
