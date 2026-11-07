/**
 * Limits of the AI endpoints. They follow the API contract (`shared/types/api.ts`): prompt 3–2000,
 * count 1–10, capacity 1–200, focus ≤ 300, chat messages ≤ 4000 and 1–30 per request, 1–50 todos
 * per bulk create. Re-check them against `server/src/routes/ai.routes.ts` when the server is at hand.
 */
export const AI_LIMITS = {
  promptMin: 3,
  promptMax: 2000,
  countMin: 1,
  countMax: 10,
  countDefault: 5,
  capacityMin: 1,
  capacityMax: 200,
  focusMax: 300,
  messageMax: 4000,
  conversationMax: 30,
  draftsMax: 50,
} as const;
