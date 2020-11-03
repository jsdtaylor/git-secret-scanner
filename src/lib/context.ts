import { Repository } from "nodegit";

import { RuleType } from "./rules";

export type BlameFinding = { author: { email: string }; commit: string; date: Date } | undefined;
export type Finding = {
  ruleType: RuleType;
  detail: string;
  blame?: BlameFinding;
};
export type Summary = { findings: Finding[] };
export type ScanContext = { currentRepo?: Repository; currentPath?: string; summary?: Summary };
