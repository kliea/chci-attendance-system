-- Allow managers to delete staff rows. Run on existing DBs that were created before this policy.
-- Staff delete cascades to attendance_logs; profiles.bio_id FK will block delete if a profile is linked.

create policy "Managers can delete staff"
  on public.staff for delete using (public.is_manager());
