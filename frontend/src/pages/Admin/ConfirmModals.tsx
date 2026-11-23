import type { ComponentProps } from "react";
import { AdminConfirmModalShell } from "./modalBits.editors.containers";
import type {
  CodeVoidTarget,
  DeleteItemTarget,
  DonationDeleteTarget,
  LotDeleteTarget,
  LotStatusTarget,
  PackageDeleteTarget,
} from "./adminFoodManagement.types";
type ConfirmModalConfig = ComponentProps<typeof AdminConfirmModalShell>;
export type AdminFoodManagementConfirmModalsProps = {
  lotStatusTarget: LotStatusTarget | null;
  onCloseLotStatus: () => void;
  onConfirmLotStatus: () => void;
  isLotStatusSubmitting: boolean;
  lotDeleteTarget: LotDeleteTarget | null;
  onCloseLotDelete: () => void;
  onConfirmLotDelete: () => void;
  isLotDeleteSubmitting: boolean;
  deleteItemTarget: DeleteItemTarget | null;
  onCloseDeleteItem: () => void;
  onConfirmDeleteItem: () => void;
  isDeleteItemSubmitting: boolean;
  deletePackageTarget: PackageDeleteTarget | null;
  onCloseDeletePackage: () => void;
  onConfirmDeletePackage: () => void;
  isDeletePackageSubmitting: boolean;
  deleteDonationTarget: DonationDeleteTarget | null;
  onCloseDeleteDonation: () => void;
  onConfirmDeleteDonation: () => void;
  isDeleteDonationSubmitting: boolean;
  voidCodeTarget: CodeVoidTarget | null;
  onCloseVoidCode: () => void;
  onConfirmVoidCode: () => void;
  isVoidCodeSubmitting: boolean;
};
function buildConfirmModalConfigs({
  lotStatusTarget,
  onCloseLotStatus,
  onConfirmLotStatus,
  isLotStatusSubmitting,
  lotDeleteTarget,
  onCloseLotDelete,
  onConfirmLotDelete,
  isLotDeleteSubmitting,
  deleteItemTarget,
  onCloseDeleteItem,
  onConfirmDeleteItem,
  isDeleteItemSubmitting,
  deletePackageTarget,
  onCloseDeletePackage,
  onConfirmDeletePackage,
  isDeletePackageSubmitting,
  deleteDonationTarget,
  onCloseDeleteDonation,
  onConfirmDeleteDonation,
  isDeleteDonationSubmitting,
  voidCodeTarget,
  onCloseVoidCode,
  onConfirmVoidCode,
  isVoidCodeSubmitting,
}: AdminFoodManagementConfirmModalsProps): ConfirmModalConfig[] {
  // Keep destructive-dialog copy declarative so page chrome can render every
  // confirm modal in one place without scattering the wording.
  return [
    {
      id: "mark-wasted-confirm",
      isOpen: lotStatusTarget !== null,
      onClose: onCloseLotStatus,
      title:
        lotStatusTarget?.currentStatus === "active"
          ? "Registrar Descarte de Lote"
          : "Reativar Lote",
      description: !lotStatusTarget
        ? ""
        : lotStatusTarget.currentStatus === "active"
          ? `Marcar o lote ${lotStatusTarget.lotNumber} como descartado? O estoque restante será deduzido e a ação não poderá ser desfeita.`
          : `Reativar o lote ${lotStatusTarget.lotNumber}?`,
      confirmLabel:
        lotStatusTarget?.currentStatus === "active"
          ? "Confirmar Descarte"
          : "Reativar",
      submitting: isLotStatusSubmitting,
      confirmTone:
        lotStatusTarget?.currentStatus === "active" ? "danger" : "primary",
      onConfirm: onConfirmLotStatus,
    },
    {
      id: "delete-lot-confirm",
      isOpen: lotDeleteTarget !== null,
      onClose: onCloseLotDelete,
      title: "Excluir Lote Vencido",
      description: lotDeleteTarget
        ? `Excluir o lote vencido ${lotDeleteTarget.lotNumber}? Esta ação não poderá ser desfeita.`
        : "",
      confirmLabel: "Excluir Lote",
      submitting: isLotDeleteSubmitting,
      confirmTone: "danger",
      onConfirm: onConfirmLotDelete,
    },
    {
      id: "delete-item-confirm",
      isOpen: deleteItemTarget !== null,
      onClose: onCloseDeleteItem,
      title: "Excluir Alimento do Estoque",
      description: deleteItemTarget
        ? `Excluir o alimento ${deleteItemTarget.itemName}? Esta ação não poderá ser desfeita.`
        : "",
      confirmLabel: "Excluir Alimento",
      submitting: isDeleteItemSubmitting,
      confirmTone: "danger",
      onConfirm: onConfirmDeleteItem,
    },
    {
      id: "delete-package-confirm",
      isOpen: deletePackageTarget !== null,
      onClose: onCloseDeletePackage,
      title: "Remover Cesta de Alimentos",
      description: deletePackageTarget
        ? `Remover a cesta ${deletePackageTarget.name} das ativas? O histórico de retiradas será preservado e a cesta será arquivada.`
        : "",
      confirmLabel: "Remover Cesta",
      submitting: isDeletePackageSubmitting,
      confirmTone: "danger",
      onConfirm: onConfirmDeletePackage,
    },
    {
      id: "delete-donation-confirm",
      isOpen: deleteDonationTarget !== null,
      onClose: onCloseDeleteDonation,
      title: "Excluir Registro de Doação",
      description: deleteDonationTarget
        ? `Excluir o registro de doação ${deleteDonationTarget.displayId}? Esta ação não poderá ser desfeita.`
        : "",
      confirmLabel: "Excluir Registro",
      submitting: isDeleteDonationSubmitting,
      confirmTone: "danger",
      onConfirm: onConfirmDeleteDonation,
    },
    {
      id: "void-code-confirm",
      isOpen: voidCodeTarget !== null,
      onClose: onCloseVoidCode,
      title: "Anular Código de Retirada",
      description: voidCodeTarget
        ? `Anular o código ${voidCodeTarget.record.redemption_code}? O código deixará de ser válido para retirada e a ação não poderá ser desfeita.`
        : "",
      confirmLabel: "Anular Código",
      submitting: isVoidCodeSubmitting,
      confirmTone: "danger",
      onConfirm: onConfirmVoidCode,
    },
  ];
}
export function AdminFoodManagementConfirmModals({
  ...props
}: AdminFoodManagementConfirmModalsProps) {
  const confirmModals = buildConfirmModalConfigs(props);
  return (
    <>
      {confirmModals.map((modal) => (
        <AdminConfirmModalShell key={modal.id} {...modal} />
      ))}
    </>
  );
}
