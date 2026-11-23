import { type FormEvent } from "react";
import { cn } from "@/shared/lib/cn";
import type { FoodBankOption } from "@/shared/lib/foodBankLookup";
import {
  getEnglishInputValidationProps,
  getEnglishSelectValidationProps,
  getEnglishTextAreaValidationProps,
} from "@/shared/lib/nativeValidation";
import {
  normalizePostcodeInput,
  sanitizeDateTextInput,
} from "@/shared/lib/validation";
import {
  Check,
  ChevronRight,
  MapPin,
  Search,
} from "@/shared/ui/InlineIcons";
import {
  FormPanel,
  InlineFeedback,
  PublicFormField,
  PublicSelect,
  PublicTextArea,
  PublicTextInput,
} from "@/shared/ui/FormPrimitives";
import {
  ActionButton,
  PublicPageSection,
  PublicSearchPanel,
  PublicSectionIntro,
} from "@/shared/ui/PublicPagePatterns";
import {
  type DonateGoodsPageModel,
  type DonationDetails,
  type FeedbackState,
  type FieldErrors,
} from "./donateGoods.pageModel";
import styles from "./DonateGoods.module.css";

const FLOW_PROGRESS_LABELS = [
  "Buscar Localização",
  "Selecionar Ponto de Coleta",
  "Detalhes da Doação",
];

const postcodeValidationProps = getEnglishInputValidationProps("CEP");
const donorNameValidationProps = getEnglishInputValidationProps("Nome Completo");
const donorEmailValidationProps =
  getEnglishInputValidationProps("E-mail");
const donorPhoneValidationProps =
  getEnglishInputValidationProps("Telefone");
const pickupDateValidationProps = getEnglishInputValidationProps(
  "Data Preferencial de Coleta ou Entrega",
);
const donationItemsValidationProps =
  getEnglishTextAreaValidationProps("Itens da Doação");
const itemConditionValidationProps =
  getEnglishSelectValidationProps("Condição dos Itens");
const estimatedQuantityValidationProps =
  getEnglishInputValidationProps("Quantidade Estimada");
const specialNotesValidationProps = getEnglishTextAreaValidationProps(
  "Instruções Especiais ou Observações",
);

function SearchLocationStep({
  postcode,
  postcodeError,
  searching,
  onSearch,
  onPostcodeChange,
}: {
  postcode: string;
  postcodeError: string;
  searching: boolean;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onPostcodeChange: (value: string) => void;
}) {
  return (
    <div className={styles.flowCard}>
      <PublicSearchPanel
        title={
          <>
            Encontre um <span className={styles.highlight}>Ponto de Coleta</span> Perto de Você
          </>
        }
        description="Informe seu CEP para buscar pontos de coleta em até 5 km"
        value={postcode}
        onChange={(value) => onPostcodeChange(normalizePostcodeInput(value))}
        onSubmit={onSearch}
        placeholder="Digite o CEP (ex: 12245-000)"
        submitLabel="Buscar"
        submittingLabel="Buscando..."
        isSubmitting={searching}
        icon={<Search className={styles.searchIcon} size={20} />}
        error={postcodeError}
        variant="embedded"
        align="center"
        introSize="section"
        introClassName={styles.searchPanelIntro}
        buttonClassName={styles.searchActionButton}
        inputProps={{ maxLength: 8, ...postcodeValidationProps }}
      />
    </div>
  );
}

function SelectFoodBankStep({
  searchFeedback,
  searchResults,
  onBack,
  onSelectBank,
}: {
  searchFeedback: string | null;
  searchResults: FoodBankOption[];
  onBack: () => void;
  onSelectBank: (bank: FoodBankOption) => void;
}) {
  return (
    <div className={styles.flowStepStack}>
      <ActionButton
        type="button"
        tone="ghost"
        size="sm"
        onClick={onBack}
        className={styles.ghostActionButton}
      >
        Alterar Localização
      </ActionButton>
      <div className={styles.flowCard}>
        <div className={styles.flowCardHeaderLeft}>
          <h3 className={styles.flowTitle}>
            Selecione um <span className={styles.highlight}>Ponto de Coleta</span>
          </h3>
        </div>
        {searchFeedback && searchResults.length > 0 ? (
          <p className={styles.flowTextLeft}>{searchFeedback}</p>
        ) : null}
        <div className={styles.bankList}>
          {searchResults.length === 0 ? (
            <p className={styles.flowTextLeft}>
              {searchFeedback ?? "Tente outro CEP para carregar pontos de coleta próximos."}
            </p>
          ) : (
            searchResults.map((bank) => (
              <button
                key={bank.id}
                type="button"
                className={styles.bankCard}
                onClick={() => onSelectBank(bank)}
              >
                <div className={styles.bankCardTop}>
                  <div>
                    <h4 className={styles.bankName}>{bank.name}</h4>
                    <div className={styles.bankAddress}>
                      <MapPin size={16} />
                      <span>{bank.address}</span>
                    </div>
                    <span className={styles.bankDistance}>{bank.distance} de distância</span>
                  </div>
                  <ChevronRight className={styles.bankArrow} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DonationDetailsStep({
  details,
  fieldErrors,
  selectedBank,
  submitFeedback,
  submitting,
  onBack,
  onNormalizePickupDateField,
  onSubmit,
  onUpdateDetails,
}: {
  details: DonationDetails;
  fieldErrors: FieldErrors;
  selectedBank: FoodBankOption;
  submitFeedback: FeedbackState | null;
  submitting: boolean;
  onBack: () => void;
  onNormalizePickupDateField: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateDetails: (field: keyof DonationDetails, value: string) => void;
}) {
  return (
    <div className={styles.flowStepStack}>
      <ActionButton
        type="button"
        tone="ghost"
        size="sm"
        onClick={onBack}
        className={styles.ghostActionButton}
      >
        Escolher Outro Ponto de Coleta
      </ActionButton>
      <div className={styles.selectedBankCard}>
        <div className={styles.selectedBankHeader}>
          <div className={styles.selectedBankBadge}>
            <Check size={22} />
          </div>
          <div>
            <p className={styles.selectedBankLabel}>Doando para:</p>
            <h3 className={styles.selectedBankName}>{selectedBank.name}</h3>
            <p className={styles.selectedBankAddress}>{selectedBank.address}</p>
            <p className={styles.flowTextLeft}>
              Seu pedido de doação será enviado a este ponto de coleta. A equipe
              entrará em contato para combinar a coleta ou entrega.
            </p>
          </div>
        </div>
      </div>
      <FormPanel onSubmit={onSubmit} className={styles.flowCard}>
        <div className={styles.flowCardHeaderCentered}>
          <h3 className={styles.flowTitle}>
            Detalhes da sua <span className={styles.highlight}>Doação</span>
          </h3>
          <p className={styles.flowTextLeft}>
            Por favor, informe os detalhes necessários para que a equipe do ponto de coleta possa dar andamento
          </p>
        </div>
        <div className={styles.formGrid}>
          <PublicFormField
            id="donor-name"
            label="Nome Completo"
            required
            error={fieldErrors.name}
          >
            <PublicTextInput
              id="donor-name"
              type="text"
              value={details.name}
              onChange={(event) => onUpdateDetails("name", event.target.value)}
              {...donorNameValidationProps}
            />
          </PublicFormField>
          <PublicFormField
            id="donor-email"
            label="E-mail"
            required
            error={fieldErrors.email}
          >
            <PublicTextInput
              id="donor-email"
              type="email"
              value={details.email}
              onChange={(event) => onUpdateDetails("email", event.target.value)}
              {...donorEmailValidationProps}
            />
          </PublicFormField>
          <PublicFormField
            id="donor-phone"
            label="Telefone"
            required
            error={fieldErrors.phone}
          >
            <PublicTextInput
              id="donor-phone"
              type="tel"
              value={details.phone}
              onChange={(event) => onUpdateDetails("phone", event.target.value)}
              {...donorPhoneValidationProps}
            />
          </PublicFormField>
          <PublicFormField
            id="pickup-date"
            label="Data Preferencial de Coleta ou Entrega"
            required
            error={fieldErrors.pickupDate}
          >
            <PublicTextInput
              id="pickup-date"
              type="text"
              value={details.pickupDate}
              onChange={(event) =>
                onUpdateDetails(
                  "pickupDate",
                  sanitizeDateTextInput(event.target.value),
                )
              }
              onBlur={onNormalizePickupDateField}
              inputMode="numeric"
              maxLength={10}
              placeholder="DD/MM/AAAA"
              {...pickupDateValidationProps}
            />
          </PublicFormField>
        </div>
        <PublicFormField
          id="donation-items"
          label="O que você está doando?"
          required
          error={fieldErrors.items}
        >
          <PublicTextArea
            id="donation-items"
            value={details.items}
            onChange={(event) => onUpdateDetails("items", event.target.value)}
            placeholder="Descreva os alimentos que deseja doar (ex: arroz, feijão, legumes, frutas, leite, macarrão, óleo, etc.)."
            {...donationItemsValidationProps}
          />
        </PublicFormField>
        <div className={styles.formGrid}>
          <PublicFormField
            id="item-condition"
            label="Condição dos Itens"
            required
            error={fieldErrors.condition}
          >
            <PublicSelect
              id="item-condition"
              value={details.condition}
              onChange={(event) =>
                onUpdateDetails("condition", event.target.value)
              }
              {...itemConditionValidationProps}
            >
              <option value="">Selecione a condição</option>
              <option value="New or unopened">Novo ou lacrado</option>
              <option value="Excellent">Excelente</option>
              <option value="Good">Bom</option>
            </PublicSelect>
          </PublicFormField>
          <PublicFormField id="estimated-quantity" label="Quantidade Estimada">
            <PublicTextInput
              id="estimated-quantity"
              type="text"
              value={details.quantity}
              onChange={(event) => onUpdateDetails("quantity", event.target.value)}
              placeholder="Ex: 2 caixas, 5 kg, 3 sacolas"
              {...estimatedQuantityValidationProps}
            />
          </PublicFormField>
        </div>
        <PublicFormField id="special-notes" label="Instruções Especiais ou Observações">
          <PublicTextArea
            id="special-notes"
            value={details.notes}
            onChange={(event) => onUpdateDetails("notes", event.target.value)}
            placeholder="Instruções de acesso, melhor horário para coleta ou observações adicionais..."
            compact
            {...specialNotesValidationProps}
          />
        </PublicFormField>
        {submitFeedback ? (
          <InlineFeedback
            tone={submitFeedback.type === "success" ? "success" : "error"}
            message={submitFeedback.message}
            role={submitFeedback.type === "error" ? "alert" : "status"}
            ariaLive="polite"
          />
        ) : null}
        <ActionButton
          type="submit"
          disabled={submitting}
          className={styles.primaryActionWide}
          fullWidthOnMobile
        >
          {submitting ? "Enviando Doação..." : "Enviar Pedido de Doação"}
        </ActionButton>
      </FormPanel>
    </div>
  );
}

export function DonateGoodsFlowSection({
  model,
}: {
  model: DonateGoodsPageModel;
}) {
  // 流程逻辑由 page model 持有;本区块保持声明式,
  // 使文案和布局调整不与校验或提交规则耦合。
  const {
    details,
    fieldErrors,
    postcode,
    postcodeError,
    searchFeedback,
    searchResults,
    searching,
    selectedBank,
    step,
    submitFeedback,
    submitting,
    changePostcode,
    goToSearchStep,
    goToSelectBankStep,
    handleSearch,
    handleSelectBank,
    handleSubmitDonation,
    normalizePickupDateField,
    updateDetails,
  } = model;

  return (
    <PublicPageSection id="donate" width="page">
      <PublicSectionIntro
        title="Envie seu pedido de doação"
        description="Três etapas simples: busque pelo CEP, escolha o ponto de coleta e informe os detalhes da doação."
        className={styles.sectionHeader}
      />
      <div className={styles.flowShell}>
        <div className={styles.progressHeader}>
          <div className={styles.progressTrack}>
            <div
              className={cn(
                styles.progressDot,
                step >= 1 && styles.progressDotActive,
              )}
            >
              1
            </div>
            <div
              className={cn(
                styles.progressLine,
                step >= 2 && styles.progressLineActive,
              )}
            />
            <div
              className={cn(
                styles.progressDot,
                step >= 2 && styles.progressDotActive,
              )}
            >
              2
            </div>
            <div
              className={cn(
                styles.progressLine,
                step >= 3 && styles.progressLineActive,
              )}
            />
            <div
              className={cn(
                styles.progressDot,
                step >= 3 && styles.progressDotActive,
              )}
            >
              3
            </div>
          </div>
          <div className={styles.progressLabels}>
            {FLOW_PROGRESS_LABELS.map((label, index) => (
              <span
                key={label}
                className={step >= index + 1 ? styles.progressLabelActive : ""}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        {step === 1 ? (
          <SearchLocationStep
            postcode={postcode}
            postcodeError={postcodeError}
            searching={searching}
            onSearch={handleSearch}
            onPostcodeChange={changePostcode}
          />
        ) : null}
        {step === 2 ? (
          <SelectFoodBankStep
            searchFeedback={searchFeedback}
            searchResults={searchResults}
            onBack={goToSearchStep}
            onSelectBank={handleSelectBank}
          />
        ) : null}
        {step === 3 && selectedBank ? (
          <DonationDetailsStep
            selectedBank={selectedBank}
            details={details}
            fieldErrors={fieldErrors}
            submitFeedback={submitFeedback}
            submitting={submitting}
            onBack={goToSelectBankStep}
            onSubmit={handleSubmitDonation}
            onUpdateDetails={updateDetails}
            onNormalizePickupDateField={normalizePickupDateField}
          />
        ) : null}
      </div>
    </PublicPageSection>
  );
}
