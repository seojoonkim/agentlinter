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
import { claudeCodeRules } from "./claudeCode";
import { remoteReadyRules } from "./remoteReady";
import { tokenBudgetRules } from "./tokenBudget";
import { instructionScopeRules } from "./instructionScope";
import { hooksAdvisorRules } from "./hooksAdvisor";
import { advancedRules } from "./advanced";
import { instructionCountRules } from "./instructionCount";
import { relevanceTrapRules } from "./relevanceTrap";
import { progressiveDisclosureRules } from "./progressiveDisclosure";
import { hooksStructureRules } from "./hooksStructure";
import { skillsVsCommandsRules } from "./skillsVsCommands";
import { agentFocusRules } from "./agentFocus";

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
  ...claudeCodeRules,
  ...remoteReadyRules,
  ...tokenBudgetRules,
  ...instructionScopeRules,
  ...hooksAdvisorRules,
  ...advancedRules,
  // v1.0.0 new rules
  ...instructionCountRules,
  ...relevanceTrapRules,
  ...progressiveDisclosureRules,
  ...hooksStructureRules,
  ...skillsVsCommandsRules,
  ...agentFocusRules,
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
  claudeCodeRules,
  remoteReadyRules,
  tokenBudgetRules,
  instructionScopeRules,
  hooksAdvisorRules,
  advancedRules,
};
