create table if not exists public.usage_counters (
  month text not null,
  subject_type text not null check (subject_type in ('member', 'guest')),
  subject_key text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (month, subject_type, subject_key)
);

create or replace function public.consume_usage(
  p_month text,
  p_subject_type text,
  p_subject_key text,
  p_limit integer
)
returns table(allowed boolean, current_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  usage_count integer;
begin
  select count into usage_count
  from public.usage_counters
  where month = p_month
    and subject_type = p_subject_type
    and subject_key = p_subject_key
  for update;

  if usage_count is null then
    usage_count := 0;
  end if;

  if p_limit >= 0 and usage_count >= p_limit then
    return query select false, usage_count;
    return;
  end if;

  if usage_count = 0 then
    insert into public.usage_counters (month, subject_type, subject_key, count, updated_at)
    values (p_month, p_subject_type, p_subject_key, 1, now())
    on conflict (month, subject_type, subject_key)
    do update set
      count = public.usage_counters.count + 1,
      updated_at = now()
    returning count into usage_count;
  else
    update public.usage_counters
    set count = count + 1,
        updated_at = now()
    where month = p_month
      and subject_type = p_subject_type
      and subject_key = p_subject_key
    returning count into usage_count;
  end if;

  return query select true, usage_count;
end;
$$;
