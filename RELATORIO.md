# Relatorio de pendencias - Colhe+
Gerado em: 11/23/2026 20:40:58

## 1. Erros de TypeScript
Nenhum erro.

## 2. Frases em ingles nos textos de tela
- foodBankStore.public.ts:195: "This food bank is not connected to online applications yet.",
- adminFoodManagement.sections.shared.ts:37: export const sessionExpiredMessage = "Please login again and retry.";
- itemOps.ts:100: return { error: "Inventory item not found." };
- itemOps.ts:151: setPageNotice("error", "Inventory item not found.");
- lotOps.ts:112: setPageNotice("error", "Inventory lot not found.");
- packageOps.ts:156: return { error: "Session expired. Please refresh and try again." };
- packageOps.ts:189: return { error: "Package not found." };
- useAdminDonationCodeActions.ts:111: return { error: "Each donation row needs an item and quantity." };
- useAdminDonationCodeActions.ts:477: "Use the current redemption code format: XXXX-XXXX.",
- useAdminDonationCodeActions.ts:483: fallbackMessage: "Redemption code not found.",
- foodPackages.pageModel.ts:306: "Application succeeded but no redemption code was returned.",
- FoodPackages.tsx:18: message="Connecting this page to the live backend and database."
- FoodPackages.tsx:28: message="The backend did not return a food bank for online applications."
- Supermarket.sections.tsx:86: title="Add this inventory item to the donation form"
- Supermarket.sections.tsx:94: title="Hide this item from the current page"
- Supermarket.sections.tsx:137: title="Low stock alert: items at your local food bank may need support"
- Supermarket.sections.tsx:191: : "Use the low stock modal or enter the exact food name from inventory."
- Supermarket.sections.tsx:289: message="Submissions from this page are saved as pending supermarket donations. Your food bank admin will review and receive them from Inventory Management before stock is updated."
- Supermarket.sections.tsx:297: message="No low-stock items right now. You can still submit a donation using the exact food name and quantity."
- Supermarket.tsx:204: setFormError("Add at least one item before submitting your donation.");
- foodBankLookup.ts:111: return "We could not find that postcode. Please check it and try again.";

## 3. Palavras comuns de interface em ingles
- authStore.ts:83: message: getErrorMessage(error, "Login failed"),
- foodBankStore.public.ts:147: console.error("Search failed:", error);
- itemOps.ts:126: return { error: "Quantity must be a positive integer." };
- packageOps.ts:206: return buildError("Quantity must be a positive integer.");
- FoodPackages.catalog.tsx:420: title="Apply for food support"
- FoodPackages.outcome.tsx:116: ? "Loading Availability..."
- FoodPackages.outcome.tsx:119: : "Submit Application"}
- FoodPackages.tsx:17: title="Loading Food Support Options"
- Supermarket.sections.tsx:49: aria-label="Close low stock list"
- Supermarket.sections.tsx:219: placeholder="Quantity"
- Supermarket.sections.tsx:351: {isSubmittingDonation ? "Submitting..." : "Submit Donation"}
- ImageWithFallback.tsx:38: alt="Error loading image"
- ImageWithFallback.tsx:47: alt="Error loading image"

## 4. Marca antiga, postcode e libra
- FoodPackages.tsx:27: title="No Connected Food Bank Available"
- foodBankLookup.ts:20: "Food bank lookup service is temporarily unavailable.";
- foodBankLookup.ts:110: if (normalizedMessage.includes("invalid postcode")) {
- foodBankLookup.ts:111: return "We could not find that postcode. Please check it and try again.";

## 5. Titulo e idioma da pagina (index.html)
- <html lang="pt-BR">
- <title>Colhe+ | Conectando alimentos e comunidades</title>

## 6. Git
?? ../RELATORIO.md
9887fb7 corrige erros de build
b0cd8f9 corrige vercel.json
bd09286 dispara deploy
4f21791 remove vercel.json duplicado
e4e8363 vercel.json

## 7. Backend (so listagem)
- alembic
- app
- scripts
- tests
- .env.example
- alembic.ini
- requirements-dev.txt
- requirements.txt
- PROGRESSO.md
- README.md
- RELATORIO.md
