import { flattenPages, getNextOffsetParam, type Paginated } from '../pagination';

const page = (offset: number, ids: number[], total: number): Paginated<{ id: number }> => ({
  total,
  limit: 3,
  offset,
  results: ids.map((id) => ({ id })),
});

describe('getNextOffsetParam', () => {
  it('advances the offset by the number of consumed items', () => {
    expect(getNextOffsetParam(page(0, [1, 2, 3], 10))).toEqual({ offset: 3, limit: 3 });
  });

  it('stops when the collection is exhausted', () => {
    expect(getNextOffsetParam(page(6, [7, 8, 9], 9))).toBeUndefined();
  });

  it('stops on an empty page even when total disagrees', () => {
    expect(getNextOffsetParam(page(6, [], 99))).toBeUndefined();
  });
});

describe('flattenPages', () => {
  it('concatenates pages in order', () => {
    const result = flattenPages([page(0, [1, 2], 4), page(2, [3, 4], 4)], (item) => item.id);
    expect(result.map((item) => item.id)).toEqual([1, 2, 3, 4]);
  });

  it('drops duplicates that overlapping pages may return', () => {
    const result = flattenPages([page(0, [1, 2], 4), page(1, [2, 3], 4)], (item) => item.id);
    expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('returns an empty array when there are no pages', () => {
    expect(flattenPages(undefined, (item: { id: number }) => item.id)).toEqual([]);
  });
});
