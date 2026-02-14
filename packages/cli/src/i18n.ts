import i18next from "i18next";
import ICU from "i18next-icu";

import enCatalog from "./locales/en.json";
import koCatalog from "./locales/ko.json";
import zhHansCatalog from "./locales/zh-hans.json";
import zhHantCatalog from "./locales/zh-hant.json";

export const I18N_CONFIG = {
  supportedLocales: ["en", "ko", "zh-Hans", "zh-Hant"] as const,
  defaultLocale: "en" as const,
} as const;

export const SUPPORTED_LOCALES = I18N_CONFIG.supportedLocales;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = I18N_CONFIG.defaultLocale;
export const LOCALE_ENV_VAR = "AGENTLINTER_LANG";
export const SYSTEM_LANG_ENV_VAR = "LANG";
export const DIAGNOSTIC_OVERLAY_LOCALES = new Set<Locale>(["ko"]);
export const SUPPORTED_LOCALE_HINT_COMMA = SUPPORTED_LOCALES.join(", ");
export const SUPPORTED_LOCALE_HINT_PIPE = SUPPORTED_LOCALES.join("|");
export const DEFAULT_LOCALE_INFO = DEFAULT_LOCALE;

export const LOCALE_RESOLUTION_ORDER = [
  "--lang",
  LOCALE_ENV_VAR,
  SYSTEM_LANG_ENV_VAR,
  DEFAULT_LOCALE,
] as const;

const LOCALE_RESOURCES: Record<Locale, { translation: Record<string, unknown> }> = {
  en: enCatalog,
  ko: koCatalog,
  "zh-Hans": zhHansCatalog,
  "zh-Hant": zhHantCatalog,
};

function normalizeLocaleKey(value: string): string {
  return value.trim().replace(/_/g, "-").toLowerCase();
}

const SUPPORTED_LOCALE_INDEX = new Map<string, Locale>(
  SUPPORTED_LOCALES.map((locale) => [normalizeLocaleKey(locale), locale]),
);

let i18nInitialized = false;

function ensureI18nInitialized(): void {
  if (i18nInitialized) {
    return;
  }

  i18next.use(ICU);
  i18next.init({
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    showSupportNotice: false,
    resources: LOCALE_RESOURCES,
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false,
    returnNull: false,
  });

  i18nInitialized = true;
}

function canonicalizeLocaleToken(value: string): string | null {
  const normalized = value
    .trim()
    .replace(/;q=[0-9.]+$/i, "")
    .replace(/\..*$/, "")
    .replace(/@.*$/, "");

  if (!normalized || normalized === "*") {
    return null;
  }
  return normalized;
}

function parseLocaleCandidates(input?: string | null): string[] {
  if (!input) {
    return [];
  }

  return input
    .split(",")
    .map((part) => canonicalizeLocaleToken(part))
    .filter((part): part is string => Boolean(part));
}

function addUniqueLocaleCandidate(target: string[], candidate?: string): void {
  if (!candidate) return;
  const key = normalizeLocaleKey(candidate);
  if (target.some((item) => normalizeLocaleKey(item) === key)) {
    return;
  }
  target.push(candidate);
}

function getLanguagePart(locale: string): string | null {
  const normalized = normalizeLocaleKey(locale);
  if (!normalized) return null;
  return normalized.split("-")[0] || null;
}

function getSupportedLocaleByCandidate(candidate: string): Locale | null {
  return SUPPORTED_LOCALE_INDEX.get(normalizeLocaleKey(candidate)) ?? null;
}

function buildLocalePreferenceList(rawLocale: string): string[] {
  const preferences: string[] = [];
  addUniqueLocaleCandidate(preferences, rawLocale);
  addUniqueLocaleCandidate(preferences, rawLocale.replace(/_/g, "-"));

  try {
    const canonical = Intl.getCanonicalLocales(rawLocale.replace(/_/g, "-"))[0];
    addUniqueLocaleCandidate(preferences, canonical);

    const locale = new Intl.Locale(canonical);
    const language = locale.language;
    const script = locale.script;
    const region = locale.region;

    addUniqueLocaleCandidate(preferences, language);
    if (language && script) {
      addUniqueLocaleCandidate(preferences, `${language}-${script}`);
    }
    if (language && region) {
      addUniqueLocaleCandidate(preferences, `${language}-${region}`);
    }

    if (language?.toLowerCase() === "zh") {
      const normalizedScript = script?.toLowerCase();
      const normalizedRegion = region?.toUpperCase();
      if (
        normalizedScript === "hant" ||
        normalizedRegion === "TW" ||
        normalizedRegion === "HK" ||
        normalizedRegion === "MO"
      ) {
        addUniqueLocaleCandidate(preferences, "zh-Hant");
      }
      if (
        normalizedScript === "hans" ||
        normalizedRegion === "CN" ||
        normalizedRegion === "SG"
      ) {
        addUniqueLocaleCandidate(preferences, "zh-Hans");
      }
    }
  } catch {
    // Best-effort parsing only; fallback happens below.
  }

  return preferences;
}

function resolveSupportedLocale(input?: string | null): Locale | null {
  const requestedLocales = parseLocaleCandidates(input);
  if (requestedLocales.length === 0) {
    return null;
  }

  for (const requested of requestedLocales) {
    const preferences = buildLocalePreferenceList(requested);

    for (const candidate of preferences) {
      const exactMatch = getSupportedLocaleByCandidate(candidate);
      if (exactMatch) {
        return exactMatch;
      }
    }

    const languagePart = getLanguagePart(requested);
    if (!languagePart) {
      continue;
    }

    const languageFallback = SUPPORTED_LOCALES.find(
      (locale) => getLanguagePart(locale) === languagePart,
    );
    if (languageFallback) {
      return languageFallback;
    }
  }

  return null;
}

export function normalizeLocale(input?: string | null): Locale | null {
  return resolveSupportedLocale(input);
}

export function isDefaultLocale(locale: Locale): boolean {
  return locale === DEFAULT_LOCALE;
}

export function shouldApplyDiagnosticOverlay(locale: Locale): boolean {
  return !isDefaultLocale(locale) && DIAGNOSTIC_OVERLAY_LOCALES.has(locale);
}

export function getSupportedLocaleHint(): string {
  return SUPPORTED_LOCALE_HINT_COMMA;
}

export function resolveLocale(
  cliLang?: string | null,
  envLang = process.env[LOCALE_ENV_VAR],
  systemLang = process.env[SYSTEM_LANG_ENV_VAR],
): { locale: Locale; invalidCliLang?: string } {
  const cliLocale = resolveSupportedLocale(cliLang);
  const envLocale = resolveSupportedLocale(envLang);
  const systemLocale = resolveSupportedLocale(systemLang);

  if (cliLang && !cliLocale) {
    return {
      locale: envLocale ?? systemLocale ?? DEFAULT_LOCALE,
      invalidCliLang: cliLang,
    };
  }

  return {
    locale: cliLocale ?? envLocale ?? systemLocale ?? DEFAULT_LOCALE,
  };
}

export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number | boolean>,
  defaultValue?: string,
): string {
  ensureI18nInitialized();
  return i18next.t(key, {
    lng: locale,
    defaultValue,
    ...(vars ?? {}),
  }) as string;
}

export function getCategoryLabel(category: string, locale: Locale): string {
  return t(locale, `category.${category}`, undefined, category);
}

export function getHelpText(locale: Locale): string {
  return t(locale, "helpText", {
    supportedPipe: SUPPORTED_LOCALE_HINT_PIPE,
    defaultLocale: DEFAULT_LOCALE_INFO,
  });
}

export function getShareText(
  locale: Locale,
  score: number,
  grade: string,
  percentile: number,
): string {
  return t(locale, "shareText", { score, grade, percentile });
}

export function getVerdictLabel(locale: Locale, verdict: string): string {
  return t(locale, `verdictLabel.${verdict}`, undefined, verdict);
}

export function getSeverityLabel(locale: Locale, severity: string): string {
  return t(locale, `severityLabel.${severity}`, undefined, severity);
}

export function getDiagnosticBadge(
  locale: Locale,
  type: "critical" | "warning" | "info" | "tip",
): string {
  return t(locale, `diagnosticBadge.${type}`);
}

export function getSuggestedFixesSummary(locale: Locale, count: number): string {
  return t(locale, "suggestedFixesSummary", { count });
}

export function getAuditVerdictText(locale: Locale, verdict: string): string {
  const label = getVerdictLabel(locale, verdict);
  return t(locale, "auditVerdictDisplay", { label, code: verdict }, verdict);
}
