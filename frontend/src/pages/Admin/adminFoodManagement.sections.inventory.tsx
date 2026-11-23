import { useEffect, useMemo, useState } from "react";
import type { InventoryItem } from "@/shared/types/inventory";
import {
  buildLotReference,
  toggleSelectedGroup,
  toggleSelectedId,
} from "./builders";
import type { FoodBankOption } from "./adminFoodManagement.data.shared";
import {
  type InventoryLotRow,
  type NameThresholdTarget,
  type PackageRow,
} from "./adminFoodManagement.types";
import {
  AdminSelectableTableSectionShell,
  AdminTableActionButtons,
  type AdminTableRowAction,
  type TableColumn,
} from "./adminFoodManagement.selectableTable.sections";
import { getStatusToneClasses } from "./sectionHelpers";
import { AdminActionGroup, AdminButton } from "./chrome";
import { formatUkDate, getDaysUntilDate } from "./formatting";
import { matchesSearch, normalizeSearch } from "./rules";
import { buildFilterOptions, type FilterOption } from "./sectionBits.filters";
import {
  AdminSummaryCard,
  AdminSummaryCardDetails,
  ConfigurableAdminCardSection,
} from "./sectionBits.sections.cards";
import adminStyles from "./admin.module.css";

type AdminStatusTone = "success" | "warning" | "error" | "muted" | "active";

const LOT_STATUS_OPTIONS: FilterOption[] = [
  { value: "Próximo do Vencimento", label: "Próximo do Vencimento" },
  { value: "Vencido", label: "Vencido" },
];

const buildItemDetailRows = (item: InventoryItem) => [
  { label: "Estoque Atual", value: `${item.stock} ${item.unit}` },
  { label: "Estoque Mínimo", value: `${item.threshold} ${item.unit}` },
  { label: "Déficit", value: Math.max(item.threshold - item.stock, 0) },
];

const renderItemCard = (
  item: InventoryItem,
  handlers: Pick<
    AdminItemsSectionProps,
    "onEditItem" | "onAdjustItem" | "onDeleteItem"
  >,
) => {
  const isBelowThreshold = item.stock < item.threshold;

  return (
    <AdminSummaryCard
      key={item.id}
      tone={isBelowThreshold ? "warning" : "default"}
      data-item-id={item.id}
      title={item.name}
      details={<AdminSummaryCardDetails rows={buildItemDetailRows(item)} />}
      note={
        isBelowThreshold ? (
          <span className={adminStyles["threshold-warning-notice"]}>
            {" "}
            Estoque abaixo do limite mínimo de segurança.
          </span>
        ) : null
      }
      actions={
        <AdminActionGroup variant="card">
          <AdminButton
            tone="secondary"
            size="sm"
            className="edit-item-btn"
            onClick={() =>
              handlers.onEditItem({
                id: item.id,
                name: item.name,
                threshold: item.threshold,
              })
            }
          >
            {" "}
            Editar
          </AdminButton>
          <AdminButton
            size="sm"
            className="stock-in-btn"
            onClick={() => handlers.onAdjustItem(item.id)}
          >
            {" "}
            + Entrada
          </AdminButton>
          <AdminButton
            tone="danger"
            size="sm"
            className="delete-item-btn"
            onClick={() => handlers.onDeleteItem(item.id, item.name)}
          >
            {" "}
            Excluir
          </AdminButton>
        </AdminActionGroup>
      }
    />
  );
};

const isLotExpiringSoon = (lot: InventoryLotRow) =>
  lot.status === "active" &&
  (() => {
    const diffDays = getDaysUntilDate(lot.expiry_date);
    return diffDays != null && diffDays >= 0 && diffDays <= 14;
  })();

const getLotStatusMeta = (lot: InventoryLotRow) =>
  lot.status === "wasted" || lot.status === "expired"
    ? {
        label: lot.status === "wasted" ? "Descartado" : "Vencido",
        tone: "error" as const,
      }
    : isLotExpiringSoon(lot)
      ? { label: "Próximo do Vencimento", tone: "warning" as const }
      : { label: "Ativo", tone: "active" as const };

const createCategoryByItemId = (inventoryItems: InventoryItem[]) =>
  new Map(inventoryItems.map((item) => [item.id, item.category]));

type LotTableRow = InventoryLotRow & {
  category: string;
  reference: string;
  receivedDateLabel: string;
  expiryDateLabel: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  canDelete: boolean;
  canMarkWasted: boolean;
};

const buildLotTableRows = (
  lotRows: InventoryLotRow[],
  categoryByItemId: Map<number, string>,
) =>
  // Enrich raw lot rows once so filters, table columns, and batch actions all
  // read from the same derived status and label interpretation.
  lotRows.map((lot) => {
    const statusMeta = getLotStatusMeta(lot);

    return {
      ...lot,
      category: categoryByItemId.get(lot.inventory_item_id) ?? "",
      reference: buildLotReference(lot),
      receivedDateLabel: formatUkDate(lot.received_date),
      expiryDateLabel: formatUkDate(lot.expiry_date),
      statusLabel: statusMeta.label,
      statusTone: statusMeta.tone,
      canDelete: lot.status !== "active",
      canMarkWasted:
        lot.status === "active" && statusMeta.label === "Próximo do Vencimento",
    };
  });

const buildLotCategoryOptions = (lotTableRows: LotTableRow[]): FilterOption[] =>
  buildFilterOptions(lotTableRows.map((lot) => lot.category));

const filterLotTableRows = ({
  lotTableRows,
  search,
  categoryFilter,
  statusFilter,
}: {
  lotTableRows: LotTableRow[];
  search: string;
  categoryFilter: string;
  statusFilter: string;
}) => {
  const needle = normalizeSearch(search);

  return lotTableRows.filter(
    (lot) =>
      (!categoryFilter || lot.category === categoryFilter) &&
      (!statusFilter || lot.statusLabel === statusFilter) &&
      matchesSearch(
        needle,
        lot.item_name,
        lot.reference,
        lot.receivedDateLabel,
        lot.expiryDateLabel,
        lot.statusLabel,
        lot.category,
        lot.quantity,
      ),
  );
};

type LotActionHandlers = {
  onEditExpiry: (lotId: number, expiryDate: string) => void;
  onToggleStatus: (lotId: number, status: InventoryLotRow["status"]) => void;
  onDeleteLot: (lotId: number) => void;
};

const buildLotTableActions = (
  lot: LotTableRow,
  handlers: LotActionHandlers,
): AdminTableRowAction[] => {
  const actions: AdminTableRowAction[] = [];

  if (!lot.canDelete) {
    actions.push({
      label: "Editar Validade",
      tone: "secondary",
      className: "edit-lot-btn",
      onClick: () => handlers.onEditExpiry(lot.id, lot.expiry_date),
    });
  }

  if (lot.canMarkWasted) {
    actions.push({
      label: "Registrar Descarte",
      tone: "danger",
      className: "mark-wasted-btn",
      onClick: () => handlers.onToggleStatus(lot.id, lot.status),
    });
  }

  if (lot.canDelete) {
    actions.push({
      label: "Excluir",
      tone: "secondary",
      className: "delete-lot-btn",
      onClick: () => handlers.onDeleteLot(lot.id),
    });
  }

  return actions;
};

const createLotColumns = (
  handlers: LotActionHandlers,
): TableColumn<LotTableRow>[] => [
  { header: "Nome do Alimento", renderCell: (lot) => lot.item_name },
  { header: "Lote", renderCell: (lot) => lot.reference },
  { header: "Data de Entrada", renderCell: (lot) => lot.receivedDateLabel },
  { header: "Data de Validade", renderCell: (lot) => lot.expiryDateLabel },
  { header: "Estoque Restante", renderCell: (lot) => lot.quantity },
  {
    header: "Status",
    renderCell: (lot) => (
      <span className={getStatusToneClasses(lot.statusTone)}>
        {lot.statusLabel}
      </span>
    ),
  },
  {
    header: "Ações",
    renderCell: (lot) => (
      <AdminTableActionButtons
        rowKey={lot.id}
        actions={buildLotTableActions(lot, handlers)}
      />
    ),
  },
];

function PackageContentsList({ pkg }: { pkg: PackageRow }) {
  return (
    <div className={adminStyles["admin-package-contents-list"]}>
      {pkg.contents.length > 0 ? (
        pkg.contents.map((content) => (
          <div
            key={`${pkg.id}-${content.itemId}`}
            className={adminStyles["admin-package-content-row"]}
          >
            <span>{content.name}</span>
            <span>{`x${content.quantity}`}</span>
          </div>
        ))
      ) : (
        <div className={adminStyles["admin-summary-card-muted"]}>
          {" "}
          Nenhum item configurado
        </div>
      )}
    </div>
  );
}

const renderPackageCard = (
  pkg: PackageRow,
  handlers: Pick<
    AdminPackagesSectionProps,
    "onDeletePackage" | "onEditPackage" | "onOpenPackTab"
  >,
) => (
  <AdminSummaryCard
    key={pkg.key}
    data-package-id={pkg.id}
    title={pkg.name}
    meta={
      <div className={adminStyles["admin-package-meta-row"]}>
        <span>Estoque montado: {pkg.stock}</span>
        <span>Meta mínima: {pkg.threshold}</span>
      </div>
    }
    actions={
      <AdminActionGroup variant="card">
        <AdminButton
          size="sm"
          className="packing-btn"
          onClick={() => handlers.onOpenPackTab(pkg.id)}
        >
          {" "}
          Montar Cestas
        </AdminButton>
        <AdminButton
          tone="secondary"
          size="sm"
          className="edit-package-btn"
          onClick={() =>
            handlers.onEditPackage({
              id: pkg.id,
              name: pkg.name,
              threshold: pkg.threshold,
            })
          }
        >
          {" "}
          Editar
        </AdminButton>
        <AdminButton
          tone="danger"
          size="sm"
          className="delete-package-btn"
          onClick={() => handlers.onDeletePackage({ id: pkg.id, name: pkg.name })}
        >
          {" "}
          Excluir
        </AdminButton>
      </AdminActionGroup>
    }
  >
    <PackageContentsList pkg={pkg} />
  </AdminSummaryCard>
);

export type AdminItemsSectionProps = {
  search: string;
  inventoryItems: InventoryItem[];
  isLoadingData: boolean;
  onSearchChange: (value: string) => void;
  onAddItem: () => void;
  onEditItem: (target: NameThresholdTarget) => void;
  onAdjustItem: (itemId: number) => void;
  onDeleteItem: (itemId: number, itemName: string) => void;
  foodBankOptions?: FoodBankOption[];
  selectedFoodBankId?: number | null;
  onFoodBankChange?: (foodBankId: number | null) => void;
  searchDisabled?: boolean;
  searchPlaceholder?: string;
  searchScopeKey?: string;
  sectionError?: string;
};

export type AdminLotsSectionProps = {
  inventoryItems: InventoryItem[];
  lotRows: InventoryLotRow[];
  isLoadingLots: boolean;
  lotError: string;
  onEditExpiry: (lotId: number, expiryDate: string) => void;
  onToggleStatus: (lotId: number, status: InventoryLotRow["status"]) => void;
  onDeleteLot: (lotId: number) => void;
  onBatchWasteLots: (lotIds: number[]) => Promise<void>;
  onBatchDeleteLots: (lotIds: number[]) => Promise<void>;
  heading?: string;
};

export interface AdminPackagesSectionProps {
  packageRows: PackageRow[];
  isLoadingData: boolean;
  onAddPackage: () => void;
  onEditPackage: (target: NameThresholdTarget) => void;
  onDeletePackage: (target: { id: number; name: string }) => void;
  onOpenPackTab: (packageId: number) => void;
  foodBankOptions?: FoodBankOption[];
  selectedFoodBankId?: number | null;
  onFoodBankChange?: (foodBankId: number | null) => void;
  searchDisabled?: boolean;
  searchPlaceholder?: string;
  searchScopeKey?: string;
  emptyStateMessage?: string | null;
  sectionError?: string;
  heading?: string;
  addButtonLabel?: string;
}

export function AdminItemsSection({
  search,
  inventoryItems,
  isLoadingData,
  onSearchChange,
  onAddItem,
  onEditItem,
  onAdjustItem,
  onDeleteItem,
  foodBankOptions,
  selectedFoodBankId,
  onFoodBankChange,
  searchDisabled = false,
  searchPlaceholder = "Buscar alimentos em estoque...",
  searchScopeKey = "",
  sectionError = "",
}: AdminItemsSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    setCategoryFilter("");
  }, [searchScopeKey]);

  const categoryOptions = useMemo<FilterOption[]>(
    () => buildFilterOptions(inventoryItems.map((item) => item.category)),
    [inventoryItems],
  );

  const filteredItems = useMemo(() => {
    const needle = normalizeSearch(search);

    return inventoryItems.filter(
      (item) =>
        (!categoryFilter || item.category === categoryFilter) &&
        matchesSearch(
          needle,
          item.name,
          item.category,
          item.unit,
          item.stock,
          item.threshold,
        ),
    );
  }, [categoryFilter, inventoryItems, search]);

  return (
    <ConfigurableAdminCardSection
      errorMessage={sectionError}
      title="Estoque de Alimentos"
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: searchPlaceholder,
        disabled: searchDisabled,
      }}
      toolbarAction={{
        id: "new-item-btn",
        label: "+ Novo Alimento",
        onClick: onAddItem,
      }}
      filters={[
        ...(foodBankOptions
          ? [
              {
                type: "food-bank" as const,
                id: "inventory-food-bank-filter",
                foodBankOptions,
                selectedFoodBankId,
                onFoodBankChange,
              },
            ]
          : []),
        {
          type: "select" as const,
          id: "inventory-category-filter",
          value: categoryFilter,
          options: categoryOptions,
          placeholder: "Todas as Categorias",
          onChange: setCategoryFilter,
        },
      ]}
      gridId="inventory-card-grid"
      items={filteredItems}
      hideEmptyState={
        !!foodBankOptions && selectedFoodBankId == null && searchDisabled
      }
      emptyStateTitle={
        isLoadingData ? "Carregando estoque..." : "Nenhum alimento cadastrado"
      }
      renderCard={(item) =>
        renderItemCard(item, { onEditItem, onAdjustItem, onDeleteItem })
      }
    />
  );
}

export function AdminLotsSection({
  inventoryItems,
  lotRows,
  isLoadingLots,
  lotError,
  onEditExpiry,
  onToggleStatus,
  onDeleteLot,
  onBatchWasteLots,
  onBatchDeleteLots,
  heading,
}: AdminLotsSectionProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLotIds, setSelectedLotIds] = useState<number[]>([]);
  const [batchAction, setBatchAction] = useState<"waste" | "delete" | null>(
    null,
  );

  useEffect(() => {
    const validIds = new Set(lotRows.map((lot) => lot.id));
    setSelectedLotIds((current) => current.filter((id) => validIds.has(id)));
  }, [lotRows]);

  const categoryByItemId = useMemo(
    () => createCategoryByItemId(inventoryItems),
    [inventoryItems],
  );

  const lotTableRows = useMemo(
    () => buildLotTableRows(lotRows, categoryByItemId),
    [categoryByItemId, lotRows],
  );

  const categoryOptions = useMemo(
    () => buildLotCategoryOptions(lotTableRows),
    [lotTableRows],
  );

  const filteredLots = useMemo(
    () =>
      filterLotTableRows({
        lotTableRows,
        search,
        categoryFilter,
        statusFilter,
      }),
    [categoryFilter, lotTableRows, search, statusFilter],
  );

  const selectedLotIdSet = useMemo(
    () => new Set(selectedLotIds),
    [selectedLotIds],
  );

  const selectedLots = useMemo(
    () => lotTableRows.filter((lot) => selectedLotIdSet.has(lot.id)),
    [lotTableRows, selectedLotIdSet],
  );

  const activeSelectedCount = selectedLots.filter(
    (lot) => lot.status === "active",
  ).length;
  const inactiveSelectedCount = selectedLots.filter(
    (lot) => lot.status !== "active",
  ).length;

  const runBatchAction = async (
    action: "waste" | "delete",
    task: () => Promise<void>,
  ) => {
    setBatchAction(action);
    try {
      await task();
    } finally {
      setBatchAction(null);
    }
  };

  return (
    <AdminSelectableTableSectionShell
      title={heading ?? "Lotes de Alimentos"}
      errorMessage={lotError}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar registros de lotes..."
      filters={[
        {
          type: "select",
          value: categoryFilter,
          options: categoryOptions,
          placeholder: "Todas as Categorias",
          onChange: setCategoryFilter,
        },
        {
          type: "select",
          value: statusFilter,
          options: LOT_STATUS_OPTIONS,
          placeholder: "Todos os Status",
          onChange: setStatusFilter,
        },
      ]}
      selectAllId="select-all-lots"
      countId="lot-selected-count"
      rows={filteredLots}
      selectedRowIds={selectedLotIdSet}
      getRowId={(lot) => lot.id}
      onToggleRow={(lotId) =>
        setSelectedLotIds((current) => toggleSelectedId(current, lotId))
      }
      onToggleAll={(visibleLotIds) =>
        setSelectedLotIds((current) =>
          toggleSelectedGroup(current, visibleLotIds ?? []),
        )
      }
      batchButtons={[
        {
          id: "batch-waste-lots",
          label: "Registrar Descarte dos Selecionados",
          busyLabel: "Processando...",
          tone: "danger",
          disabled: activeSelectedCount === 0 || batchAction !== null,
          onClick: () =>
            void runBatchAction("waste", () =>
              onBatchWasteLots(selectedLotIds),
            ),
        },
        {
          id: "batch-delete-lots",
          label: "Excluir Selecionados",
          busyLabel: "Processando...",
          tone: "secondary",
          disabled: inactiveSelectedCount === 0 || batchAction !== null,
          onClick: () =>
            void runBatchAction("delete", () =>
              onBatchDeleteLots(selectedLotIds),
            ),
        },
      ]}
      isLoading={isLoadingLots}
      loadingMessage="Carregando lotes..."
      emptyMessage="Nenhum lote registrado."
      paginationId="lot-pagination"
      tableId="lot-table"
      bodyId="lot-table-body"
      paginationKey={`${search}|${categoryFilter}|${statusFilter}`}
      columns={createLotColumns({ onEditExpiry, onToggleStatus, onDeleteLot })}
      getRowMeta={(lot) => ({ dataAttributes: { "data-id": lot.id } })}
    />
  );
}

export function AdminPackagesSection({
  packageRows,
  isLoadingData,
  onAddPackage,
  onEditPackage,
  onDeletePackage,
  onOpenPackTab,
  foodBankOptions,
  selectedFoodBankId,
  onFoodBankChange,
  searchDisabled = false,
  searchPlaceholder = "Buscar cestas de alimentos...",
  searchScopeKey = "",
  emptyStateMessage = null,
  sectionError = "",
  heading = "Cestas de Alimentos",
  addButtonLabel = "Nova Cesta",
}: AdminPackagesSectionProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch("");
  }, [searchScopeKey]);

  const filteredPackages = useMemo(() => {
    const needle = normalizeSearch(search);
    return packageRows.filter((pkg) =>
      matchesSearch(
        needle,
        pkg.name,
        pkg.category,
        ...pkg.contents.flatMap((content) => [
          content.name,
          content.quantity,
          content.unit,
        ]),
      ),
    );
  }, [packageRows, search]);

  return (
    <ConfigurableAdminCardSection
      errorMessage={sectionError}
      title={heading}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: searchPlaceholder,
        disabled: searchDisabled,
      }}
      toolbarAction={{
        id: "new-package-btn",
        label: `+ ${addButtonLabel}`,
        onClick: onAddPackage,
      }}
      filters={
        foodBankOptions
          ? [
              {
                type: "food-bank",
                id: "package-food-bank-filter",
                foodBankOptions,
                selectedFoodBankId,
                onFoodBankChange,
              },
            ]
          : undefined
      }
      gridId="package-card-grid"
      gridVariant="compact"
      items={emptyStateMessage ? [] : filteredPackages}
      emptyStateTitle={
        emptyStateMessage ??
        (isLoadingData ? "Carregando cestas..." : "Nenhuma cesta encontrada")
      }
      emptyStateTone={emptyStateMessage ? "warning" : "default"}
      renderCard={(pkg) =>
        renderPackageCard(pkg, {
          onDeletePackage,
          onEditPackage,
          onOpenPackTab,
        })
      }
    />
  );
}
