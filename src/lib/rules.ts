export enum RuleType {
  API_KEY = "API_KEY",
  API_TOKEN = "API_TOKEN",
  AWS_ACCESS_KEY_ID = "AWS_ACCESS_KEY_ID",
  AWS_SECRET_ACCESS_KEY = "AWS_SECRET_ACCESS_KEY",
  PASSWORD = "PASSWORD",
}
export type Rule = {
  name: string;
  pattern: RegExp;
  antipattern?: RegExp;
  filterEntry?: RegExp;
};
export type Rules = Partial<Record<RuleType, Rule>>;

/**
 * Rule definitions
 */

export const rules: Rules = {
  API_KEY: {
    name: "API key",
    pattern: /((?:"|')?\S*(?:API_KEY)\S*(?:"|')?\s*(?::|=>|=)\s*(?:"|')?.*(?:"|')?)/gm,
    // .ini and .env files
    filterEntry: /.*\.ini|\.env.*/i,
  },
  API_TOKEN: {
    name: "API token",
    pattern: /((?:"|')?\S*(?:API_TOKEN)\S*(?:"|')?\s*(?::|=>|=)\s*(?:"|')?.*(?:"|')?)/gm,
    // .ini and .env files
    filterEntry: /.*\.ini|\.env.*/i,
  },
  AWS_ACCESS_KEY_ID: {
    name: "AWS Access Key ID",
    pattern: /((?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})/gm,
    // the word "EXAMPLE"
    antipattern: /.*EXAMPLE.*/,
  },
  AWS_SECRET_ACCESS_KEY: {
    name: "AWS Secret Access Key",
    pattern: /((?:"|')?(?:aws)?_?(?:secret)_?(?:access)?_?(?:key)(?:"|')?\s*(?::|=>|=)\s*(?:"|')?[a-z0-9/+=]{40}(?:"|')?)/gim,
    // the word "example"
    antipattern: /.*example.*/i,
  },
  PASSWORD: {
    name: "Password",
    pattern: /^(.*(?:password|_pass|_pw)[^\S\r\n]*(?::|=>|=)[^\S\r\n]*(?:(?!""|''|null).)+)/gim,
    // .ini and .env files
    filterEntry: /.*\.ini|\.env.*/i,
    // the word "secret" and commented .ini lines
    antipattern: /.*(?:"|')?secret(?:"|')?$|^[;#].*/i,
  },
};
