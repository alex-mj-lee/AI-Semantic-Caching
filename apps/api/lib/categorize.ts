
export type Category = "fresh" | "evergreen";
const freshTerms = [
  "today","now","latest","current","weather","score","news","price","stock","deadline","this week","this month",
  "tonight","tomorrow","live","breaking","update","traffic","flight","currency","exchange rate","schedule"
];
export function categorize(query: string): Category {
  const q = query.toLowerCase();
  return freshTerms.some(t => q.includes(t)) ? "fresh" : "evergreen";
}
