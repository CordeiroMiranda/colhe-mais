import type { FoodBank } from "@/shared/types/foodBanks";

export const RESULTS_PER_PAGE = 3;

export const canViewFoodBankPackages = (foodBank: FoodBank) =>
  foodBank.id > 0 &&
  Boolean(foodBank.has_local_admin_account ?? foodBank.systemMatched);

export const getFoodBankKey = (foodBank: FoodBank) =>
  `${foodBank.id}-${foodBank.name}-${foodBank.lat}-${foodBank.lng}`;

export const getSummaryText = (
  hasSearched: boolean,
  resultCount: number,
  localPostcode: string,
) =>
  hasSearched
    ? `Encontrado(s) ${resultCount} ponto(s) de coleta${localPostcode.trim() ? ` próximo(s) a ${localPostcode.trim()}` : ""}.`
    : "Informe seu CEP para carregar os pontos de coleta no mapa e na lista.";

export const getDisplayedResults = (
  searchResults: FoodBank[],
  currentPage: number,
) =>
  searchResults.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE,
  );

export const getSelectedFoodBankKey = (
  searchResults: FoodBank[],
  current: string | null,
) => {
  if (
    current &&
    searchResults.some((foodBank) => getFoodBankKey(foodBank) === current)
  ) {
    return current;
  }

  return searchResults[0] ? getFoodBankKey(searchResults[0]) : null;
};
