import { PAGE_SIZE } from './config';

export interface Paginated<T> {
  total: number;
  limit: number;
  offset: number;
  results: T[];
}

export interface PageParam {
  offset: number;
  limit: number;
}

export const FIRST_PAGE: PageParam = { offset: 0, limit: PAGE_SIZE };

export function getNextOffsetParam<T>(lastPage: Paginated<T>): PageParam | undefined {
  const consumed = lastPage.offset + lastPage.results.length;
  if (lastPage.results.length === 0 || consumed >= lastPage.total) return undefined;
  return { offset: consumed, limit: lastPage.limit || PAGE_SIZE };
}

export function getPreviousOffsetParam<T>(firstPage: Paginated<T>): PageParam | undefined {
  if (firstPage.offset <= 0) return undefined;
  const limit = firstPage.limit || PAGE_SIZE;
  return { offset: Math.max(0, firstPage.offset - limit), limit };
}

export function flattenPages<T>(pages: Paginated<T>[] | undefined, getId: (item: T) => string | number): T[] {
  if (!pages?.length) return [];
  const seen = new Set<string | number>();
  const out: T[] = [];
  for (const page of pages) {
    for (const item of page.results) {
      const id = getId(item);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(item);
    }
  }
  return out;
}
