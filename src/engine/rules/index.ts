/* ─── Rule Registry ─── */

import { Rule } from "../types";
import { structureRules } from "./structure";
import { clarityRules } from "./clarity";
import { completenessRules } from "./completeness";
import { securityRules } from "./security";
import { consistencyRules } from "./consistency";
import { memoryRules } from "./memory";
import { runtimeRules } from "./runtime";
import { skillSafetyRules } from "./skillSafety";
import { bestPracticesRules } from "./bestPractices";
import { autofixRules } from "./autofix";
import { integrationRules } from "./integration";

export const allRules: Rule[] = [
  ...structureRules,
  ...clarityRules,
  ...completenessRules,
  ...securityRules,
  ...consistencyRules,
  ...memoryRules,
  ...runtimeRules,
  ...skillSafetyRules,
  ...bestPracticesRules,
  ...autofixRules,
  ...integrationRules,
];

export {
  structureRules,
  clarityRules,
  completenessRules,
  securityRules,
  consistencyRules,
  memoryRules,
  runtimeRules,
  skillSafetyRules,
  bestPracticesRules,
  autofixRules,
  integrationRules,
};
