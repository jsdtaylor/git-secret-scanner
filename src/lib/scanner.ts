import * as path from "path";
import * as fs from "fs";
import { Commit, Cred, Blame, Repository, TreeEntry } from "nodegit";

import log from "../lib/log";
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
  rootDirectory: string;
  redactValues: boolean;
  fetchRemotes: boolean;
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
    log.debug(`[!] found ${matches.length} matches for ${ruleType}`);
    const blame = Blame.file(ctx.currentRepo, entry.path());
    for (const matched of matches) {
      if (rule.antipattern !== undefined && rule.antipattern.test(matched)) {
        log.debug(`match excluded by antipattern rule ${rule.antipattern}`);
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
            log.warn(
              `tried to blame but the related commit ${blameCommitId} has been deleted`
            );
          }
          const finding: ScanResultFinding = {
            ruleType,
            detail: `${valuePart}in ${entry.toString()} on line ${lineNumber}`,
            blame: blameFinding,
          };
          ctx.result?.findings.push(finding);
          log.warn(
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
  log.debug(`checking ${ctx.currentPath}/${entry.toString()}...`);
  let blob;
  try {
    blob = await entry.getBlob();
  } catch (e) {
    log.debug("no blob data");
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
    log.error(e);
  }
};

const openRepo = async (dir: string): Promise<Repository> => {
  try {
    return await Repository.open(path.resolve(dir));
  } catch (e) {
    log.error("failed to open repository");
    throw e;
  }
};

const fetchAll = async (repo: Repository): Promise<void> =>
  await repo.fetchAll({
    callbacks: {
      certificateCheck: (): number => 0,
      credentials: (_url: string, user: string): Cred => {
        log.debug(`fetching from ${_url}`);
        return Cred.sshKeyFromAgent(user);
      },
    },
  });

const latestCommit = async (repo: Repository): Promise<Commit> => {
  try {
    return await repo.getHeadCommit();
  } catch (e) {
    log.error("failed to get latest HEAD commit");
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
  log.info(`scanning ${dir}`);
  try {
    ctx.currentRepo = await openRepo(dir);
    ctx.currentPath = dir;
    if (ctx.fetchRemotes) {
      log.info("fetching from remotes...");
      await fetchAll(ctx.currentRepo);
    }
    const commit = await latestCommit(ctx.currentRepo);
    const branchName = (await ctx.currentRepo.getCurrentBranch()).shorthand();
    log.info(`analysing files at commit ${commit.toString()} (${branchName})`);
    const tree = await commit.getTree();
    await checkTreeEntries(ctx, tree.entries());
  } catch (e) {
    log.warn("directory not scanned - check debug log for details");
    log.debug(e);
  }
};

export const run = async (ctx: ScanContext): Promise<void> => {
  try {
    const resolvedDir = path.resolve(ctx.rootDirectory);

    // get a handle on the .git directory
    const gitDir = path.resolve(resolvedDir, ".git");

    log.info(`SCAN STARTED: ${resolvedDir}`);
    log.debug(`checking for ${gitDir}`);

    // initialise result
    ctx.result = { findings: [] };

    // is this a git repo?
    if (!fs.existsSync(gitDir)) {
      // not a git repo, iterate directories
      log.debug(`${resolvedDir} is not a git repo, digging...`);
      const files = await fs.promises.readdir(resolvedDir);
      for (const file of files) {
        const fullPath = path.resolve(resolvedDir, file);
        const stat = await fs.promises.stat(fullPath);
        if (stat.isDirectory()) await scanRepoDir(ctx, fullPath);
      }
    } else await scanRepoDir(ctx, resolvedDir);
  } catch (e) {
    log.error(e, "SCAN FAILED");
    throw e;
  }

  log.info(`SCAN COMPLETE (found ${ctx.result.findings.length} issues)`);
};
