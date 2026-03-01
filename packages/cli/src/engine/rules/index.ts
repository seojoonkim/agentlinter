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
import { remoteReadyRules } from "./remoteReady";
import { instructionCountRules } from "./instructionCount";
import { relevanceTrapRules } from "./relevanceTrap";
import { progressiveDisclosureRules } from "./progressiveDisclosure";
import { hooksStructureRules } from "./hooksStructure";
import { skillsVsCommandsRules } from "./skillsVsCommands";
import { agentFocusRules } from "./agentFocus";
// v0.8.0 new rules
import { positionRiskRules } from "./positionRisk";
import { tokenEfficiencyRules } from "./tokenEfficiency";

export const allRules: Rule[] = [
  ...structureRules,
  ...clarityRules,
  ...completenessRules,
  ...securityRules,
  ...consistencyRules,
  ...memoryRules,
  ...runtimeRules,
  ...skillSafetyRules,
  ...remoteReadyRules,
  // v1.0.0 new rules
  ...instructionCountRules,
  ...relevanceTrapRules,
  ...progressiveDisclosureRules,
  ...hooksStructureRules,
  ...skillsVsCommandsRules,
  ...agentFocusRules,
  // v0.8.0 new rules
  ...positionRiskRules,
  ...tokenEfficiencyRules,
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
  remoteReadyRules,
  positionRiskRules,
  tokenEfficiencyRules,
};
