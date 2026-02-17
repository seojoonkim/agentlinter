import { Diagnostic } from "./engine/types";
import { Locale, shouldApplyDiagnosticOverlay } from "./i18n";

import enCatalog from "./locales/en.json";
import koCatalog from "./locales/ko.json";
import koKpCatalog from "./locales/ko_kp.json";
import zhHansCatalog from "./locales/zh-hans.json";
import zhHantCatalog from "./locales/zh-hant.json";

type DiagnosticsDictionary = {
  ruleMessages?: Record<string, string>;
  metadataMessages?: {
    missingFrontmatter?: string;
    missingAuthor?: string;
    missingDescription?: string;
    default?: string;
  };
  fixTranslations?: Record<string, string>;
};

type LocaleCatalog = {
  diagnostics?: DiagnosticsDictionary;
};

const EMPTY_DICTIONARY: DiagnosticsDictionary = {};

const DICTIONARIES: Record<Locale, DiagnosticsDictionary> = {
  en: (enCatalog as LocaleCatalog).diagnostics ?? EMPTY_DICTIONARY,
  ko: (koCatalog as LocaleCatalog).diagnostics ?? EMPTY_DICTIONARY,
  ko_kp: (koKpCatalog as LocaleCatalog).diagnostics ?? EMPTY_DICTIONARY,
  "zh-Hans": (zhHansCatalog as LocaleCatalog).diagnostics ?? EMPTY_DICTIONARY,
  "zh-Hant": (zhHantCatalog as LocaleCatalog).diagnostics ?? EMPTY_DICTIONARY,
};

function getDiagnosticsDictionary(locale: Locale): DiagnosticsDictionary {
  return DICTIONARIES[locale] ?? EMPTY_DICTIONARY;
}

function hasDictionaryEntries(dictionary: DiagnosticsDictionary): boolean {
  return Boolean(
    (dictionary.ruleMessages && Object.keys(dictionary.ruleMessages).length > 0) ||
      (dictionary.fixTranslations && Object.keys(dictionary.fixTranslations).length > 0) ||
      dictionary.metadataMessages,
  );
}

function q(message: string): string | null {
  const m = message.match(/"([^"]+)"/);
  return m ? m[1] : null;
}

function formatTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

function localizeMessageByRule(rule: string, message: string, dictionary: DiagnosticsDictionary): string {
  if (rule === "skill-safety/has-metadata") {
    const metadataMessages = dictionary.metadataMessages;
    if (!metadataMessages) {
      return message;
    }

    if (message.includes("missing YAML frontmatter")) {
      return metadataMessages.missingFrontmatter ?? metadataMessages.default ?? message;
    }
    if (message.includes("missing author")) {
      return metadataMessages.missingAuthor ?? metadataMessages.default ?? message;
    }
    if (message.includes("missing description")) {
      return metadataMessages.missingDescription ?? metadataMessages.default ?? message;
    }

    return metadataMessages.default ?? message;
  }

  const translated = dictionary.ruleMessages?.[rule];
  if (!translated) {
    return message;
  }

  const quoted = q(message);
  return quoted ? formatTemplate(translated, { quoted }) : translated;
}

function localizeFixByRule(rule: string, fix: string | undefined, dictionary: DiagnosticsDictionary): string | undefined {
  if (!fix) return fix;

  const staticTranslated = dictionary.fixTranslations?.[fix];
  if (staticTranslated) return staticTranslated;

  if (rule === "clarity/undefined-term") {
    const m = fix.match(/^Write it as "\*\*(.+) \(Full Name Here\)\*\*" on first mention\.$/);
    if (m && dictionary.fixTranslations?.__clarity_undefined_term_template__) {
      return formatTemplate(dictionary.fixTranslations.__clarity_undefined_term_template__, {
        acronym: m[1],
      });
    }
  }

  if (rule === "consistency/referenced-files-exist") {
    const m = fix.match(/^Create (.+) or remove the reference\.$/);
    if (m && dictionary.fixTranslations?.__consistency_referenced_files_exist_template__) {
      return formatTemplate(dictionary.fixTranslations.__consistency_referenced_files_exist_template__, {
        file: m[1],
      });
    }
  }

  if (rule === "runtime/config-secrets") {
    const m = fix.match(/^Replace with "\$\{(.+)\}" and set the env var\.$/);
    if (m && dictionary.fixTranslations?.__runtime_config_secrets_template__) {
      return formatTemplate(dictionary.fixTranslations.__runtime_config_secrets_template__, {
        env: m[1],
      });
    }
  }

  return fix;
}

export function localizeDiagnostic(diag: Diagnostic, locale: Locale): Diagnostic {
  if (!shouldApplyDiagnosticOverlay(locale)) return diag;

  const dictionary = getDiagnosticsDictionary(locale);
  if (!hasDictionaryEntries(dictionary)) {
    return diag;
  }

  return {
    ...diag,
    message: localizeMessageByRule(diag.rule, diag.message, dictionary),
    fix: localizeFixByRule(diag.rule, diag.fix, dictionary),
  };
}

export function localizeDiagnostics(diagnostics: Diagnostic[], locale: Locale): Diagnostic[] {
  if (!shouldApplyDiagnosticOverlay(locale)) return diagnostics;
  return diagnostics.map((diag) => localizeDiagnostic(diag, locale));
}
