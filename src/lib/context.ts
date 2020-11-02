import { RuleType } from "./rules";

export type Finding = { ruleType: RuleType; detail: string };
export type Summary = { findings: Finding[] };
export type ScanContext = { summary?: Summary };
