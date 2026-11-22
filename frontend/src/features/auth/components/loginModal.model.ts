import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/authStore";
import { isStrongPassword, isValidEmail } from "@/shared/lib/validation";
import { getPostLoginRedirect, type AllowedRole } from "../auth.helpers";

export type AuthTab = "signin" | "register";
export type SignInView = "signin" | "forgot" | "reset";
export type Feedback = { tone: "success" | "error"; message: string };
export type SubmitHandler = () => Promise<void> | void;
export type FormValues = Record<string, string>;

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
  redirectTo?: string | null;
  requiredRole?: AllowedRole;
}

export type SignInFormState = { email: string; password: string };
export type ResetFormState = {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirm: string;
};
export type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};
export type FieldConfig<FormState extends FormValues> = readonly [
  label: string,
  key: keyof FormState,
  type: "text" | "email" | "password",
  placeholder: string,
];
export type FieldErrors<FormState extends FormValues> = Partial<
  Record<keyof FormState, string>
>;
export type VisibilityState<FormState extends FormValues> = Partial<
  Record<keyof FormState, boolean>
>;

export const AUTH_TABS = [
  "signin",
  "register",
] as const satisfies readonly AuthTab[];

export const DEMO_SIGNIN_ACCOUNTS = [
  "Administrador Geral: admin@foodbank.com / admin123",
  "Resp. Ponto de Coleta (Ponto Central): localadmin@foodbank.com / localadmin123",
  "Resp. Ponto de Coleta (Ponto Oeste): local1admin@foodbank.com / local1admin123",
  "Comércio Parceiro: supermarket@foodbank.com / supermarket123",
  "Doador / Morador: user@example.com / user12345",
] as const;

export const SIGNIN_FIELDS: FieldConfig<SignInFormState>[] = [
  ["E-mail", "email", "email", "seuemail@exemplo.com"],
  ["Senha", "password", "password", "Digite sua senha"],
];

export const FORGOT_FIELDS: FieldConfig<Pick<SignInFormState, "email">>[] = [
  ["E-mail", "email", "email", "seuemail@exemplo.com"],
];

export const REGISTER_FIELDS: FieldConfig<RegisterFormState>[] = [
  ["Nome Completo", "name", "text", "Seu nome completo"],
  ["E-mail", "email", "email", "seuemail@exemplo.com"],
  [
    "Senha",
    "password",
    "password",
    "Mínimo 8 caracteres com letras, números e símbolos",
  ],
  ["Confirmar Senha", "confirm", "password", "Repita a senha"],
];

export const RESET_FIELDS: FieldConfig<ResetFormState>[] = [
  ["E-mail", "email", "email", "seuemail@exemplo.com"],
  [
    "Código de Verificação",
    "verificationCode",
    "text",
    "Digite o código de 6 dígitos recebido por e-mail",
  ],
  [
    "Nova Senha",
    "newPassword",
    "password",
    "Mínimo 8 caracteres com letras, números e símbolos",
  ],
  ["Confirmar Senha", "confirm", "password", "Repita a nova senha"],
];

const EMPTY_PASSWORD_VISIBILITY = {
  signIn: false,
  reset: false,
  resetConfirm: false,
  register: false,
  registerConfirm: false,
};

export type PasswordVisibilityKey =
  | "signIn"
  | "reset"
  | "resetConfirm"
  | "register"
  | "registerConfirm";

export type FormErrors = Record<string, string>;

const PASSWORD_RULE_MESSAGE =
  "A senha deve conter letras, números e caracteres especiais (sem espaços).";

export function createEmptySignInForm(): SignInFormState {
  return { email: "", password: "" };
}

export function createEmptyRegisterForm(): RegisterFormState {
  return { name: "", email: "", password: "", confirm: "" };
}

export function createEmptyResetForm(): ResetFormState {
  return { email: "", verificationCode: "", newPassword: "", confirm: "" };
}

export function createPasswordVisibilityState() {
  return { ...EMPTY_PASSWORD_VISIBILITY };
}

export function clearFormErrors(
  current: FormErrors,
  key: string,
  relatedKeys: string[] = [],
) {
  const next = { ...current };
  [key, ...relatedKeys].forEach((entry) => {
    delete next[entry];
  });
  return next;
}

export function validateResetForm(resetForm: ResetFormState): FormErrors {
  const errors: FormErrors = {};
  const passwordIsStrong = isStrongPassword(resetForm.newPassword);

  if (!isValidEmail(resetForm.email)) {
    errors.email = "Por favor, informe um e-mail válido.";
  }
  if (!resetForm.verificationCode.trim()) {
    errors.verificationCode = "O código de verificação é obrigatório.";
  } else if (!/^\d{6}$/.test(resetForm.verificationCode.trim())) {
    errors.verificationCode =
      "O código de verificação deve conter exatamente 6 dígitos.";
  }
  if (!passwordIsStrong) {
    errors.newPassword = PASSWORD_RULE_MESSAGE;
  }
  if (!resetForm.confirm) {
    errors.confirm = "Por favor, confirme a nova senha.";
  } else if (passwordIsStrong && resetForm.newPassword !== resetForm.confirm) {
    errors.confirm = "As senhas não coincidem.";
  }

  return errors;
}

export function validateRegisterForm(regForm: RegisterFormState): FormErrors {
  const errors: FormErrors = {};
  const passwordIsStrong = isStrongPassword(regForm.password);

  if (!regForm.name.trim()) {
    errors.name = "O nome é obrigatório.";
  }
  if (!isValidEmail(regForm.email)) {
    errors.email = "Por favor, informe um e-mail válido.";
  }
  if (!passwordIsStrong) {
    errors.password = PASSWORD_RULE_MESSAGE;
  }
  if (!regForm.confirm) {
    errors.confirm = "Por favor, confirme a senha.";
  } else if (passwordIsStrong && regForm.password !== regForm.confirm) {
    errors.confirm = "As senhas não coincidem.";
  }

  return errors;
}

export function modalTitleFor(tab: AuthTab, signInView: SignInView) {
  if (tab === "register") {
    return "Criar Conta";
  }
  if (signInView === "forgot") {
    return "Recuperar Senha";
  }
  if (signInView === "reset") {
    return "Redefinir Senha";
  }
  return "Entrar no Colhe+";
}

export type LoginModalControllerOptions = {
  initialTab?: AuthTab;
  redirectTo?: string | null;
  requiredRole?: AllowedRole;
};

type LoginModalControllerState = {
  open: boolean;
  initialTab: AuthTab;
  redirectTo: string | null;
  requiredRole: AllowedRole;
};

type OpenLoginModalOptions = Partial<LoginModalControllerOptions>;

const createControllerState = ({
  initialTab = "signin",
  redirectTo = null,
  requiredRole,
}: LoginModalControllerOptions = {}): LoginModalControllerState => ({
  open: false,
  initialTab,
  redirectTo,
  requiredRole,
});

export function useLoginModalController(
  defaults: LoginModalControllerOptions = {},
) {
  const [state, setState] = useState<LoginModalControllerState>(() =>
    createControllerState(defaults),
  );

  const close = useCallback(() => {
    setState((current) => ({ ...current, open: false }));
  }, []);

  const open = useCallback(
    (options: OpenLoginModalOptions = {}) => {
      setState({
        open: true,
        initialTab: options.initialTab ?? defaults.initialTab ?? "signin",
        redirectTo: options.redirectTo ?? defaults.redirectTo ?? null,
        requiredRole: options.requiredRole ?? defaults.requiredRole,
      });
    },
    [defaults.initialTab, defaults.redirectTo, defaults.requiredRole],
  );

  const openSignIn = useCallback(
    (options: Omit<OpenLoginModalOptions, "initialTab"> = {}) => {
      open({ ...options, initialTab: "signin" });
    },
    [open],
  );

  const openRegister = useCallback(
    (options: Omit<OpenLoginModalOptions, "initialTab"> = {}) => {
      open({ ...options, initialTab: "register" });
    },
    [open],
  );

  const modalProps: LoginModalProps = useMemo(
    () => ({
      isOpen: state.open,
      onClose: close,
      initialTab: state.initialTab,
      redirectTo: state.redirectTo,
      requiredRole: state.requiredRole,
    }),
    [close, state.initialTab, state.open, state.redirectTo, state.requiredRole],
  );

  return useMemo(
    () => ({
      isOpen: state.open,
      open,
      openSignIn,
      openRegister,
      close,
      modalProps,
    }),
    [close, modalProps, open, openRegister, openSignIn, state.open],
  );
}

type UseLoginModalModelOptions = Pick<
  LoginModalProps,
  "initialTab" | "isOpen" | "onClose" | "redirectTo" | "requiredRole"
>;

export function useLoginModalModel({
  initialTab = "signin",
  isOpen,
  onClose,
  redirectTo,
  requiredRole,
}: UseLoginModalModelOptions) {
  const { login, register } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [signInForm, setSignInForm] = useState(createEmptySignInForm);
  const [signInError, setSignInError] = useState("");
  const [signInNotice, setSignInNotice] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [regForm, setRegForm] = useState(createEmptyRegisterForm);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regLoading, setRegLoading] = useState(false);
  const [signInView, setSignInView] = useState<SignInView>("signin");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState<Feedback | null>(null);
  const [resetForm, setResetForm] =
    useState<ResetFormState>(createEmptyResetForm);
  const [resetErrors, setResetErrors] = useState<FormErrors>({});
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<Feedback | null>(null);
  const [passwordVisibility, setPasswordVisibility] = useState(
    createPasswordVisibilityState,
  );

  const clearSignInStatus = useCallback(() => {
    setSignInError("");
    setSignInNotice("");
  }, []);

  const updateSignInField = (key: keyof typeof signInForm, value: string) => {
    setSignInForm((form) => ({ ...form, [key]: value }));
  };

  const syncSignInEmail = useCallback((email: string) => {
    setSignInForm((form) => ({ ...form, email }));
  }, []);

  const completePasswordReset = useCallback((email: string, notice: string) => {
    setSignInForm((form) => ({ ...form, email, password: "" }));
    setSignInError("");
    setSignInNotice(notice);
  }, []);

  const handleSignIn = async () => {
    clearSignInStatus();
    if (!signInForm.email || !signInForm.password) {
      setSignInError("Por favor, preencha todos os campos.");
      return;
    }
    if (!isValidEmail(signInForm.email)) {
      setSignInError("Por favor, informe um e-mail válido.");
      return;
    }
    setSignInLoading(true);
    const result = await login(signInForm.email, signInForm.password);
    setSignInLoading(false);
    if (!result.success) {
      setSignInError(result.message ?? "Falha ao entrar.");
      return;
    }
    onClose();
    const { user } = useAuthStore.getState();
    const destination = getPostLoginRedirect(user, redirectTo, requiredRole);
    if (destination) {
      navigate(
        destination,
        destination.startsWith("/admin") || destination.startsWith("/workspace")
          ? { replace: true }
          : undefined,
      );
    }
  };

  const updateRegisterField = (key: keyof typeof regForm, value: string) => {
    setRegForm((form) => ({ ...form, [key]: value }));
    setRegErrors((current) =>
      clearFormErrors(
        current,
        String(key),
        key === "password" || key === "confirm" ? ["confirm"] : [],
      ),
    );
  };

  const handleRegister = async () => {
    const errors = validateRegisterForm(regForm);
    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setRegLoading(true);
    const result = await register(
      regForm.name,
      regForm.email,
      regForm.password,
    );
    setRegLoading(false);
    if (result.success) onClose();
    else setRegErrors({ email: result.message ?? "Falha ao cadastrar." });
  };

  const resetState = useCallback(() => {
    setSignInView("signin");
    clearSignInStatus();
    setForgotEmail("");
    setForgotFeedback(null);
    setResetForm(createEmptyResetForm());
    setResetErrors({});
    setResetFeedback(null);
  }, [clearSignInStatus]);

  const openForgotPassword = () => {
    setSignInView("forgot");
    clearSignInStatus();
    setForgotFeedback(null);
    setResetFeedback(null);
    setForgotEmail((current) => current || signInForm.email);
  };

  const handleForgotPassword = async () => {
    if (!isValidEmail(forgotEmail)) {
      setForgotFeedback({
        tone: "error",
        message: "Por favor, informe um e-mail válido.",
      });
      return;
    }
    setForgotLoading(true);
    setForgotFeedback(null);
    const result = await useAuthStore.getState().forgotPassword(forgotEmail);
    setForgotLoading(false);
    if (!result.success) {
      setForgotFeedback({
        tone: "error",
        message: result.message ?? "Não foi possível iniciar a recuperação de senha.",
      });
      return;
    }
    syncSignInEmail(forgotEmail);
    setResetForm({
      email: forgotEmail,
      verificationCode: "",
      newPassword: "",
      confirm: "",
    });
    setResetErrors({});
    setSignInView("reset");
    setResetFeedback({
      tone: "success",
      message:
        result.message ??
        "Se este e-mail estiver cadastrado, um código de verificação foi enviado. Digite-o abaixo junto com sua nova senha.",
    });
  };

  const changeForgotEmail = (value: string) => {
    setForgotEmail(value);
    setForgotFeedback(null);
  };

  const backToSignInFromForgot = () => {
    setSignInView("signin");
    setForgotFeedback(null);
  };

  const updateResetField = (key: keyof ResetFormState, value: string) => {
    setResetForm((form) => ({ ...form, [key]: value }));
    setResetErrors((current) =>
      clearFormErrors(
        current,
        String(key),
        key === "newPassword" || key === "confirm" ? ["confirm"] : [],
      ),
    );
    setResetFeedback((current) => (current?.tone === "error" ? null : current));
  };

  const handleResetPassword = async () => {
    const errors = validateResetForm(resetForm);
    setResetErrors(errors);
    setResetFeedback(null);
    if (Object.keys(errors).length > 0) return;
    const email = resetForm.email.trim();
    setResetLoading(true);
    const result = await useAuthStore
      .getState()
      .resetPassword(
        email,
        resetForm.verificationCode.trim(),
        resetForm.newPassword,
      );
    setResetLoading(false);
    if (!result.success) {
      setResetFeedback({
        tone: "error",
        message: result.message ?? "Falha ao redefinir a senha.",
      });
      return;
    }
    setResetForm(createEmptyResetForm());
    setResetErrors({});
    setResetFeedback(null);
    setSignInView("signin");
    completePasswordReset(
      email,
      result.message ??
        "Senha redefinida com sucesso. Por favor, entre com sua nova senha.",
    );
  };

  const useAnotherEmail = () => {
    setForgotEmail(resetForm.email);
    setSignInView("forgot");
    setResetFeedback(null);
  };

  const backToSignInFromReset = () => {
    setSignInView("signin");
    setResetFeedback(null);
    setResetErrors({});
  };

  const togglePasswordVisibility = (key: PasswordVisibilityKey) => {
    setPasswordVisibility((state) => ({ ...state, [key]: !state[key] }));
  };

  const resetAuthViews = (nextTab: AuthTab) => {
    setTab(nextTab);
    resetState();
    setPasswordVisibility(createPasswordVisibilityState());
  };

  useEffect(() => {
    if (!isOpen) return;
    setTab(initialTab);
    resetState();
    setPasswordVisibility(createPasswordVisibilityState());
  }, [initialTab, isOpen, resetState]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return {
    isOpen,
    onClose,
    tab,
    signInView,
    modalTitle: modalTitleFor(tab, signInView),
    signInForm,
    signInError,
    signInNotice,
    signInLoading,
    forgotEmail,
    forgotLoading,
    forgotFeedback,
    resetForm,
    resetErrors,
    resetLoading,
    resetFeedback,
    regForm,
    regErrors,
    regLoading,
    passwordVisibility,
    resetAuthViews,
    togglePasswordVisibility,
    updateSignInField,
    handleSignIn,
    openForgotPassword,
    handleForgotPassword,
    changeForgotEmail,
    backToSignInFromForgot,
    updateResetField,
    handleResetPassword,
    useAnotherEmail,
    backToSignInFromReset,
    updateRegisterField,
    handleRegister,
  };
}

export type LoginModalModel = ReturnType<typeof useLoginModalModel>;
