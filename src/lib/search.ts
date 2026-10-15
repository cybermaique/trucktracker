/**
 * Case, accent and punctuation insensitive form of a text, so that
 * `abc1234` matches `ABC-1234` and `sao paulo` matches `São Paulo`.
 */
const normalizeForSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z\d]/gi, "")
    .toLowerCase();

/** Whether any of the texts contains the query (after normalization). */
export const matchesSearch = (query: string, texts: readonly string[]) => {
  const normalizedQuery = normalizeForSearch(query);
  return (
    !normalizedQuery ||
    texts.some((text) => normalizeForSearch(text).includes(normalizedQuery))
  );
};
