import type { AdminApplicationRecord } from "@/shared/lib/api/applications";
import adminStyles from "./admin.module.css";
import type { CodeVerifyResult } from "./adminFoodManagement.types";
import { formatUkDate } from "./formatting";
import {
  AdminInlineFeedback,
  AdminModalShell,
  EditorActions,
  InlineModalField,
  InlineModalFieldRow,
  type ModalFieldConfig,
} from "./modalBits.editors.containers";
import {
  canRedeemApplication,
  getApplicationPackageLabel,
  getApplicationStatusLabel,
} from "./rules";

function CodeDetailsSection({ record }: { record: AdminApplicationRecord }) {
  const rows: ModalFieldConfig[][] = [
    [
      {
        key: "code",
        kind: "readonly",
        label: "Código de Retirada",
        value: record.redemption_code,
      },
      {
        key: "status",
        kind: "readonly",
        label: "Status",
        value: getApplicationStatusLabel(record),
      },
    ],
    [
      {
        key: "package",
        kind: "readonly",
        label: "Cesta",
        value: getApplicationPackageLabel(record),
      },
      {
        key: "redeemedAt",
        kind: "readonly",
        label: "Retirado em",
        value: formatUkDate(record.redeemed_at),
      },
    ],
  ];

  return (
    <>
      {rows.map((fields, rowIndex) => (
        <InlineModalFieldRow key={`code-details-${rowIndex}`} fields={fields} />
      ))}
    </>
  );
}

function CodeVerifyResultPanel({
  result,
}: {
  result: CodeVerifyResult | null;
}) {
  if (!result) {
    return null;
  }

  // Non-valid code states still need to stand out to the operator, so map
  // informational result tones onto the warning banner styling here.
  return (
    <AdminInlineFeedback
      tone={result.tone === "info" ? "warning" : result.tone}
      title={result.title}
    >
      {result.message
        .split("\n")
        .filter(Boolean)
        .map((line) => (
          <p key={line} className={adminStyles["admin-inline-message-line"]}>
            {line}
          </p>
        ))}
    </AdminInlineFeedback>
  );
}

export function CodeDetailsModal({
  record,
  isOpen,
  onClose,
}: {
  record: AdminApplicationRecord | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !record) {
    return null;
  }

  return (
    <AdminModalShell
      id="view-code-editor"
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Código de Retirada"
    >
      <CodeDetailsSection record={record} />
      <EditorActions
        actions={[{ label: "Fechar", tone: "secondary", onClick: onClose }]}
      />
    </AdminModalShell>
  );
}

export function CodeVerifyModal({
  isOpen,
  code,
  result,
  checking,
  redeeming,
  onClose,
  onCodeChange,
  onCheck,
  onRedeem,
}: {
  isOpen: boolean;
  code: string;
  result: CodeVerifyResult | null;
  checking: boolean;
  redeeming: boolean;
  onClose: () => void;
  onCodeChange: (value: string) => void;
  onCheck: () => Promise<void>;
  onRedeem: () => Promise<void>;
}) {
  const isBusy = checking || redeeming;

  return (
    <AdminModalShell
      id="verify-code-editor"
      isOpen={isOpen}
      onClose={onClose}
      disableClose={isBusy}
      title="Conferir Código de Retirada"
    >
      <InlineModalField
        field={{
          key: "code",
          kind: "text",
          label: "Código de Retirada",
          value: code,
          onChange: onCodeChange,
          placeholder: "Digite o código (ex: ABCD-1234)",
          disabled: isBusy,
        }}
      />
      <CodeVerifyResultPanel result={result} />
      <EditorActions
        actions={[
          {
            label: "Cancelar",
            tone: "secondary",
            onClick: onClose,
            disabled: isBusy,
          },
          {
            label: checking ? "Consultando..." : "Consultar Código",
            tone: "secondary",
            onClick: () => void onCheck(),
            disabled: isBusy,
          },
          {
            label: redeeming ? "Confirmando..." : "Confirmar Retirada",
            onClick: () => void onRedeem(),
            disabled:
              isBusy || !result?.record || !canRedeemApplication(result.record),
          },
        ]}
      />
    </AdminModalShell>
  );
}
