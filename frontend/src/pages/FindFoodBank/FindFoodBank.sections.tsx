import { type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  Mail,
  MapPinned,
  Navigation,
  PackageOpen,
  PackageSearch,
  PhoneCall,
  Search,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { ChevronLeft, ChevronRight } from "@/shared/ui/InlineIcons";
import { formatDistanceKilometers } from "@/shared/lib/geo";
import type { FoodBank } from "@/shared/types/foodBanks";
import {
  ActionButton,
  PublicPagination,
  PublicSearchPanel,
  PublicSectionIntro,
} from "@/shared/ui/PublicPagePatterns";
import FoodBankMap from "./FoodBankMap";
import {
  canViewFoodBankPackages,
  getFoodBankKey,
} from "./findFoodBank.shared";
import styles from "./FindFoodBank.module.css";

const getSecondaryLine = (foodBank: FoodBank) =>
  canViewFoodBankPackages(foodBank)
    ? "Pacotes de alimentos disponíveis para solicitação"
    : "Ponto de coleta ativo para recebimento de doações";

const getDistanceLabel = (foodBank: FoodBank) =>
  typeof foodBank.distance === "number"
    ? `A ${formatDistanceKilometers(foodBank.distance)} de distância`
    : "Ponto de coleta próximo";

function DetailRow({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.detailRow}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

function FoodBankResultCard({
  foodBank,
  isSelected,
  onSelect,
  onViewPackages,
}: {
  foodBank: FoodBank;
  isSelected: boolean;
  onSelect: () => void;
  onViewPackages: (foodBank: FoodBank) => void;
}) {
  const canViewPackages = canViewFoodBankPackages(foodBank);
  const details = [
    {
      key: "address",
      icon: <MapPinned className={styles.detailIcon} />,
      text: foodBank.address,
    },
    {
      key: "status",
      icon: <PackageSearch className={styles.detailIcon} />,
      text: getSecondaryLine(foodBank),
    },
    ...(foodBank.phone || foodBank.email
      ? [
          {
            key: "contact",
            icon: foodBank.phone ? (
              <PhoneCall className={styles.detailIcon} />
            ) : (
              <Mail className={styles.detailIcon} />
            ),
            text: foodBank.phone ?? foodBank.email ?? "",
          },
        ]
      : []),
    {
      key: "distance",
      icon: <Navigation className={styles.detailIcon} />,
      text: getDistanceLabel(foodBank),
    },
  ];

  return (
    <article
      className={cn(styles.resultCard, isSelected && styles.resultCardSelected)}
      onClick={onSelect}
    >
      <h4 className={styles.resultCardTitle}>
        <div className={styles.resultCardTitleText}>
          {foodBank.url ? (
            <a
              href={foodBank.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className={styles.resultCardLink}
            >
              {foodBank.name}
              <ArrowUpRight className={styles.inlineIcon} />
            </a>
          ) : (
            foodBank.name
          )}
        </div>
      </h4>
      <div className={styles.resultCardBody}>
        {details.map(({ key, icon, text }) => (
          <DetailRow key={key} icon={icon}>
            {text}
          </DetailRow>
        ))}
        <div className={styles.actionsRow}>
          <ActionButton
            tone="outline"
            size="sm"
            disabled={!canViewPackages}
            title={
              canViewPackages
                ? undefined
                : "Este ponto de coleta ainda não possui pacotes cadastrados para visualização online."
            }
            onClick={(event) => {
              event.stopPropagation();
              if (canViewPackages) {
                onViewPackages(foodBank);
              }
            }}
            className={cn(
              styles.resultActionButton,
              styles.resultActionButtonOutline,
            )}
            iconStart={<PackageOpen className={styles.inlineIcon} />}
          >
            Ver Pacotes
          </ActionButton>
          <ActionButton
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodBank.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            tone="primary"
            size="sm"
            className={styles.resultActionButton}
            iconStart={<Navigation className={styles.inlineIcon} />}
          >
            Como Chegar
          </ActionButton>
        </div>
      </div>
    </article>
  );
}

export function FindFoodBankHeroSection() {
  return (
    <div className={styles.pageHero}>
      <div className={styles.pageHeroInner}>
        <PublicSectionIntro
          title={
            <>
              Localize um ponto de coleta{" "}
              <span className={styles.pageTitleAccent}>próximo a você</span>
            </>
          }
          description="Pesquise por CEP ou bairro para visualizar os pontos de coleta do Colhe+ em São José dos Campos."
          descriptionExtraLine="Pontos de coleta recebem doações de produtores, comerciantes e moradores e realizam a redistribuição às famílias."
          titleAs="h1"
          size="hero"
          className={styles.pageHeroIntro}
        />
      </div>
    </div>
  );
}

export function FindFoodBankSearchPanel({
  isSearching,
  localPostcode,
  onChangePostcode,
  onSubmit,
}: {
  isSearching: boolean;
  localPostcode: string;
  onChangePostcode: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <PublicSearchPanel
      title="Buscar por CEP"
      description="Informe seu CEP para localizar os pontos de coleta mais próximos"
      value={localPostcode}
      onChange={onChangePostcode}
      onSubmit={onSubmit}
      placeholder="Ex: 12245-000"
      submitLabel="Buscar Pontos de Coleta"
      submittingLabel="Buscando..."
      isSubmitting={isSearching}
      icon={<Search className={styles.searchIcon} />}
      className={styles.searchPanel}
      introClassName={styles.searchPanelIntro}
      inputProps={{ type: "text", "aria-label": "CEP para busca de pontos de coleta" }}
    />
  );
}

export function FindFoodBankResultsLayout({
  currentPage,
  displayedResults,
  hasSearched,
  onChangePage,
  onSelectFoodBank,
  onViewPackages,
  searchedLocation,
  searchError,
  searchResults,
  selectedFoodBankKey,
  summary,
  totalPages,
}: {
  currentPage: number;
  displayedResults: FoodBank[];
  hasSearched: boolean;
  onChangePage: (page: number) => void;
  onSelectFoodBank: (foodBank: FoodBank) => void;
  onViewPackages: (foodBank: FoodBank) => void;
  searchedLocation: { lat: number; lng: number } | null;
  searchError: string | null;
  searchResults: FoodBank[];
  selectedFoodBankKey: string | null;
  summary: string;
  totalPages: number;
}) {
  return (
    <div className={styles.contentGrid}>
      <div className={styles.mapColumn}>
        <div className={styles.mapPanel}>
          <h3 className={styles.panelTitle}>Mapa de Pontos de Coleta</h3>
          <div className={styles.mapBody}>
            <FoodBankMap
              foodBanks={searchResults}
              searchedLocation={searchedLocation}
              selectedFoodBankKey={selectedFoodBankKey}
              onSelectFoodBank={onSelectFoodBank}
            />
          </div>
        </div>
      </div>
      <div>
        <div className={styles.resultsPanel}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.panelTitle}>Pontos de Coleta Próximos</h3>
            <p className={styles.summaryText}>{summary}</p>
          </div>
          <div className={styles.resultsStack}>
            {displayedResults.map((foodBank) => {
              const key = getFoodBankKey(foodBank);
              return (
                <FoodBankResultCard
                  key={key}
                  foodBank={foodBank}
                  isSelected={selectedFoodBankKey === key}
                  onSelect={() => onSelectFoodBank(foodBank)}
                  onViewPackages={onViewPackages}
                />
              );
            })}
            {hasSearched && searchResults.length === 0 ? (
              searchError ? (
                <p className={styles.errorText}>Erro na busca: {searchError}</p>
              ) : (
                <div className={styles.emptyState}>
                  Nenhum ponto de coleta foi encontrado para este CEP. Tente outro
                  CEP de São José dos Campos ou consulte a lista geral no mapa.
                </div>
              )
            ) : null}
          </div>
          <PublicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onChangePage}
            className={styles.pagination}
            previousLabel={
              <>
                <ChevronLeft size={16} /> Anterior
              </>
            }
            nextLabel={
              <>
                Próximo <ChevronRight size={16} />
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
