import * as path from "path";
import * as fs from "fs";
import { Commit, Blame, Repository, TreeEntry } from "nodegit";

import { Logger } from "../lib/log";
import { rules, RuleType } from "../lib/rules";

export type ScanResultFindingBlame =
  | { author: { email: string }; commit: string; date: Date }
  | undefined;
export type ScanResultFinding = {
  ruleType: RuleType;
  detail: string;
  blame?: ScanResultFindingBlame;
};
export type ScanResult = { findings: ScanResultFinding[] };
export type ScanContext = {
  log: Logger;
  rootDirectory: string;
  redactValues: boolean;
  currentRepo?: Repository;
  currentPath?: string;
  result?: ScanResult;
};

const check = async (
  ctx: ScanContext,
  entry: TreeEntry,
  blobString: string,
  ruleType: RuleType
): Promise<void> => {
  const rule = rules[ruleType];
  if (!rule || !ctx.currentRepo) return;
  const matches = blobString.match(rule.pattern);
  if (matches) {
    ctx.log.debug(`[!] found ${matches.length} matches for ${ruleType}`);
    const blame = await Blame.file(ctx.currentRepo, entry.path());
    for (const matched of matches) {
      if (rule.antipattern !== undefined && rule.antipattern.test(matched)) {
        ctx.log.debug(`match excluded by antipattern rule ${rule.antipattern}`);
        continue;
      }
      let lineNumber = 0;
      for (const line of blobString.split("\n")) {
        lineNumber++;
        if (line.includes(matched)) {
          const valuePart = ctx.redactValues ? "" : `found ${matched} `;
          let blameFinding: ScanResultFindingBlame = undefined;
          const blameHunk = (await blame).getHunkByLine(lineNumber);
          const blameCommitId = blameHunk.finalCommitId();
          try {
            const blameCommit = await ctx.currentRepo!.getCommit(blameCommitId);
            blameFinding = {
              commit: blameCommit.toString(),
              author: {
                email: blameCommit.committer().email(),
              },
              date: blameCommit.date(),
            };
          } catch (e) {
            ctx.log.warn(
              `tried to blame but the related commit ${blameCommitId} has been deleted`
            );
          }
          const finding: ScanResultFinding = {
            ruleType,
            detail: `${valuePart}in ${entry.toString()} on line ${lineNumber}`,
            blame: blameFinding,
          };
          ctx.result?.findings.push(finding);
          ctx.log.warn(
            `[ ${finding.ruleType} ] ${finding.detail}` +
              (finding.blame
                ? ` (${finding.blame.commit} by ${
                    finding.blame.author.email
                  } at ${finding.blame.date.toISOString()})`
                : "")
          );
        }
      }
    }
  }
};

const testEntry = async (ctx: ScanContext, entry: TreeEntry): Promise<void> => {
  ctx.log.debug(`checking ${ctx.currentPath}/${entry.toString()}...`);
  let blob;
  try {
    blob = await entry.getBlob();
  } catch (e) {
    ctx.log.debug("no blob data");
    return;
  }
  try {
    const blobString = blob.toString();
    for (const ruleType in rules) {
      const filterEntry = rules[ruleType as RuleType]?.filterEntry;
      if (!filterEntry || filterEntry.test(entry.toString()))
        await check(ctx, entry, blobString, ruleType as RuleType);
    }
  } catch (e) {
    ctx.log.error(e);
  }
};

const openRepo = async (ctx: ScanContext, dir: string): Promise<Repository> => {
  try {
    return await Repository.open(path.resolve(dir));
  } catch (e) {
    ctx.log.error("failed to open repository");
    throw e;
  }
};

const latestCommit = async (ctx: ScanContext): Promise<Commit> => {
  try {
    return await ctx.currentRepo!.getHeadCommit();
  } catch (e) {
    ctx.log.error("failed to get latest HEAD commit");
    throw e;
  }
};

const checkTreeEntries = async (
  ctx: ScanContext,
  entries: TreeEntry[]
): Promise<void> => {
  for (const entry of entries) {
    if (entry.isTree())
      await checkTreeEntries(ctx, (await entry.getTree()).entries());
    await testEntry(ctx, entry);
  }
};

const scanRepoDir = async (ctx: ScanContext, dir: string): Promise<void> => {
  ctx.log.info(`scanning ${dir}`);
  try {
    ctx.currentRepo = await openRepo(ctx, dir);
    ctx.currentPath = dir;
    const commit = await latestCommit(ctx);
    const branchName = (await ctx.currentRepo.getCurrentBranch()).shorthand();
    ctx.log.info(
      `analysing files at commit ${commit.toString()} (${branchName})`
    );
    const tree = await commit.getTree();
    await checkTreeEntries(ctx, tree.entries());
  } catch (e) {
    ctx.log.warn("directory not scanned - check debug log for details");
    ctx.log.debug(e);
  }
};

export const run = async (ctx: ScanContext): Promise<void> => {
  try {
    const resolvedDir = path.resolve(ctx.rootDirectory);

    // get a handle on the .git directory
    const gitDir = path.resolve(resolvedDir, ".git");

    ctx.log.info(`SCAN STARTED: ${resolvedDir}`);
    ctx.log.debug(`checking for ${gitDir}`);

    // initialise result
    ctx.result = { findings: [] };

    // is this a git repo?
    if (!fs.existsSync(gitDir)) {
      // not a git repo, iterate directories
      ctx.log.debug(`${resolvedDir} is not a git repo, digging...`);
      const files = await fs.promises.readdir(resolvedDir);
      for (const file of files) {
        const fullPath = path.resolve(resolvedDir, file);
        const stat = await fs.promises.stat(fullPath);
        if (stat.isDirectory()) await scanRepoDir(ctx, fullPath);
      }
    } else await scanRepoDir(ctx, resolvedDir);
  } catch (e) {
    ctx.log.error(e, "SCAN FAILED");
    throw e;
  }

  ctx.log.info(`SCAN COMPLETE (found ${ctx.result.findings.length} issues)`);
};
