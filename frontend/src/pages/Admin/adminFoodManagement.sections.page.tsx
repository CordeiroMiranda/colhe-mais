import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { AdminFoodManagementConfirmModals } from "./ConfirmModals";
import {
  CodeDetailsModal,
  CodeVerifyModal,
} from "./adminFoodManagement.modals.codes";
import {
  DonationDetailsModal,
  DonationEditorModal,
} from "./adminFoodManagement.modals.donations";
import {
  InventoryItemEditorModal,
  InventoryStockInModal,
  LotExpiryModal,
  PackageEditorModal,
  PackingModal,
} from "./adminFoodManagement.modals.inventory";
import {
  AdminCodesSection,
  AdminDonationsSection,
} from "./adminFoodManagement.sections.donations";
import {
  AdminItemsSection,
  AdminLotsSection,
  AdminPackagesSection,
} from "./adminFoodManagement.sections.inventory";
import type {
  AdminFoodManagementSectionsModel,
  AdminFoodManagementSectionsProps,
} from "./adminFoodManagement.sections.shared";
import {
  AdminSectionFeedback,
  AdminSummaryCard,
} from "./sectionBits.sections.cards";
import adminStyles from "./admin.module.css";

const impactLoadingCardCount = 4;

function ManagementSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={adminStyles.section} id={id}>
      <div className={adminStyles.container}>
        <h2
          className={cn(
            adminStyles["section-title"],
            !description && adminStyles["section-title--without-subtitle"],
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className={adminStyles["section-subtitle"]}>{description}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

function SharedPublicImpactSection({
  impactMetrics,
  publicImpactStatus,
  isLocalFoodBankView,
  foodBankName,
}: AdminFoodManagementSectionsProps["sharedPublicImpact"]) {
  const localScopeLabel = foodBankName || "seu ponto de coleta";
  const hasImpactMetrics = impactMetrics.length > 0;
  const publicImpactMessageTone =
    publicImpactStatus === "error"
      ? "warning"
      : publicImpactStatus === "ready"
        ? "success"
        : "default";
  const publicImpactMessageTitle =
    publicImpactStatus === "loading"
      ? hasImpactMetrics
        ? isLocalFoodBankView
          ? "Atualizando dados do ponto de coleta"
          : "Atualizando totais públicos"
        : isLocalFoodBankView
          ? "Carregando dados do ponto de coleta"
          : "Carregando totais públicos"
      : publicImpactStatus === "error"
        ? hasImpactMetrics
          ? isLocalFoodBankView
            ? "Exibindo os dados locais mais recentes"
            : "Exibindo os totais públicos mais recentes"
          : isLocalFoodBankView
            ? "Dados do ponto de coleta indisponíveis"
            : "Totais públicos indisponíveis"
        : isLocalFoodBankView
          ? "Dados do ponto de coleta sincronizados"
          : "Totais públicos sincronizados";

  const publicImpactMessageLine =
    publicImpactStatus === "loading"
      ? hasImpactMetrics
        ? isLocalFoodBankView
          ? `Os cartões incluem apenas movimentações de ${localScopeLabel} enquanto novos dados são carregados.`
          : "Os cartões exibem a mesma fonte pública da página inicial enquanto novos dados são carregados."
        : isLocalFoodBankView
          ? `Carregando atividades em tempo real de ${localScopeLabel}.`
          : "Carregando os mesmos dados em tempo real da página inicial."
      : publicImpactStatus === "error"
        ? hasImpactMetrics
          ? isLocalFoodBankView
            ? "A atualização mais recente não foi concluída; os últimos valores locais obtidos continuam visíveis."
            : "A atualização mais recente não foi concluída; os últimos valores obtidos continuam visíveis."
          : isLocalFoodBankView
            ? `Não foi possível carregar os dados mais recentes de ${localScopeLabel}.`
            : "Não foi possível carregar os totais públicos no momento."
        : isLocalFoodBankView
          ? `Novas doações e retiradas em ${localScopeLabel} atualizam estes cartões automaticamente.`
          : "Novas doações e retiradas atualizam estes cartões automaticamente.";

  return (
    <>
      <div
        className={cn(
          adminStyles["admin-inline-message"],
          adminStyles[`admin-inline-message--${publicImpactMessageTone}`],
        )}
      >
        <p className={adminStyles["admin-inline-message-title"]}>
          {publicImpactMessageTitle}
        </p>
        <div className={adminStyles["admin-inline-message-body"]}>
          <p className={adminStyles["admin-inline-message-line"]}>
            {publicImpactMessageLine}
          </p>
        </div>
      </div>
      <div
        className={cn(
          adminStyles["admin-card-grid"],
          adminStyles["admin-impact-card-grid"],
        )}
      >
        {publicImpactStatus === "loading" && !hasImpactMetrics
          ? Array.from({ length: impactLoadingCardCount }, (_, index) => (
              <div
                key={`impact-loading-${index}`}
                className={cn(
                  adminStyles.card,
                  adminStyles["admin-summary-card"],
                )}
                aria-hidden="true"
              >
                <div
                  className={cn(
                    adminStyles["admin-skeleton-bar"],
                    adminStyles["admin-skeleton-bar--label"],
                  )}
                />
                <div
                  className={cn(
                    adminStyles["admin-skeleton-bar"],
                    adminStyles["admin-skeleton-bar--note"],
                  )}
                />
                <div
                  className={cn(
                    adminStyles["admin-skeleton-bar"],
                    adminStyles["admin-skeleton-bar--value"],
                  )}
                />
                <div
                  className={cn(
                    adminStyles["admin-skeleton-bar"],
                    adminStyles["admin-skeleton-bar--trend"],
                  )}
                />
              </div>
            ))
          : hasImpactMetrics
            ? impactMetrics.map((metric) => (
                <AdminSummaryCard
                  key={metric.label}
                  title={metric.label}
                  description={metric.note}
                >
                  <div className={adminStyles["kpi-value"]}>{metric.value}</div>
                  <div
                    className={cn(
                      adminStyles["kpi-trend"],
                      metric.positive === false
                        ? adminStyles["trend-down"]
                        : adminStyles["trend-up"],
                    )}
                  >
                    {metric.change}
                  </div>
                </AdminSummaryCard>
              ))
            : (
              <div
                className={cn(
                  adminStyles.card,
                  adminStyles["admin-summary-card"],
                  adminStyles["admin-impact-status-card"],
                )}
              >
                <div className={adminStyles["admin-summary-card-title"]}>
                  Totais em tempo real indisponíveis
                </div>
                <p className={adminStyles["admin-summary-card-description"]}>
                  Não foi possível carregar os dados públicos mais recentes.
                </p>
              </div>
            )}
      </div>
    </>
  );
}

function DonationSectionFeedback({
  loadError = "",
  pageFeedback,
  onClosePageFeedback,
}: Pick<
  AdminFoodManagementSectionsProps,
  "loadError" | "pageFeedback" | "onClosePageFeedback"
>) {
  return (
    <>
      {loadError ? (
        <AdminSectionFeedback tone="error" message={loadError} />
      ) : null}
      {pageFeedback && pageFeedback.tone !== "success" ? (
        <AdminSectionFeedback
          tone={pageFeedback.tone}
          message={pageFeedback.message}
          onClose={onClosePageFeedback}
        />
      ) : null}
    </>
  );
}

export function AdminFoodManagementPageSections({
  sharedPublicImpact,
  loadError = "",
  pageFeedback,
  onClosePageFeedback,
  donations,
  items,
  packages,
  lots,
  codes,
}: AdminFoodManagementSectionsProps) {
  const sharedPublicImpactDescription = sharedPublicImpact.isLocalFoodBankView
    ? `Estes indicadores mostram exclusivamente os totais de ${sharedPublicImpact.foodBankName || "seu ponto de coleta"}.`
    : "Estes são os mesmos indicadores de impacto exibidos na página inicial do Colhe+.";
  const sections: Array<{
    id: string;
    title: string;
    description?: string;
    content: ReactNode;
  }> = [
    {
      id: "shared-public-impact",
      title: "Painel de Impacto",
      description: sharedPublicImpactDescription,
      content: <SharedPublicImpactSection {...sharedPublicImpact} />,
    },
    {
      id: "donation-intake",
      title: "Entrada e Triagem de Doações",
      content: (
        <>
          <DonationSectionFeedback
            loadError={loadError}
            pageFeedback={pageFeedback}
            onClosePageFeedback={onClosePageFeedback}
          />
          <AdminDonationsSection {...donations} />
        </>
      ),
    },
    {
      id: "inventory-items",
      title: "Gestão de Estoque de Alimentos",
      content: <AdminItemsSection {...items} />,
    },
    {
      id: "package-management",
      title: "Montagem e Gestão de Cestas",
      content: <AdminPackagesSection {...packages} />,
    },
    {
      id: "expiry-tracking",
      title: "Controle de Lotes e Validades",
      content: <AdminLotsSection {...lots} />,
    },
    {
      id: "code-verification",
      title: "Validação de Código de Retirada",
      content: <AdminCodesSection {...codes} />,
    },
  ];

  return (
    <>
      {sections.map(({ id, title, description, content }) => (
        <ManagementSection
          key={id}
          id={id}
          title={title}
          description={description}
        >
          {content}
        </ManagementSection>
      ))}
    </>
  );
}

export function AdminFoodManagementPageChrome({
  editorModalProps,
  confirmModalProps,
  detailModalProps,
  chrome,
}: Pick<
  AdminFoodManagementSectionsModel,
  "editorModalProps" | "confirmModalProps" | "detailModalProps" | "chrome"
>) {
  return (
    <>
      <div
        className={cn(
          adminStyles["modal-overlay"],
          chrome.overlay.isVisible && adminStyles.visible,
        )}
        id="global-modal-overlay"
        onClick={chrome.overlay.onClose}
      />
      <InventoryItemEditorModal {...editorModalProps.inventoryItemEditor} />
      <InventoryStockInModal {...editorModalProps.inventoryStockIn} />
      <PackageEditorModal {...editorModalProps.packageEditor} />
      <PackingModal {...editorModalProps.packing} />
      <LotExpiryModal {...editorModalProps.lotExpiry} />
      <DonationEditorModal {...editorModalProps.donationEditor} />
      <AdminFoodManagementConfirmModals {...confirmModalProps} />
      <DonationDetailsModal {...detailModalProps.donationDetails} />
      <CodeVerifyModal {...detailModalProps.codeVerify} />
      <CodeDetailsModal {...detailModalProps.codeDetails} />
      <div
        className={cn(
          adminStyles["action-toast"],
          chrome.toast.isVisible && adminStyles.show,
        )}
        id="action-toast"
      >
        {chrome.toast.message}
      </div>
    </>
  );
}
