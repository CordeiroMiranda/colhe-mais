import type { InventoryItem } from "@/shared/types/inventory";
import adminStyles from "./admin.module.css";
import type {
  InventoryEditorDraft,
  InventoryStockInDraft,
  LotExpiryTarget,
  PackageEditorDraft,
  PackageEditorRowDraft,
  PackingStockCheckRow,
} from "./adminFoodManagement.types";
import { AdminButton } from "./chrome";
import {
  AdminInlineFeedback,
  AdminSubmitModalShell,
  bindDraftField,
  bindRowField,
  buildLabelOptions,
  buildNamedOptions,
  normalizeSelectNumber,
  InlineInput,
  InlineModalField,
  InlineModalFieldRow,
  InlineRepeaterField,
  InlineSelect,
} from "./modalBits.editors.containers";

function PackageContentsField({
  rows,
  inventoryItems,
  disabled,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: {
  rows: PackageEditorDraft["contents"];
  inventoryItems: InventoryItem[];
  disabled: boolean;
  onRowChange: (
    key: string,
    field: keyof Omit<PackageEditorRowDraft, "key">,
    value: string,
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (key: string) => void;
}) {
  // Package contents stay in string form inside the draft until submit so the
  // repeater can treat selects and number inputs as one controlled shape.
  const inventoryOptions = buildNamedOptions(inventoryItems);

  return (
    <InlineRepeaterField
      label="Alimentos da Cesta"
      rows={rows}
      rowVariant="package"
      addLabel="+ Adicionar Linha"
      addButtonId="add-package-item-btn"
      disabled={disabled}
      onAddRow={onAddRow}
      renderRow={(row) => (
        <>
          <InlineSelect
            value={row.itemId}
            onChange={(event) =>
              bindRowField(onRowChange, row.key, "itemId")(event.target.value)
            }
            disabled={disabled}
          >
            <option value="">Selecione o alimento</option>
            {inventoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </InlineSelect>
          <InlineInput
            type="number"
            min={1}
            step={1}
            value={row.quantity}
            onChange={(event) =>
              bindRowField(onRowChange, row.key, "quantity")(event.target.value)
            }
            disabled={disabled}
          />
          <AdminButton
            tone="secondary"
            size="sm"
            className="remove-package-item-btn"
            onClick={() => onRemoveRow(row.key)}
            disabled={disabled || rows.length === 1}
          >
            {" "}
            Remover
          </AdminButton>
        </>
      )}
    />
  );
}

// The packing preview shows per-pack requirements so admins can still change
// the final quantity without the explanation text going stale on every keystroke.
const renderPackingStockCheck = (
  loadingStockCheck: boolean,
  stockCheckRows: PackingStockCheckRow[],
) =>
  loadingStockCheck ? (
    <p className={adminStyles["admin-inline-message-line"]}>
      {" "}
      Carregando itens necessários da cesta...
    </p>
  ) : stockCheckRows.length === 0 ? (
    <p className={adminStyles["admin-inline-message-line"]}>
      {" "}
      Selecione uma cesta para verificar os itens em estoque.
    </p>
  ) : (
    <>
      {stockCheckRows.map((row) => (
        <p key={row.itemId} className={adminStyles["admin-inline-message-line"]}>
          {row.name}: {row.availableQuantity} {row.unit} disponíveis / {row.requiredQuantity} necessários por cesta
        </p>
      ))}
    </>
  );

export function InventoryItemEditorModal({
  id,
  isOpen,
  isEditing,
  draft,
  error,
  submitting,
  categoryOptions,
  onClose,
  onFieldChange,
  onSubmit,
}: {
  id: string;
  isOpen: boolean;
  isEditing: boolean;
  draft: InventoryEditorDraft;
  error: string;
  submitting: boolean;
  categoryOptions: string[];
  onClose: () => void;
  onFieldChange: (field: keyof InventoryEditorDraft, value: string) => void;
  onSubmit: () => Promise<void>;
}) {
  const selectOptions = buildLabelOptions(categoryOptions);

  return (
    <AdminSubmitModalShell
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Alimento" : "Adicionar Novo Alimento"}
      error={error}
      submitting={submitting}
      onSubmit={onSubmit}
      submitLabel={isEditing ? "Salvar Alimento" : "Adicionar Alimento"}
      submittingLabel="Salvando..."
    >
      <InlineModalField
        field={{
          key: "name",
          kind: "text",
          label: "Nome do Alimento",
          value: draft.name,
          onChange: bindDraftField(onFieldChange, "name"),
          placeholder: "Ex: Arroz, Feijão, Macarrão",
          disabled: submitting,
        }}
      />
      <InlineModalFieldRow
        fields={[
          {
            key: "category",
            kind: "select",
            label: "Categoria",
            value: draft.category,
            onChange: bindDraftField(onFieldChange, "category"),
            options: selectOptions,
            placeholder: "Selecione a categoria",
            disabled: submitting,
          },
          {
            key: "unit",
            kind: "text",
            label: "Unidade de Medida",
            value: draft.unit,
            onChange: bindDraftField(onFieldChange, "unit"),
            placeholder: "Ex: kg, un., pct., lata",
            disabled: submitting,
          },
        ]}
      />
      <InlineModalField
        field={{
          key: "threshold",
          kind: "number",
          label: "Estoque Mínimo de Segurança",
          value: draft.threshold,
          onChange: bindDraftField(onFieldChange, "threshold"),
          placeholder: "0",
          min: 0,
          step: 1,
          disabled: submitting,
        }}
      />
    </AdminSubmitModalShell>
  );
}

export function InventoryStockInModal({
  isOpen,
  itemName,
  draft,
  error,
  submitting,
  onClose,
  onFieldChange,
  onSubmit,
}: {
  isOpen: boolean;
  itemName: string;
  draft: InventoryStockInDraft;
  error: string;
  submitting: boolean;
  onClose: () => void;
  onFieldChange: (field: keyof InventoryStockInDraft, value: string) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <AdminSubmitModalShell
      id="stock-in-editor"
      isOpen={isOpen}
      onClose={onClose}
      title="Entrada de Alimento no Estoque"
      error={error}
      submitting={submitting}
      onSubmit={onSubmit}
      submitLabel="Confirmar Entrada"
      submittingLabel="Registrando..."
    >
      <InlineModalField
        field={{
          key: "itemName",
          kind: "readonly",
          label: "Nome do Alimento",
          value: itemName,
        }}
      />
      <InlineModalFieldRow
        fields={[
          {
            key: "quantity",
            kind: "number",
            label: "Quantidade",
            value: draft.quantity,
            onChange: bindDraftField(onFieldChange, "quantity"),
            min: 1,
            step: 1,
            disabled: submitting,
          },
          {
            key: "expiryDate",
            kind: "date",
            label: "Data de Validade",
            value: draft.expiryDate,
            onChange: bindDraftField(onFieldChange, "expiryDate"),
            placeholder: "DD/MM/AAAA",
            inputMode: "numeric",
            disabled: submitting,
          },
        ]}
      />
    </AdminSubmitModalShell>
  );
}

export function LotExpiryModal({
  isOpen,
  target,
  expiryValue,
  error,
  submitting,
  onClose,
  onExpiryChange,
  onSubmit,
}: {
  isOpen: boolean;
  target: LotExpiryTarget | null;
  expiryValue: string;
  error: string;
  submitting: boolean;
  onClose: () => void;
  onExpiryChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}) {
  if (!isOpen || !target) {
    return null;
  }

  return (
    <AdminSubmitModalShell
      id="edit-lot-editor"
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Validade do Lote"
      error={error}
      submitting={submitting}
      onSubmit={onSubmit}
      submitLabel="Salvar Validade"
      submittingLabel="Salvando..."
    >
      <InlineModalField
        field={{
          key: "itemName",
          kind: "readonly",
          label: "Nome do Alimento",
          value: target.itemName,
        }}
      />
      <InlineModalFieldRow
        fields={[
          {
            key: "lotNumber",
            kind: "readonly",
            label: "Número do Lote",
            value: target.lotNumber,
          },
          {
            key: "quantity",
            kind: "readonly",
            label: "Estoque Restante",
            value: String(target.quantity),
          },
        ]}
      />
      <InlineModalField
        field={{
          key: "expiryDate",
          kind: "date",
          label: "Data de Validade",
          value: expiryValue,
          onChange: onExpiryChange,
          inputMode: "numeric",
          disabled: submitting,
        }}
      />
    </AdminSubmitModalShell>
  );
}

export function PackageEditorModal({
  id,
  isOpen,
  isEditing,
  draft,
  inventoryItems,
  error,
  submitting,
  categoryOptions,
  onClose,
  onFieldChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
  onSubmit,
}: {
  id: string;
  isOpen: boolean;
  isEditing: boolean;
  draft: PackageEditorDraft;
  inventoryItems: InventoryItem[];
  error: string;
  submitting: boolean;
  categoryOptions: string[];
  onClose: () => void;
  onFieldChange: (
    field: keyof Omit<PackageEditorDraft, "contents">,
    value: string,
  ) => void;
  onRowChange: (
    key: string,
    field: keyof Omit<PackageEditorRowDraft, "key">,
    value: string,
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (key: string) => void;
  onSubmit: () => Promise<void>;
}) {
  const categorySelectOptions = buildLabelOptions(categoryOptions);

  return (
    <AdminSubmitModalShell
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Cesta" : "Criar Nova Cesta"}
      error={error}
      submitting={submitting}
      onSubmit={onSubmit}
      submitLabel={isEditing ? "Salvar Cesta" : "Criar Cesta"}
      submittingLabel="Salvando..."
    >
      <InlineModalField
        field={{
          key: "name",
          kind: "text",
          label: "Nome da Cesta",
          value: draft.name,
          onChange: bindDraftField(onFieldChange, "name"),
          placeholder: "Ex: Cesta Básica Familiar, Cesta Emergencial",
          disabled: submitting,
        }}
      />
      <InlineModalFieldRow
        fields={[
          {
            key: "category",
            kind: "select",
            label: "Categoria",
            value: draft.category,
            onChange: bindDraftField(onFieldChange, "category"),
            options: categorySelectOptions,
            placeholder: "Selecione a categoria",
            disabled: submitting,
          },
          {
            key: "threshold",
            kind: "number",
            label: "Estoque Mínimo",
            value: draft.threshold,
            onChange: bindDraftField(onFieldChange, "threshold"),
            min: 0,
            step: 1,
            disabled: submitting,
          },
        ]}
        compact
      />
      <PackageContentsField
        rows={draft.contents}
        inventoryItems={inventoryItems}
        disabled={submitting}
        onRowChange={onRowChange}
        onAddRow={onAddRow}
        onRemoveRow={onRemoveRow}
      />
    </AdminSubmitModalShell>
  );
}

export function PackingModal({
  isOpen,
  packages,
  selectedPackageId,
  quantity,
  stockCheckRows,
  feedback,
  loadingStockCheck,
  submitting,
  onClose,
  onPackageChange,
  onQuantityChange,
  onSubmit,
}: {
  isOpen: boolean;
  packages: Array<{ id: string | number; name: string }>;
  selectedPackageId: number | "";
  quantity: string;
  stockCheckRows: PackingStockCheckRow[];
  feedback: string;
  loadingStockCheck: boolean;
  submitting: boolean;
  onClose: () => void;
  onPackageChange: (value: number | "") => void;
  onQuantityChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}) {
  const packageOptions = buildNamedOptions(packages);

  return (
    <AdminSubmitModalShell
      id="packing-editor"
      isOpen={isOpen}
      onClose={onClose}
      title="Montagem de Cestas de Alimentos"
      submitting={submitting}
      onSubmit={onSubmit}
      submitLabel="Confirmar Montagem"
      submittingLabel="Montando..."
    >
      <InlineModalField
        field={{
          key: "packageId",
          kind: "select",
          label: "Selecionar Cesta",
          value: selectedPackageId,
          onChange: (value) => onPackageChange(normalizeSelectNumber(value)),
          options: packageOptions,
          placeholder: "Selecione uma cesta",
          disabled: submitting,
        }}
      />
      <AdminInlineFeedback tone="warning" title="Itens da Cesta e Conferência de Estoque">
        {renderPackingStockCheck(loadingStockCheck, stockCheckRows)}
      </AdminInlineFeedback>
      <InlineModalField
        field={{
          key: "quantity",
          kind: "number",
          label: "Quantidade de Cestas a Montar",
          value: quantity,
          onChange: onQuantityChange,
          min: 1,
          step: 1,
          disabled: submitting,
        }}
      />
      {feedback ? (
        <p className={adminStyles["admin-plain-feedback"]}>{feedback}</p>
      ) : null}
    </AdminSubmitModalShell>
  );
}
