import type { DonationListRow } from "@/shared/types/donations";
import adminStyles from "./admin.module.css";
import type {
  DonationEditorDraft,
  DonationEditorItemDraft,
} from "./adminFoodManagement.types";
import { AdminButton } from "./chrome";
import { buildDonationDisplayId } from "./formatting";
import {
  buildDonationDetailsRows,
  getDonationDonorTypeLabel,
  getDonationStatusLabel,
} from "./rules";
import {
  AdminDetailsTable,
  AdminModalShell,
  AdminSubmitModalShell,
  bindDraftField,
  bindRowField,
  buildLabelOptions,
  EditorActions,
  InlineInput,
  InlineModalFieldRow,
  InlineRepeaterField,
  InlineSelect,
  type ModalFieldConfig,
  type SelectFieldOption,
} from "./modalBits.editors.containers";

const DONOR_TYPE_OPTIONS: SelectFieldOption[] = [
  { value: "supermarket", label: "Comércio / Supermercado" },
  { value: "individual", label: "Pessoa Física" },
  { value: "organization", label: "Organização / Empresa" },
];

const buildDonationSummaryRows = (
  donation: DonationListRow,
): ModalFieldConfig[][] => [
  [
    {
      key: "donationId",
      kind: "readonly",
      label: "ID da Doação",
      value: buildDonationDisplayId(donation),
    },
    {
      key: "status",
      kind: "readonly",
      label: "Status",
      value: getDonationStatusLabel(donation),
    },
  ],
  [
    {
      key: "donorType",
      kind: "readonly",
      label: "Tipo de Doador",
      value: getDonationDonorTypeLabel(donation),
    },
    {
      key: "donorName",
      kind: "readonly",
      label: "Nome do Doador",
      value: donation.donor_name ?? "Anônimo",
    },
  ],
];

function DonationDetailsSummary({ donation }: { donation: DonationListRow }) {
  return (
    <>
      {buildDonationSummaryRows(donation).map((fields, rowIndex) => (
        <InlineModalFieldRow
          key={`donation-details-${rowIndex}`}
          fields={fields}
        />
      ))}
    </>
  );
}

function DonationDetailsItems({ donation }: { donation: DonationListRow }) {
  const detailRows = buildDonationDetailsRows(donation);

  return (
    <div className={adminStyles["form-group"]}>
      <label className={adminStyles["form-label"]}>Alimentos da Doação</label>
      <AdminDetailsTable
        columns={[
          { header: "Nome do Alimento", renderCell: (row) => row.name },
          { header: "Quantidade", renderCell: (row) => row.quantityLabel },
          { header: "Data de Validade", renderCell: (row) => row.expiryLabel },
        ]}
        rows={detailRows}
        emptyMessage="Nenhum item registrado."
        rowKey={(row) => `${row.name}-${row.quantityLabel}`}
      />
    </div>
  );
}

function DonationEditorFields({
  draft,
  submitting,
  onFieldChange,
}: {
  draft: DonationEditorDraft;
  submitting: boolean;
  onFieldChange: (
    field: keyof Omit<DonationEditorDraft, "items">,
    value: string,
  ) => void;
}) {
  return (
    <>
      <InlineModalFieldRow
        fields={[
          {
            key: "donorType",
            kind: "select",
            label: "Tipo de Doador",
            required: true,
            value: draft.donorType,
            placeholder: "Selecione o tipo de doador",
            options: DONOR_TYPE_OPTIONS,
            onChange: bindDraftField(onFieldChange, "donorType"),
            disabled: submitting,
          },
          {
            key: "donorName",
            kind: "text",
            label: "Nome do Doador",
            required: true,
            value: draft.donorName,
            placeholder: "Nome completo do doador",
            onChange: bindDraftField(onFieldChange, "donorName"),
            disabled: submitting,
          },
        ]}
      />
      <InlineModalFieldRow
        fields={[
          {
            key: "donorEmail",
            kind: "email",
            label: "E-mail de Contato",
            required: true,
            value: draft.donorEmail,
            placeholder: "exemplo@email.com",
            onChange: bindDraftField(onFieldChange, "donorEmail"),
            disabled: submitting,
          },
          {
            key: "receivedDate",
            kind: "date",
            label: "Data de Recebimento",
            required: true,
            value: draft.receivedDate,
            placeholder: "DD/MM/AAAA",
            onChange: bindDraftField(onFieldChange, "receivedDate"),
            inputMode: "numeric",
            disabled: submitting,
          },
        ]}
      />
    </>
  );
}

function DonationItemRow({
  item,
  index,
  itemCount,
  itemOptions,
  disabled,
  onItemChange,
  onRemoveItem,
}: {
  item: DonationEditorItemDraft;
  index: number;
  itemCount: number;
  itemOptions: string[];
  disabled: boolean;
  onItemChange: (
    key: string,
    field: keyof Omit<DonationEditorItemDraft, "key">,
    value: string,
  ) => void;
  onRemoveItem: (key: string) => void;
}) {
  const options = buildLabelOptions(itemOptions);

  return (
    <>
      <InlineSelect
        value={item.itemName}
        onChange={(event) =>
          bindRowField(onItemChange, item.key, "itemName")(event.target.value)
        }
        disabled={disabled}
      >
        <option value="">Selecione o alimento</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </InlineSelect>
      <InlineInput
        aria-label={`Quantidade ${index + 1}`}
        type="number"
        min={1}
        step={1}
        value={item.quantity}
        onChange={(event) =>
          bindRowField(onItemChange, item.key, "quantity")(event.target.value)
        }
        disabled={disabled}
      />
      <InlineInput
        aria-label={`Data de Validade ${index + 1}`}
        type="text"
        value={item.expiryDate}
        onChange={(event) =>
          bindRowField(onItemChange, item.key, "expiryDate")(event.target.value)
        }
        placeholder="DD/MM/AAAA"
        inputMode="numeric"
        disabled={disabled}
      />
      <AdminButton
        tone="secondary"
        size="sm"
        className="remove-item-btn"
        onClick={() => onRemoveItem(item.key)}
        disabled={disabled || itemCount === 1}
      >
        {" "}
        Remover
      </AdminButton>
    </>
  );
}

function DonationItemsField({
  items,
  itemOptions,
  disabled,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: {
  items: DonationEditorDraft["items"];
  itemOptions: string[];
  disabled: boolean;
  onItemChange: (
    key: string,
    field: keyof Omit<DonationEditorItemDraft, "key">,
    value: string,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (key: string) => void;
}) {
  return (
    <InlineRepeaterField
      label="Alimentos da Doação"
      rows={items}
      rowVariant="donation"
      addLabel="+ Adicionar Linha"
      addButtonId="add-item-btn"
      disabled={disabled}
      onAddRow={onAddItem}
      renderRow={(item, index) => (
        <DonationItemRow
          item={item}
          index={index}
          itemCount={items.length}
          itemOptions={itemOptions}
          disabled={disabled}
          onItemChange={onItemChange}
          onRemoveItem={onRemoveItem}
        />
      )}
    />
  );
}

export function DonationDetailsModal({
  donation,
  isOpen,
  onClose,
}: {
  donation: DonationListRow | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !donation) {
    return null;
  }

  return (
    <AdminModalShell
      id="view-donation-editor"
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Doação"
    >
      <DonationDetailsSummary donation={donation} />
      <DonationDetailsItems donation={donation} />
      <EditorActions
        actions={[{ label: "Fechar", tone: "secondary", onClick: onClose }]}
      />
    </AdminModalShell>
  );
}

export function DonationEditorModal({
  isOpen,
  isEditing,
  draft,
  itemOptions,
  error,
  submitting,
  onClose,
  onFieldChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
}: {
  isOpen: boolean;
  isEditing: boolean;
  draft: DonationEditorDraft;
  itemOptions: string[];
  error: string;
  submitting: boolean;
  onClose: () => void;
  onFieldChange: (
    field: keyof Omit<DonationEditorDraft, "items">,
    value: string,
  ) => void;
  onItemChange: (
    key: string,
    field: keyof Omit<DonationEditorItemDraft, "key">,
    value: string,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (key: string) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <AdminSubmitModalShell
      id="new-donation-editor"
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Doação" : "Nova Doação"}
      error={error}
      submitting={submitting}
      onSubmit={onSubmit}
      submitLabel={isEditing ? "Salvar Doação" : "Cadastrar Doação"}
      submittingLabel="Salvando..."
    >
      <DonationEditorFields
        draft={draft}
        submitting={submitting}
        onFieldChange={onFieldChange}
      />
      <DonationItemsField
        items={draft.items}
        itemOptions={itemOptions}
        disabled={submitting}
        onItemChange={onItemChange}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
      />
    </AdminSubmitModalShell>
  );
}
