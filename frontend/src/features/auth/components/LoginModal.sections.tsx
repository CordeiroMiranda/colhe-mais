import { type ReactNode } from "react";
import { getEnglishInputValidationProps } from "@/shared/lib/nativeValidation";
import { Field, FormPanel, InlineFeedback } from "@/shared/ui/FormPrimitives";
import {
  AUTH_TABS,
  DEMO_SIGNIN_ACCOUNTS,
  FORGOT_FIELDS,
  type FieldConfig,
  type FieldErrors,
  type FormValues,
  type LoginModalModel,
  REGISTER_FIELDS,
  RESET_FIELDS,
  SIGNIN_FIELDS,
  type VisibilityState,
} from "./loginModal.model";
import styles from "./LoginModal.module.css";

const getPasswordEmoji = (visible: boolean) => (visible ? "👁️" : "🙈");

type FormFieldsProps<FormState extends FormValues> = {
  prefix: string;
  fields: FieldConfig<FormState>[];
  values: FormState;
  errors?: FieldErrors<FormState>;
  visibility?: VisibilityState<FormState>;
  onFieldChange: (key: keyof FormState, value: string) => void;
  onToggleVisibility?: (key: keyof FormState) => void;
};

type InlineLinkButtonProps = { onClick: () => void; children: ReactNode };

function InlineLinkButton({ onClick, children }: InlineLinkButtonProps) {
  return (
    <button type="button" className={styles.linkButton} onClick={onClick}>
      {children}
    </button>
  );
}

function DemoAccountsCard() {
  return (
    <div className={styles.demoAccounts}>
      <p className={styles.demoTitle}>Contas de demonstração</p>
      <ul className={styles.demoList}>
        {DEMO_SIGNIN_ACCOUNTS.map((account) => (
          <li key={account} className={styles.demoItem}>
            {account}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormFields<FormState extends FormValues>({
  prefix,
  fields,
  values,
  errors = {},
  visibility = {},
  onFieldChange,
  onToggleVisibility,
}: FormFieldsProps<FormState>) {
  return (
    <>
      {fields.map(([label, key, type, placeholder]) => {
        const stringKey = String(key);
        const isPassword = type === "password";
        const isVisible = Boolean(visibility[key]);
        const error = errors[key];
        const validationProps = getEnglishInputValidationProps(label);

        return (
          <Field
            key={stringKey}
            id={`${prefix}-${stringKey}`}
            label={label}
            className={styles.formGroup}
            labelClassName={styles.label}
            error={error}
            errorClassName={styles.errorText}
          >
            <div className={styles.inputWrapper}>
              <input
                id={`${prefix}-${stringKey}`}
                type={isPassword && isVisible ? "text" : type}
                placeholder={placeholder}
                value={values[key]}
                onChange={(event) => onFieldChange(key, event.target.value)}
                className={`${styles.formInput} ${isPassword ? styles.passwordInput : ""} ${error ? styles.inputError : ""}`.trim()}
                {...validationProps}
              />
              {isPassword ? (
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => onToggleVisibility?.(key)}
                  aria-label={isVisible ? "Ocultar senha" : "Exibir senha"}
                >
                  <span className={styles.passwordEmoji} aria-hidden="true">
                    {getPasswordEmoji(isVisible)}
                  </span>
                </button>
              ) : null}
            </div>
          </Field>
        );
      })}
    </>
  );
}

function RegisterPanel({ model }: { model: LoginModalModel }) {
  return (
    <FormPanel
      className={styles.formPanel}
      onSubmitAction={model.handleRegister}
      noValidate
    >
      <FormFields
        prefix="register"
        fields={REGISTER_FIELDS}
        values={model.regForm}
        errors={model.regErrors}
        visibility={{
          password: model.passwordVisibility.register,
          confirm: model.passwordVisibility.registerConfirm,
        }}
        onFieldChange={model.updateRegisterField}
        onToggleVisibility={(key) => {
          if (key === "password") model.togglePasswordVisibility("register");
          if (key === "confirm")
            model.togglePasswordVisibility("registerConfirm");
        }}
      />
      <button
        type="submit"
        className={styles.submitButton}
        disabled={model.regLoading}
      >
        {model.regLoading ? "Criando conta..." : "Criar Conta"}
      </button>
    </FormPanel>
  );
}

function ForgotPasswordPanel({ model }: { model: LoginModalModel }) {
  return (
    <FormPanel
      className={styles.formPanel}
      onSubmitAction={model.handleForgotPassword}
      noValidate
    >
      <div className={styles.panelIntro}>
        <p className={styles.panelDescription}>
          Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos
          um código de verificação de 6 dígitos para sua caixa de entrada.
        </p>
      </div>
      <FormFields
        prefix="forgot"
        fields={FORGOT_FIELDS}
        values={{ email: model.forgotEmail }}
        onFieldChange={(_, value) => model.changeForgotEmail(value)}
      />
      <InlineFeedback
        variant="text"
        message={model.forgotFeedback?.message}
        className={
          model.forgotFeedback?.tone === "error"
            ? styles.errorText
            : styles.successText
        }
        role={model.forgotFeedback?.tone === "error" ? "alert" : "status"}
        ariaLive="polite"
      />
      <button
        type="submit"
        className={styles.submitButton}
        disabled={model.forgotLoading}
      >
        {model.forgotLoading ? "Enviando código..." : "Enviar Código de Verificação"}
      </button>
      <div className={styles.inlineActions}>
        <InlineLinkButton onClick={model.backToSignInFromForgot}>
          Voltar para o login
        </InlineLinkButton>
      </div>
    </FormPanel>
  );
}

function ResetPasswordPanel({ model }: { model: LoginModalModel }) {
  return (
    <FormPanel
      className={styles.formPanel}
      onSubmitAction={model.handleResetPassword}
      noValidate
    >
      <div className={styles.panelIntro}>
        <p className={styles.panelDescription}>
          Informe o endereço de e-mail que recebeu o código e utilize o código
          de 6 dígitos para cadastrar uma nova senha.
        </p>
      </div>
      <InlineFeedback
        variant="text"
        message={model.resetFeedback?.message}
        className={
          model.resetFeedback?.tone === "error"
            ? styles.errorText
            : styles.successText
        }
        role={model.resetFeedback?.tone === "error" ? "alert" : "status"}
        ariaLive="polite"
      />
      <FormFields
        prefix="reset"
        fields={RESET_FIELDS}
        values={model.resetForm}
        errors={model.resetErrors}
        visibility={{
          newPassword: model.passwordVisibility.reset,
          confirm: model.passwordVisibility.resetConfirm,
        }}
        onFieldChange={model.updateResetField}
        onToggleVisibility={(key) => {
          if (key === "newPassword") model.togglePasswordVisibility("reset");
          if (key === "confirm") model.togglePasswordVisibility("resetConfirm");
        }}
      />
      <button
        type="submit"
        className={styles.submitButton}
        disabled={model.resetLoading}
      >
        {model.resetLoading ? "Atualizando senha..." : "Redefinir Senha"}
      </button>
      <div className={styles.inlineActions}>
        <InlineLinkButton onClick={model.useAnotherEmail}>
          Usar outro e-mail
        </InlineLinkButton>
        <InlineLinkButton onClick={model.backToSignInFromReset}>
          Voltar para o login
        </InlineLinkButton>
      </div>
    </FormPanel>
  );
}

function SignInPanel({ model }: { model: LoginModalModel }) {
  return (
    <FormPanel
      className={styles.formPanel}
      onSubmitAction={model.handleSignIn}
      noValidate
    >
      <FormFields
        prefix="signin"
        fields={SIGNIN_FIELDS}
        values={model.signInForm}
        visibility={{ password: model.passwordVisibility.signIn }}
        onFieldChange={model.updateSignInField}
        onToggleVisibility={(key) => {
          if (key === "password") model.togglePasswordVisibility("signIn");
        }}
      />
      <InlineFeedback
        variant="text"
        message={model.signInError}
        className={styles.errorText}
        role="alert"
        ariaLive="polite"
      />
      <InlineFeedback
        variant="text"
        message={model.signInNotice}
        className={styles.successText}
        role="status"
        ariaLive="polite"
      />
      <div className={styles.inlineActions}>
        <InlineLinkButton onClick={model.openForgotPassword}>
          Esqueceu a senha?
        </InlineLinkButton>
      </div>
      <button
        type="submit"
        className={styles.submitButton}
        disabled={model.signInLoading}
      >
        {model.signInLoading ? "Entrando..." : "Entrar"}
      </button>
      <DemoAccountsCard />
    </FormPanel>
  );
}

function ActivePanel({ model }: { model: LoginModalModel }) {
  if (model.tab === "register") {
    return <RegisterPanel model={model} />;
  }
  if (model.signInView === "forgot") {
    return <ForgotPasswordPanel model={model} />;
  }
  if (model.signInView === "reset") {
    return <ResetPasswordPanel model={model} />;
  }
  return <SignInPanel model={model} />;
}

export function LoginModalDialog({ model }: { model: LoginModalModel }) {
  if (!model.isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop} onClick={model.onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={model.onClose}
          aria-label="Fechar janela"
        >
          ×
        </button>
        <div className={styles.header}>
          <h1 id="login-modal-title" className={styles.title}>
            {model.modalTitle}
          </h1>
        </div>
        <div className={styles.tabs}>
          {AUTH_TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              className={`${styles.tabItem} ${model.tab === tabName ? styles.tabItemActive : ""}`.trim()}
              onClick={() => model.resetAuthViews(tabName)}
            >
              {tabName === "signin" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>
        <ActivePanel model={model} />
      </div>
    </div>
  );
}
