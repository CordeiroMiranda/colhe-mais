import type { FormEventHandler } from "react";

type FormControlElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

type ValidationStateKey =
  | "valueMissing"
  | "typeMismatch"
  | "patternMismatch"
  | "tooShort"
  | "tooLong"
  | "rangeUnderflow"
  | "rangeOverflow"
  | "stepMismatch"
  | "badInput";

type ValidationMessageOverrides = Partial<Record<ValidationStateKey, string>>;

function normalizeLabel(label: string) {
  return label.replace(/\s*\*+\s*$/, "").trim();
}

function getFallbackMessage(label: string) {
  return `Por favor, informe um(a) ${label.toLowerCase()} válido(a).`;
}

function getDefaultValidationMessage(
  element: FormControlElement,
  label: string,
) {
  const normalizedLabel = normalizeLabel(label);
  const fallbackMessage = getFallbackMessage(normalizedLabel);

  if (element.validity.valueMissing) return `${normalizedLabel} é obrigatório.`;
  if (element.validity.typeMismatch) {
    if (element instanceof HTMLInputElement && element.type === "email") {
      return "Por favor, informe um endereço de e-mail válido.";
    }
    return fallbackMessage;
  }
  if (element.validity.patternMismatch)
    return `Por favor, utilize o formato solicitado para ${normalizedLabel.toLowerCase()}.`;
  if (element.validity.tooShort) return `${normalizedLabel} é muito curto.`;
  if (element.validity.tooLong) return `${normalizedLabel} é muito longo.`;
  if (
    element.validity.rangeUnderflow ||
    element.validity.rangeOverflow ||
    element.validity.stepMismatch ||
    element.validity.badInput
  ) {
    return fallbackMessage;
  }

  return element.validationMessage || fallbackMessage;
}

function getValidationMessage(
  element: FormControlElement,
  label: string,
  overrides: ValidationMessageOverrides,
) {
  const orderedStates: ValidationStateKey[] = [
    "valueMissing",
    "typeMismatch",
    "patternMismatch",
    "tooShort",
    "tooLong",
    "rangeUnderflow",
    "rangeOverflow",
    "stepMismatch",
    "badInput",
  ];

  for (const state of orderedStates) {
    if (element.validity[state]) {
      return overrides[state] ?? getDefaultValidationMessage(element, label);
    }
  }

  return getDefaultValidationMessage(element, label);
}

function createEnglishValidationProps<T extends FormControlElement>(
  label: string,
  overrides: ValidationMessageOverrides = {},
) {
  return {
    onInvalid: ((event) => {
      event.currentTarget.setCustomValidity(
        getValidationMessage(event.currentTarget, label, overrides),
      );
    }) satisfies FormEventHandler<T>,
    onInput: ((event) => {
      event.currentTarget.setCustomValidity("");
    }) satisfies FormEventHandler<T>,
  };
}

export function getEnglishInputValidationProps(
  label: string,
  overrides: ValidationMessageOverrides = {},
) {
  return createEnglishValidationProps<HTMLInputElement>(label, overrides);
}

export function getEnglishTextAreaValidationProps(
  label: string,
  overrides: ValidationMessageOverrides = {},
) {
  return createEnglishValidationProps<HTMLTextAreaElement>(label, overrides);
}

export function getEnglishSelectValidationProps(
  label: string,
  overrides: ValidationMessageOverrides = {},
) {
  return createEnglishValidationProps<HTMLSelectElement>(label, overrides);
}
