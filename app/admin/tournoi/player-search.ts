function normalize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("œ", "oe")
    .replaceAll("æ", "ae")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function getPlayerSearchTerms(query: string) {
  return normalize(query.slice(0, 120)).split(" ").filter(Boolean);
}

function matchesApproximatePrefix(term: string, word: string) {
  let index = 0;
  while (index < term.length && term[index] === word[index]) index++;

  const queryTail = term.slice(index);
  const wordTail = word.slice(index);
  return wordTail.startsWith(queryTail.slice(1)) ||
    wordTail.slice(1).startsWith(queryTail) ||
    (wordTail.length > 0 && wordTail.slice(1).startsWith(queryTail.slice(1))) ||
    (queryTail.length > 1 &&
      wordTail.startsWith(queryTail[1] + queryTail[0] + queryTail.slice(2)));
}

export function scorePlayerSearch(
  terms: string[],
  player: { name: string; club: string | null; licence: string },
) {
  const nameWords = normalize(player.name).split(" ");
  const words = [...nameWords, ...normalize(player.club ?? "").split(" ")].filter(Boolean);
  let score = 0;

  for (const term of terms) {
    const isNumeric = /^\d+$/.test(term);
    if (isNumeric && player.licence.includes(term)) {
      score += player.licence === term ? 4 : 2;
    } else if (nameWords.includes(term)) {
      score += 4;
    } else if (words.some((word) => word.startsWith(term))) {
      score += 3;
    } else if (words.some((word) => word.includes(term))) {
      score += 2;
    } else if (!isNumeric && term.length >= 3 && words.some((word) =>
      word.length >= 3 && word[0] === term[0] && matchesApproximatePrefix(term, word),
    )) {
      score += 1;
    } else {
      return null;
    }
  }

  return score;
}
