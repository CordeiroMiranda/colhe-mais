import type { AdminApplicationRecord } from "@/shared/lib/api/applications";
import type { DonationListRow } from "@/shared/types/donations";
import type {
  DonationDonorType,
  DonationStatusFilter,
} from "./adminFoodManagement.types";
import {
  AdminSelectableTableSectionShell,
  AdminTableActionButtons,
  type TableColumn,
} from "./adminFoodManagement.selectableTable.sections";
import {
  buildRowActions,
  countSelectedRows,
  DONATION_FILTER_DONOR_TYPE_OPTIONS,
  DONATION_STATUS_OPTIONS,
  renderStatusDetail,
  type RowActionSet,
} from "./sectionHelpers";
import {
  buildDonationDisplayId,
  buildDonationTotalLabel,
  formatUkDate,
} from "./formatting";
import {
  canEditDonation,
  canVoidApplication,
  getApplicationPackageLabel,
  getApplicationStatusLabel,
  getApplicationStatusTone,
  getDonationDateLabel,
  getDonationDonorTypeLabel,
  getDonationStatusLabel,
  isPendingGoodsDonation,
} from "./rules";

type CodeActionHandlers = {
  onViewCode: (record: AdminApplicationRecord) => void;
  onVoidCode: (record: AdminApplicationRecord) => void;
};

type DonationActionHandlers = {
  onViewDonation: (donation: DonationListRow) => void;
  onEditDonation: (donation: DonationListRow) => void;
  onReceiveDonation: (donation: DonationListRow) => void;
  onDeleteDonation: (donation: DonationListRow) => void;
};

const renderSectionActionCell = <Row,>(
  rowKey: string,
  row: Row,
  actionSets: RowActionSet<Row>[],
) => (
  <AdminTableActionButtons
    rowKey={rowKey}
    actions={buildRowActions(row, actionSets)}
  />
);

// Action sets are ordered from most specific to most general because only the
// first matching branch is rendered for each row.
const createCodeActionSets = (
  handlers: CodeActionHandlers,
): RowActionSet<AdminApplicationRecord>[] => [
  {
    when: canVoidApplication,
    actions: [
      {
        label: "Anular",
        tone: "danger",
        className: "void-code-btn",
        onClick: handlers.onVoidCode,
      },
    ],
  },
  {
    actions: [
      {
        label: "Visualizar",
        tone: "secondary",
        className: "view-code-btn",
        onClick: handlers.onViewCode,
      },
    ],
  },
];

const createDonationActionSets = (
  handlers: DonationActionHandlers,
): RowActionSet<DonationListRow>[] => [
  {
    when: isPendingGoodsDonation,
    actions: [
      {
        label: "Receber",
        className: "receive-donation-btn",
        onClick: handlers.onReceiveDonation,
      },
      {
        label: "Excluir",
        tone: "danger",
        className: "delete-donation-btn",
        onClick: handlers.onDeleteDonation,
      },
    ],
  },
  {
    when: canEditDonation,
    actions: [
      {
        label: "Visualizar",
        tone: "secondary",
        className: "view-donation-btn",
        onClick: handlers.onViewDonation,
      },
      {
        label: "Editar",
        tone: "secondary",
        className: "edit-donation-btn",
        onClick: handlers.onEditDonation,
      },
    ],
  },
  {
    actions: [
      {
        label: "Visualizar",
        tone: "secondary",
        className: "view-donation-btn",
        onClick: handlers.onViewDonation,
      },
      {
        label: "Excluir",
        tone: "danger",
        className: "delete-donation-btn",
        onClick: handlers.onDeleteDonation,
      },
    ],
  },
];

const createCodeColumns = (
  handlers: CodeActionHandlers,
): TableColumn<AdminApplicationRecord>[] => {
  const actionSets = createCodeActionSets(handlers);

  return [
    {
      header: "Código de Retirada",
      renderCell: (record) => record.redemption_code,
    },
    { header: "Cesta", renderCell: getApplicationPackageLabel },
    {
      header: "Gerado em",
      renderCell: (record) => formatUkDate(record.created_at),
    },
    {
      header: "Status",
      renderCell: (record) =>
        renderStatusDetail(
          getApplicationStatusLabel(record),
          getApplicationStatusTone(record),
        ),
    },
    {
      header: "Retirado em",
      renderCell: (record) => formatUkDate(record.redeemed_at),
    },
    {
      header: "Ações",
      renderCell: (record) =>
        renderSectionActionCell(record.id, record, actionSets),
    },
  ];
};

const createDonationColumns = (
  handlers: DonationActionHandlers,
): TableColumn<DonationListRow>[] => {
  const actionSets = createDonationActionSets(handlers);

  return [
    { header: "ID da Doação", renderCell: buildDonationDisplayId },
    { header: "Tipo de Doador", renderCell: getDonationDonorTypeLabel },
    {
      header: "Nome do Doador",
      renderCell: (donation) => donation.donor_name ?? "Anônimo",
    },
    { header: "Data", renderCell: getDonationDateLabel },
    { header: "Total de Itens", renderCell: buildDonationTotalLabel },
    { header: "Status", renderCell: getDonationStatusLabel },
    {
      header: "Ações",
      renderCell: (donation) =>
        renderSectionActionCell(donation.id, donation, actionSets),
    },
  ];
};

export interface AdminCodesSectionProps {
  search: string;
  applications: AdminApplicationRecord[];
  selectedCodeIds: ReadonlySet<string>;
  isLoadingApplications: boolean;
  applicationsError: string;
  onSearchChange: (value: string) => void;
  onOpenVerify: () => void;
  onToggleCodeSelection: (applicationId: string) => void;
  onToggleAllCodes: (applicationIds?: string[]) => void;
  onViewCode: (record: AdminApplicationRecord) => void;
  onVoidCode: (record: AdminApplicationRecord) => void;
  onBatchVoid: () => void;
  isBatchVoidBusy: boolean;
  heading?: string;
}

export interface AdminDonationsSectionProps {
  search: string;
  donorTypeFilter: DonationDonorType | "all";
  statusFilter: DonationStatusFilter;
  donations: DonationListRow[];
  selectedDonationIds: ReadonlySet<string>;
  isLoadingDonations: boolean;
  donationError: string;
  onSearchChange: (value: string) => void;
  onDonorTypeFilterChange: (value: DonationDonorType | "all") => void;
  onStatusFilterChange: (value: DonationStatusFilter) => void;
  onNewDonation: () => void;
  onToggleDonationSelection: (donationId: string) => void;
  onToggleAllDonations: (donationIds?: string[]) => void;
  onViewDonation: (donation: DonationListRow) => void;
  onEditDonation: (donation: DonationListRow) => void;
  onReceiveDonation: (donation: DonationListRow) => void;
  onDeleteDonation: (donation: DonationListRow) => void;
  onBatchDelete: () => void;
  onBatchReceive: () => void;
  isBatchDeleteBusy: boolean;
  isBatchReceiveBusy: boolean;
  heading?: string;
}

export function AdminCodesSection({
  search,
  applications,
  selectedCodeIds,
  isLoadingApplications,
  applicationsError,
  onSearchChange,
  onOpenVerify,
  onToggleCodeSelection,
  onToggleAllCodes,
  onViewCode,
  onVoidCode,
  onBatchVoid,
  isBatchVoidBusy,
  heading = "Validação de Código de Retirada",
}: AdminCodesSectionProps) {
  return (
    <AdminSelectableTableSectionShell
      title={heading}
      errorMessage={applicationsError}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Pesquisar registros de códigos de retirada..."
      toolbarAction={{
        id: "verify-code-btn",
        label: "Conferir Código de Retirada",
        onClick: onOpenVerify,
      }}
      selectAllId="select-all-codes"
      countId="code-selected-count"
      rows={applications}
      selectedRowIds={selectedCodeIds}
      getRowId={(record) => record.id}
      onToggleRow={onToggleCodeSelection}
      onToggleAll={onToggleAllCodes}
      batchButtons={[
        {
          id: "batch-void-codes",
          label: "Anular Selecionados",
          busyLabel: "Anulando...",
          tone: "danger",
          busy: isBatchVoidBusy,
          disabled:
            countSelectedRows(
              applications,
              selectedCodeIds,
              canVoidApplication,
            ) === 0 || isBatchVoidBusy,
          onClick: onBatchVoid,
        },
      ]}
      isLoading={isLoadingApplications}
      loadingMessage="Carregando códigos de retirada..."
      emptyMessage="Nenhum código de retirada encontrado."
      paginationId="code-pagination"
      tableId="code-table"
      bodyId="code-table-body"
      paginationKey={search}
      columns={createCodeColumns({ onViewCode, onVoidCode })}
      getRowMeta={(record) => ({ dataAttributes: { "data-id": record.id } })}
    />
  );
}

export function AdminDonationsSection({
  search,
  donorTypeFilter,
  statusFilter,
  donations,
  selectedDonationIds,
  isLoadingDonations,
  donationError,
  onSearchChange,
  onDonorTypeFilterChange,
  onStatusFilterChange,
  onNewDonation,
  onToggleDonationSelection,
  onToggleAllDonations,
  onViewDonation,
  onEditDonation,
  onReceiveDonation,
  onDeleteDonation,
  onBatchDelete,
  onBatchReceive,
  isBatchDeleteBusy,
  isBatchReceiveBusy,
  heading = "Entrada e Triagem de Doações",
}: AdminDonationsSectionProps) {
  return (
    <AdminSelectableTableSectionShell
      title={heading}
      errorMessage={donationError}
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Pesquisar registros de doações..."
      toolbarAction={{ label: "+ Nova Doação", onClick: onNewDonation }}
      filters={[
        {
          type: "select",
          value: donorTypeFilter,
          options: DONATION_FILTER_DONOR_TYPE_OPTIONS,
          placeholder: "Todos os Tipos de Doador",
          emptyValue: "all",
          onChange: (value) =>
            onDonorTypeFilterChange(value as DonationDonorType | "all"),
        },
        {
          type: "select",
          value: statusFilter,
          options: DONATION_STATUS_OPTIONS,
          placeholder: "Todos os Status",
          emptyValue: "all",
          onChange: (value) =>
            onStatusFilterChange(value as DonationStatusFilter),
        },
      ]}
      selectAllId="select-all-donations"
      countId="donation-selected-count"
      rows={donations}
      selectedRowIds={selectedDonationIds}
      getRowId={(donation) => donation.id}
      onToggleRow={onToggleDonationSelection}
      onToggleAll={onToggleAllDonations}
      batchButtons={[
        {
          id: "batch-delete-donations",
          label: "Excluir Selecionadas",
          busyLabel: "Excluindo...",
          tone: "secondary",
          busy: isBatchDeleteBusy,
          disabled: selectedDonationIds.size === 0 || isBatchDeleteBusy,
          onClick: onBatchDelete,
        },
        {
          id: "batch-receive-donations",
          label: "Marcar como Recebida",
          busyLabel: "Processando...",
          busy: isBatchReceiveBusy,
          disabled:
            countSelectedRows(
              donations,
              selectedDonationIds,
              isPendingGoodsDonation,
            ) === 0 || isBatchReceiveBusy,
          onClick: onBatchReceive,
        },
      ]}
      isLoading={isLoadingDonations}
      loadingMessage="Carregando registros de doações..."
      emptyMessage="Nenhum registro de doação encontrado."
      paginationId="donation-pagination"
      tableId="donation-table"
      bodyId="donation-table-body"
      paginationKey={`${search}|${donorTypeFilter}|${statusFilter}`}
      columns={createDonationColumns({
        onViewDonation,
        onEditDonation,
        onReceiveDonation,
        onDeleteDonation,
      })}
      getRowMeta={(donation) => ({
        dataAttributes: {
          "data-id": donation.id,
          "data-kind": donation.donation_type,
        },
      })}
    />
  );
}
