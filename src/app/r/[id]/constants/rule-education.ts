export const RULE_EDUCATION: Record<string, {
  impact: string;
  example?: { bad: string; good: string };
}> = {
  "structure/heading-hierarchy": {
    impact: "Skipped heading levels (h1 \u2192 h3) break the document outline. LLMs use heading hierarchy to understand section relationships and nesting. A clean hierarchy means better context parsing.",
    example: {
      bad: "# Main Title\n### Subsection  \u2190 skipped h2",
      good: "# Main Title\n## Section\n### Subsection  \u2190 proper nesting",
    },
  },
  "clarity/undefined-term": {
    impact: "Undefined acronyms force the model to guess meanings. In agent config files, precision matters \u2014 \"MUST\" could be an RFC 2119 keyword or just emphasis. Define it once so the model knows exactly what you mean.",
    example: {
      bad: "\u26A0\uFE0F MUST reference Name, Timezone",
      good: "\u26A0\uFE0F **MUST** (required \u2014 agent will fail without this): reference Name, Timezone",
    },
  },
  "consistency/language-mixing": {
    impact: "Mixing languages within sections can confuse the model's language mode. While technical terms in English within Korean text is normal, heavily mixed sentences reduce instruction clarity. Each section should have a primary language.",
    example: {
      bad: "\uC774 \uD30C\uC77C\uC744 read\uD574\uC11C check\uD558\uACE0 update\uD574\uC57C \uD568",
      good: "\uC774 \uD30C\uC77C\uC744 \uC77D\uACE0, \uD655\uC778\uD558\uACE0, \uC5C5\uB370\uC774\uD2B8\uD574\uC57C \uD568\n(or: Read, check, and update this file)",
    },
  },
  "clarity/no-vague-instructions": {
    impact: "Vague qualifiers like \"be helpful\" or \"use common sense\" give the model zero actionable information. Every vague word is a random choice the model makes without your input. Specific instructions produce predictable, consistent behavior.",
    example: {
      bad: "Be helpful and concise",
      good: "Answer in \u22643 sentences for simple questions. Use bullet points for complex answers. Include a code example when explaining technical concepts.",
    },
  },
  "clarity/naked-conditional": {
    impact: "\"If too long\" means 100 words to one model and 10,000 to another. Vague conditionals create inconsistent branching behavior. Replace with measurable thresholds.",
    example: {
      bad: "If the response is too long, shorten it",
      good: "If the response exceeds 500 words, summarize in \u22643 bullet points",
    },
  },
  "clarity/escape-hatch-missing": {
    impact: "Absolute rules without exceptions create deadlocks. When two \"never\" rules conflict, the agent has no way to resolve the paradox. An escape hatch (\"unless the user explicitly requests it\") gives the agent a principled way to handle edge cases.",
    example: {
      bad: "Never modify files without asking",
      good: "Never modify files without asking \u2014 unless the user just said 'fix it' or 'go ahead' in the same conversation",
    },
  },
  "security/no-secrets": {
    impact: "Secrets in config files get committed to git, shared via clipboard, and synced to cloud storage. A single leaked API key can cost thousands in unauthorized usage or compromise your entire infrastructure.",
    example: {
      bad: 'api_key: "sk-proj-abc123..."',
      good: "api_key: $OPENAI_API_KEY  # from environment",
    },
  },
  "security/has-injection-defense": {
    impact: "Without injection defense, anyone in a group chat can say \"ignore all previous instructions and...\" to hijack your agent. This is the most common attack vector for AI agents in production.",
  },
  "consistency/referenced-files-exist": {
    impact: "Referencing a file that doesn't exist (\"see BOOTSTRAP.md\") creates a broken link the agent can't follow. It may hallucinate the contents or silently skip the instruction, both leading to unpredictable behavior.",
  },
  "completeness/has-identity": {
    impact: "Without a defined identity, the agent defaults to a generic assistant persona. A consistent personality (tone, name, behavior patterns) makes the agent more predictable and the user experience more cohesive.",
  },
  "completeness/has-boundaries": {
    impact: "An agent without boundaries will attempt anything it's asked to do. Defined boundaries (\"never send emails without confirmation\") prevent catastrophic mistakes and build trust.",
  },
};
