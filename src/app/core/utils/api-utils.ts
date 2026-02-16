import { HttpParams } from '@angular/common/http';

/** Tabs (UI) -> Backend status query */
export function normalizeStatusTab(tab: string): string {
  const v = (tab ?? '').trim().toLowerCase();

  // UI "All" means no status filter
  if (!v || v === 'all') return '';

  // allow only supported statuses (safety)
  if (v === 'active') return 'active';
  if (v === 'pending') return 'pending';
  if (v === 'inactive') return 'inactive';
  if (v === 'flagged') return 'flagged';

  return '';
}

export function buildFilterParams(search: string, statusTab: string): HttpParams {
  let params = new HttpParams();

  const s = (search ?? '').trim();
  if (s) params = params.set('search', s);

  const status = normalizeStatusTab(statusTab);
  if (status) params = params.set('status', status);

  return params;
}
