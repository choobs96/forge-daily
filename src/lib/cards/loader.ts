/**
 * cards.js is the append-only contract with the external content-refresh job:
 * a root-level file assigning window.SWIPE_CARDS = [...]. We fetch it (the SW
 * caches it NetworkFirst so fresh content flows without a redeploy) and parse
 * the JSON payload out of the assignment. Last good copy is kept as fallback.
 */
export interface SwipeCard {
  id: string;
  cat: string;
  level: string;
  title: string;
  hook: string;
  body: string;
  tags: string[];
  src?: string;
}

const FALLBACK_KEY = 'forge:v2:cards-cache';

function parseCardsJs(text: string): SwipeCard[] {
  const assignMatch = text.match(/window\.SWIPE_CARDS\s*=/);
  if (!assignMatch || assignMatch.index === undefined) throw new Error('cards.js: no assignment found');
  const start = text.indexOf('[', assignMatch.index + assignMatch[0].length);
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) throw new Error('cards.js: no array literal found');
  const arr: unknown = JSON.parse(text.slice(start, end + 1));
  if (!Array.isArray(arr)) throw new Error('cards.js: not an array');
  return arr.filter(
    (c): c is SwipeCard =>
      !!c && typeof c === 'object' && typeof (c as SwipeCard).id === 'string' && typeof (c as SwipeCard).title === 'string'
  );
}

let cache: SwipeCard[] | null = null;

export async function loadCards(): Promise<SwipeCard[]> {
  if (cache) return cache;
  try {
    const res = await fetch('cards.js', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cards = parseCardsJs(await res.text());
    cache = cards;
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(cards));
    } catch {
      /* quota — fallback copy is best-effort */
    }
    return cards;
  } catch {
    const stored = localStorage.getItem(FALLBACK_KEY);
    if (stored) {
      cache = JSON.parse(stored) as SwipeCard[];
      return cache;
    }
    return [];
  }
}

export function cardById(cards: SwipeCard[], id: string): SwipeCard | undefined {
  return cards.find((c) => c.id === id);
}

export { parseCardsJs };
