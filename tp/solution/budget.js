export function analyserBudget({ budget_total, nb_jours, cout_journalier, cout_transport }) {
  const cout_total = nb_jours * cout_journalier + cout_transport;
  const marge = budget_total - cout_total;
  return { cout_total, marge, faisable: marge >= 0 };
}
