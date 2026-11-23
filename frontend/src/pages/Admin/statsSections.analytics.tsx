import type { ReactNode } from "react";
import type {
  DashboardAnalyticsResponse,
  DashboardDisplayCard,
  DashboardExpiringLot,
  DashboardVerificationRecord,
} from "@/shared/lib/api/stats";
import { cn } from "@/shared/lib/cn";
import { AdminButton } from "./chrome";
import { ChartRenderer, type ChartConfig } from "./chartRenderer";
import { getStatusToneClasses } from "./sectionHelpers";
import adminStyles from "./admin.module.css";
import {
  loadingKpiCount,
  rangeLabels,
  rangeOptions,
  type DashboardRange,
} from "./useAdminDashboardData";
const DEFAULT_SHELL = {
  loadingMessage: "Carregando gráfico...",
  emptyMessage: "Nenhum dado disponível para este gráfico.",
};
export type ChartLegendSwatchTone =
  | "brand"
  | "brand-dark"
  | "blue"
  | "purple"
  | "success"
  | "warning"
  | "error";
export type ChartLegendItem = {
  label: string;
  value: string;
  swatchTone?: ChartLegendSwatchTone;
  swatchColor?: string;
  description?: string;
  details?: Array<{ label: string; value: string }>;
};
export type ChartLegendConfig = {
  items: ChartLegendItem[];
  ariaLabel?: string;
};
export type ChartPanel = {
  title: string;
  loadingId: string;
  chartId: string;
  chartConfig: ChartConfig | null;
  legend?: ChartLegendConfig;
  shell?: Partial<typeof DEFAULT_SHELL>;
};
const renderMessage = (message: string, id?: string) => (
  <div id={id} className={adminStyles.loading}>
    {message}
  </div>
);
const formatLegendValue = (value: number) =>
  value.toLocaleString(undefined, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
const buildDefaultChartLegend = (
  chartConfig: ChartConfig,
): ChartLegendConfig | null => {
  if (chartConfig.type !== "doughnut" && chartConfig.type !== "pie") {
    return null;
  }
  return {
    items: chartConfig.labels.map((label, index) => ({
      label,
      value: formatLegendValue(chartConfig.values[index] ?? 0),
      swatchColor: chartConfig.colors[index % chartConfig.colors.length],
    })),
  };
};
const renderLegend = (title: string, legend: ChartLegendConfig) => (
  <div
    className={adminStyles["chart-legend"]}
    aria-label={legend.ariaLabel ?? `${title} legend`}
  >
    {legend.items.map((item) => (
      <div
        key={`${item.label}-${item.value}`}
        className={cn(
          adminStyles["chart-legend-item"],
          !item.swatchTone &&
            !item.swatchColor &&
            adminStyles["chart-legend-item--supplemental"],
        )}
      >
        <div className={adminStyles["chart-legend-row"]}>
          <div className={adminStyles["chart-legend-label"]}>
            <span
              className={cn(
                adminStyles["chart-legend-swatch"],
                item.swatchTone
                  ? adminStyles[`chart-legend-swatch--${item.swatchTone}`]
                  : !item.swatchColor
                    ? adminStyles["chart-legend-swatch--neutral"]
                    : undefined,
              )}
              style={
                item.swatchColor ? { background: item.swatchColor } : undefined
              }
            />
            <span>{item.label}</span>
          </div>
          <span className={adminStyles["chart-legend-value"]}>
            {item.value}
          </span>
        </div>
        {item.description ? (
          <p className={adminStyles["chart-legend-description"]}>
            {item.description}
          </p>
        ) : null}
        {item.details?.length ? (
          <div className={adminStyles["chart-legend-details"]}>
            {item.details.map((detail) => (
              <div
                key={`${item.label}-${detail.label}`}
                className={adminStyles["chart-legend-detail"]}
              >
                <span>{detail.label}</span>
                <span className={adminStyles["chart-legend-detail-value"]}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    ))}
  </div>
);
function StatsChart({
  title,
  chartConfig,
  isLoading,
  loadingId,
  chartId,
  legend,
  shell,
}: ChartPanel & { isLoading: boolean }) {
  const messages = { ...DEFAULT_SHELL, ...(shell ?? {}) };
  const showChart = !isLoading && Boolean(chartConfig);
  // Side legends are reserved for curated analytical context, while pie-like
  // charts can fall back to an auto-generated legend underneath.
  const sideLegend = showChart && legend?.items.length ? legend : null;
  const bottomLegend =
    showChart && !sideLegend && chartConfig
      ? buildDefaultChartLegend(chartConfig)
      : null;
  return (
    <div className={adminStyles["chart-card"]}>
      <h3 className={adminStyles["chart-title"]}>{title}</h3>
      <div
        className={
          showChart && sideLegend?.items.length
            ? cn(
                adminStyles["chart-card-content"],
                adminStyles["chart-card-content--with-legend"],
              )
            : adminStyles["chart-card-content"]
        }
      >
        <div className={adminStyles["chart-container"]}>
          {isLoading ? (
            renderMessage(messages.loadingMessage, loadingId)
          ) : !showChart || !chartConfig ? (
            renderMessage(messages.emptyMessage)
          ) : (
            <ChartRenderer chartConfig={chartConfig} id={chartId} />
          )}
        </div>
        {showChart && sideLegend?.items.length
          ? renderLegend(title, sideLegend)
          : null}
      </div>
      {showChart && bottomLegend?.items.length
        ? renderLegend(title, bottomLegend)
        : null}
    </div>
  );
}
type MetricCardPanel = DashboardDisplayCard & {
  cardId?: string;
  titleId?: string;
  valueId?: string;
  subtitleId?: string;
  trendId?: string;
};
type KpiCard = {
  key: string;
  label: ReactNode;
  value: ReactNode;
  trend?: ReactNode;
  valueTone?: "warning" | "success";
  trendTone?: "up" | "down" | "warning";
};
// Match the live KPI card count during loading so the dashboard grid does not
// jump between states while analytics refresh in place.
const loadingCards: KpiCard[] = Array.from(
  { length: loadingKpiCount },
  (_, index) => ({ key: `loading-${index}`, label: "Carregando...", value: "--" }),
);
const buildKpiCards = (
  range: DashboardRange,
  analytics: DashboardAnalyticsResponse,
): KpiCard[] => {
  const { kpi } = analytics;
  const timeLabel = rangeLabels[range];
  return [
    {
      key: "goods-donation-units",
      label: `Alimentos Doados (${timeLabel})`,
      value: kpi.totalDonation.toLocaleString("pt-BR"),
      trend: kpi.trends.donation,
      trendTone: "up",
    },
    {
      key: "packages-distributed",
      label: `Cestas Distribuídas (${timeLabel})`,
      value: kpi.totalPackageDistributed.toLocaleString("pt-BR"),
      trend: kpi.trends.package,
      trendTone: "up",
    },
    {
      key: "low-stock-items",
      label: "Itens com Baixo Estoque",
      value: kpi.lowStockCount,
      trend: kpi.trends.lowStock,
      trendTone: "down",
      valueTone: kpi.lowStockCount > 0 ? "warning" : "success",
    },
    {
      key: "expiring-soon-lots",
      label: "Lotes a Vencer (30 dias)",
      value: kpi.expiringLotCount,
      trend: kpi.trends.expiringLots,
      trendTone: "warning",
      valueTone: kpi.expiringLotCount > 0 ? "warning" : "success",
    },
    {
      key: "redemption-success-rate",
      label: "Taxa de Sucesso nas Retiradas",
      value: `${kpi.redemptionRate}%`,
    },
  ];
};
const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  cardId,
  titleId,
  valueId,
  subtitleId,
  trendId,
}: MetricCardPanel) => (
  <div className={adminStyles["chart-card"]} id={cardId}>
    <h3 className={adminStyles["chart-title"]} id={titleId}>
      {title}
    </h3>
    <div
      className={cn(adminStyles["chart-container"], adminStyles["metric-body"])}
    >
      <div id={valueId} className={adminStyles["metric-value"]}>
        {value}
      </div>
      <div id={subtitleId} className={adminStyles["metric-subtitle"]}>
        {subtitle}
      </div>
      {trend ? (
        <p id={trendId} className={adminStyles["metric-trend"]}>
          {trend}
        </p>
      ) : null}
    </div>
  </div>
);
function KpiCards({
  range,
  isLoading,
  analytics,
}: {
  range: DashboardRange;
  isLoading: boolean;
  analytics?: DashboardAnalyticsResponse | null;
}) {
  const cards =
    isLoading || !analytics ? loadingCards : buildKpiCards(range, analytics);
  return (
    <div className={adminStyles["kpi-grid"]}>
      {cards.map((card) => (
        <div key={card.key} className={adminStyles["kpi-card"]}>
          <div className={adminStyles["kpi-label"]}>{card.label}</div>
          <div
            className={cn(
              adminStyles["kpi-value"],
              card.valueTone === "warning" && adminStyles["kpi-value--warning"],
              card.valueTone === "success" && adminStyles["kpi-value--success"],
            )}
          >
            {card.value}
          </div>
          {card.trend ? (
            <div
              className={cn(
                adminStyles["kpi-trend"],
                card.trendTone === "up" && adminStyles["trend-up"],
                card.trendTone === "down" && adminStyles["trend-down"],
                card.trendTone === "warning" && adminStyles["trend-warning"],
              )}
            >
              {card.trend}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
type TableConfig<T> = {
  bodyId: string;
  columns: Array<{ header: string; cell: (row: T) => ReactNode }>;
  loadingMessage: string;
  emptyMessage: string;
  rowKey: (row: T) => string;
};
// Table metadata stays declarative so the waste and verification sections can
// share one renderer while keeping domain-specific column copy.
const TABLES = {
  expiring: {
    bodyId: "expiring-lots-body",
    columns: [
      {
        header: "Nome do Alimento",
        cell: (row: DashboardExpiringLot) => row.item_name,
      },
      {
        header: "Número do Lote",
        cell: (row: DashboardExpiringLot) => row.lot_number,
      },
      {
        header: "Data de Validade",
        cell: (row: DashboardExpiringLot) => row.expiry_date,
      },
      {
        header: "Estoque Restante",
        cell: (row: DashboardExpiringLot) => row.remaining_stock_label,
      },
      {
        header: "Dias até Vencer",
        cell: (row: DashboardExpiringLot) => (
          <span className={getStatusToneClasses(row.status_tone)}>
            {row.days_until_expiry} {row.days_until_expiry === 1 ? "dia" : "dias"}
          </span>
        ),
      },
    ],
    loadingMessage: "Carregando lotes a vencer...",
    emptyMessage: "Nenhum lote com vencimento nos próximos 30 dias.",
    rowKey: (row: DashboardExpiringLot) => `${row.item_name}-${row.lot_number}`,
  },
  verification: {
    bodyId: "recent-verification-body",
    columns: [
      {
        header: "Código de Retirada",
        cell: (row: DashboardVerificationRecord) => row.redemption_code,
      },
      {
        header: "Tipo de Cesta",
        cell: (row: DashboardVerificationRecord) => row.package_type,
      },
      {
        header: "Validado em",
        cell: (row: DashboardVerificationRecord) => row.verified_at,
      },
      {
        header: "Status",
        cell: (row: DashboardVerificationRecord) => (
          <span className={getStatusToneClasses(row.status_tone)}>
            {row.status === "verified" || row.status === "Verified"
              ? "Validado"
              : row.status === "pending" || row.status === "Pending"
                ? "Pendente"
                : row.status}
          </span>
        ),
      },
    ],
    loadingMessage: "Carregando histórico de validações...",
    emptyMessage: "Nenhum registro de validação recente.",
    rowKey: (row: DashboardVerificationRecord) =>
      `${row.redemption_code}-${row.verified_at}`,
  },
} satisfies {
  expiring: TableConfig<DashboardExpiringLot>;
  verification: TableConfig<DashboardVerificationRecord>;
};
function DashboardTable<T>({
  rows,
  isLoading,
  config,
}: {
  rows: T[];
  isLoading: boolean;
  config: TableConfig<T>;
}) {
  return (
    <div className={adminStyles["table-wrapper"]}>
      <table className={adminStyles["data-table"]}>
        <thead>
          <tr>
            {config.columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody id={config.bodyId}>
          {isLoading ? (
            <tr>
              <td
                colSpan={config.columns.length}
                className={adminStyles["table-message"]}
              >
                {config.loadingMessage}
              </td>
            </tr>
          ) : !rows.length ? (
            <tr>
              <td
                colSpan={config.columns.length}
                className={adminStyles["table-message"]}
              >
                {config.emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={config.rowKey(row)}>
                {config.columns.map((column) => (
                  <td key={column.header}>{column.cell(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
function StatsBlock({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className={adminStyles.section} id={id}>
      <div className={adminStyles.container}>
        <h2
          className={cn(
            adminStyles["section-title"],
            !subtitle && adminStyles["section-title--without-subtitle"],
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={adminStyles["section-subtitle"]}>{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
const KPI_SECTION_META = {
  title: "Indicadores Principais de Operação",
} as const;
export function StatsKpiSection({
  range,
  setRange,
  isLoading,
  refreshDashboard,
  rangeSummary,
  analytics,
}: {
  range: DashboardRange;
  setRange: (range: DashboardRange) => void;
  isLoading: boolean;
  refreshDashboard: (nextRange?: DashboardRange) => Promise<void>;
  rangeSummary: string;
  analytics?: DashboardAnalyticsResponse | null;
}) {
  return (
    <StatsBlock title={KPI_SECTION_META.title}>
      <div className={adminStyles["filter-bar"]}>
        <div className={adminStyles["filter-group"]}>
          <label
            className={adminStyles["filter-label"]}
            htmlFor="time-range-select"
          >
            {" "}
            Período:
          </label>
          <select
            id="time-range-select"
            className={adminStyles["filter-select"]}
            value={range}
            onChange={(event) => setRange(event.target.value as DashboardRange)}
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <AdminButton
          type="button"
          tone="secondary"
          size="sm"
          id="refresh-data-btn"
          disabled={isLoading}
          onClick={() => void refreshDashboard(range)}
        >
          {isLoading ? "Atualizando..." : "Atualizar Dados"}
        </AdminButton>
      </div>
      <p id="time-range-summary" className={adminStyles["range-summary"]}>
        {rangeSummary}
      </p>
      <KpiCards range={range} isLoading={isLoading} analytics={analytics} />
    </StatsBlock>
  );
}
const SECTION_META = {
  donation: {
    id: "donation-analysis",
    title: "Análise de Doações",
  },
  inventory: {
    id: "inventory-health",
    title: "Situação e Saúde do Estoque",
  },
  distribution: {
    id: "distribution-analysis",
    title: "Distribuição e Destinação de Cestas",
  },
  waste: {
    id: "waste-analysis",
    title: "Prevenção de Perdas e Vencimentos",
    tableTitle: "Lotes com Vencimento Próximo (30 dias)",
  },
  verification: {
    id: "code-verification",
    title: "Validação de Códigos de Retirada",
    tableTitle: "Histórico Recente de Validações",
  },
} as const;
const METRIC_CARD_IDS = {
  averageDonation: {
    cardId: "average-donation-card",
    valueId: "average-donation-value",
    subtitleId: "average-donation-subtitle",
    trendId: "average-donation-trend",
  },
  averageSupport: {
    cardId: "average-support-card",
    titleId: "average-support-title",
    valueId: "average-support-value",
    subtitleId: "average-support-unit",
  },
  itemsPerPackage: {
    cardId: "items-per-package-card",
    titleId: "items-per-package-title",
    valueId: "items-per-package-value",
    subtitleId: "items-per-package-unit",
  },
} satisfies Record<string, Partial<MetricCardPanel>>;
type Row = { className: "chart-grid-2" | "chart-grid-3"; items: ReactNode[] };
type SectionLayout = {
  id?: string;
  title: string;
  subtitle?: string;
  rows: Row[];
  table?: { title: string; node: ReactNode };
};
const chartItems = (panels: ChartPanel[], isLoading: boolean) =>
  panels.map((panel) => (
    <StatsChart key={panel.chartId} {...panel} isLoading={isLoading} />
  ));
const metricItem = (card: MetricCardPanel) => (
  <MetricCard key={card.cardId ?? card.title} {...card} />
);
function StatsAnalyticsSection({
  id,
  title,
  subtitle,
  rows,
  table,
}: SectionLayout) {
  return (
    <StatsBlock id={id} title={title} subtitle={subtitle}>
      {rows.map((row, index) => (
        <div
          key={`${id ?? title}-${index}`}
          className={adminStyles[row.className]}
        >
          {row.items}
        </div>
      ))}
      {table ? (
        <>
          <h3
            className={cn(
              adminStyles["chart-title"],
              adminStyles["chart-title-spaced"],
            )}
          >
            {table.title}
          </h3>
          {table.node}
        </>
      ) : null}
    </StatsBlock>
  );
}
export function DonationSection({
  primaryPanels,
  secondaryPanels,
  averageDonationCard,
  isLoading,
}: {
  primaryPanels: ChartPanel[];
  secondaryPanels: ChartPanel[];
  averageDonationCard: DashboardDisplayCard;
  isLoading: boolean;
}) {
  return (
    <StatsAnalyticsSection
      {...SECTION_META.donation}
      rows={[
        {
          className: "chart-grid-2",
          items: chartItems(primaryPanels, isLoading),
        },
        {
          className: "chart-grid-3",
          items: [
            ...chartItems(secondaryPanels, isLoading),
            metricItem({
              ...averageDonationCard,
              ...METRIC_CARD_IDS.averageDonation,
            }),
          ],
        },
      ]}
    />
  );
}
export function InventorySection({
  panels,
  isLoading,
}: {
  panels: ChartPanel[];
  isLoading: boolean;
}) {
  return (
    <StatsAnalyticsSection
      {...SECTION_META.inventory}
      rows={[
        { className: "chart-grid-2", items: chartItems(panels, isLoading) },
      ]}
    />
  );
}
export function DistributionSection({
  primaryPanels,
  packageTypePanel,
  averageSupportCard,
  itemsPerPackageCard,
  isLoading,
}: {
  primaryPanels: ChartPanel[];
  packageTypePanel: ChartPanel;
  averageSupportCard: DashboardDisplayCard;
  itemsPerPackageCard: DashboardDisplayCard;
  isLoading: boolean;
}) {
  return (
    <StatsAnalyticsSection
      {...SECTION_META.distribution}
      rows={[
        {
          className: "chart-grid-2",
          items: chartItems(primaryPanels, isLoading),
        },
        {
          className: "chart-grid-3",
          items: [
            ...chartItems([packageTypePanel], isLoading),
            metricItem({
              ...averageSupportCard,
              ...METRIC_CARD_IDS.averageSupport,
            }),
            metricItem({
              ...itemsPerPackageCard,
              ...METRIC_CARD_IDS.itemsPerPackage,
            }),
          ],
        },
      ]}
    />
  );
}
export function WasteSection({
  panels,
  expiringLots,
  isLoading,
}: {
  panels: ChartPanel[];
  expiringLots: DashboardExpiringLot[];
  isLoading: boolean;
}) {
  return (
    <StatsAnalyticsSection
      {...SECTION_META.waste}
      rows={[
        { className: "chart-grid-2", items: chartItems(panels, isLoading) },
      ]}
      table={{
        title: SECTION_META.waste.tableTitle,
        node: (
          <DashboardTable
            rows={expiringLots}
            isLoading={isLoading}
            config={TABLES.expiring}
          />
        ),
      }}
    />
  );
}
export function VerificationSection({
  panels,
  verificationRows,
  isLoading,
}: {
  panels: ChartPanel[];
  verificationRows: DashboardVerificationRecord[];
  isLoading: boolean;
}) {
  return (
    <StatsAnalyticsSection
      {...SECTION_META.verification}
      rows={[
        { className: "chart-grid-2", items: chartItems(panels, isLoading) },
      ]}
      table={{
        title: SECTION_META.verification.tableTitle,
        node: (
          <DashboardTable
            rows={verificationRows}
            isLoading={isLoading}
            config={TABLES.verification}
          />
        ),
      }}
    />
  );
}
