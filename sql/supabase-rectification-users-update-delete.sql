-- Allow users to update and delete their own pending rectification requests.
-- Run in Supabase SQL Editor. Requires existing rectification_requests table and is_manager().

-- 1. Allow users to update their own pending requests (managers already can update any)
drop policy if exists "Users can update own pending rectification requests" on public.rectification_requests;
create policy "Users can update own pending rectification requests"
  on public.rectification_requests for update
  using (auth.uid() = user_id and status = 'pending');

-- 2. Allow users to delete their own pending requests (replaces "no deletion")
drop policy if exists "No deletion of rectification requests" on public.rectification_requests;
drop policy if exists "Users can delete own pending rectification requests" on public.rectification_requests;
create policy "Users can delete own pending rectification requests"
  on public.rectification_requests for delete
  using (auth.uid() = user_id and status = 'pending');
