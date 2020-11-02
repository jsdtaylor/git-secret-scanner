export enum RuleType {
  AWS_ACCESS_KEY_ID = "AWS_ACCESS_KEY_ID",
  AWS_SECRET_ACCESS_KEY = "AWS_SECRET_ACCESS_KEY",
  PASSWORD = "PASSWORD",
}
export type Rule = {
  name: string;
  pattern: RegExp;
  filterEntry?: RegExp;
};
export type Rules = Partial<Record<RuleType, Rule>>;

/**
 * Rule definitions
 */

export const rules: Rules = {
  AWS_ACCESS_KEY_ID: {
    name: "AWS Access Key ID",
    pattern: /((?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})/g,
  },
  AWS_SECRET_ACCESS_KEY: {
    name: "AWS Secret Access Key",
    pattern: /((?:\"|')?(?:AWS|aws|Aws)?_?(?:SECRET|secret|Secret)_?(?:ACCESS|access|Access)?_?(?:KEY|key|Key)(?:\"|')?\s*(?::|=>|=)\s*(?:\"|')?[A-Za-z0-9/\+=]{40}(?:\"|')?)/g,
  },
  PASSWORD: {
    name: "Password",
    pattern: /((?:password|_pass|_pw)\s*(?::|=>|=)\s*[^\s]+)/gi,
    filterEntry: /.*\.ini/i,
  },
};
