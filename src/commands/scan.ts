import * as path from "path";
import * as fs from "fs";
import { Command, flags } from "@oclif/command";
import * as nodegit from "nodegit";

import { Finding, ScanContext } from "../lib/context";
import log from "../lib/log";
import { rules, RuleType } from "../lib/rules";

export default class Scan extends Command {
  static description = "scans local git repositories for committed secrets";

  static examples = ["$ git-secret-scanner scan ~/code/github.com/my-org -r"];

  static flags = {
    help: flags.help({ char: "h" }),
    dir: flags.string({
      char: "d",
      description: "directory to scan (current direction if omitted)",
    }),
    pull: flags.boolean({ char: "p", description: "pull from repositories" }),
    redact: flags.boolean({
      char: "r",
      description: "redact all matched secret strings",
    }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Scan);
    const ctx: ScanContext = { summary: { findings: [] } };

    const check = async (
      entry: nodegit.TreeEntry,
      blobString: string,
      ruleType: RuleType
    ): Promise<void> => {
      const rule = rules[ruleType];
      if (!rule) return;
      const matches = blobString.match(rule.pattern);
      if (matches && matches.length > 0) {
        log.debug(`[!] found ${matches.length} matches for ${ruleType}`);
        matches.forEach((matched) => {
          blobString.split("\n").forEach((line, i) => {
            if (line.includes(matched)) {
              const valuePart = flags.redact ? "" : `found ${matched} `;
              const finding: Finding = {
                ruleType,
                detail: `${valuePart}in ${entry.toString()} on line ${i + 1}`,
              };
              ctx.summary?.findings.push(finding);
              log.warn(`[ ${finding.ruleType} ] ${finding.detail}`);
            }
          });
        });
      }
    };

    const testEntry = async (entry: nodegit.TreeEntry): Promise<void> => {
      log.debug(`checking ${entry.toString()}...`);
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
            await check(entry, blobString, ruleType as RuleType);
        }
      } catch (e) {
        log.error(e);
      }
    };

    const openRepo = async (dir: string): Promise<nodegit.Repository> => {
      try {
        return await nodegit.Repository.open(path.resolve(dir));
      } catch (e) {
        log.error("failed to open repository");
        throw e;
      }
    };

    const fetchAll = async (repo: nodegit.Repository): Promise<void> =>
      await repo.fetchAll({
        callbacks: {
          certificateCheck: (): number => 0,
          credentials: (_url: string, user: string): nodegit.Cred => {
            log.debug(`fetching from ${_url}`);
            return nodegit.Cred.sshKeyFromAgent(user);
          },
        },
      });

    const latestCommit = async (
      repo: nodegit.Repository
    ): Promise<nodegit.Commit> => {
      try {
        return await repo.getHeadCommit();
      } catch (e) {
        log.error("failed to get latest HEAD commit");
        throw e;
      }
    };

    const checkTreeEntries = async (
      entries: nodegit.TreeEntry[]
    ): Promise<void> => {
      for (const entry of entries) {
        if (entry.isTree())
          await checkTreeEntries((await entry.getTree()).entries());
        await testEntry(entry);
      }
    };

    const scanRepoDir = async (dir: string): Promise<void> => {
      log.info(`scanning ${dir}`);
      try {
        const repo = await openRepo(dir);
        if (flags.pull) {
          log.info("fetching from remotes...");
          await fetchAll(repo);
        }
        const commit = await latestCommit(repo);
        const branchName = (await repo.getCurrentBranch()).shorthand();
        log.info(
          `analysing files at commit ${commit.toString()} (${branchName})`
        );
        const tree = await commit.getTree();
        await checkTreeEntries(tree.entries());
      } catch (e) {
        log.warn("directory not scanned - check debug log for details");
        log.debug(e);
      }
    };

    try {
      const resolvedDir = path.resolve(flags.dir || ".");

      // is this a git repo?
      const gitDir = path.resolve(resolvedDir, ".git");

      log.info(`SCAN STARTED: ${resolvedDir}`);
      log.debug(`checking for ${gitDir}`);

      if (!fs.existsSync(gitDir)) {
        // not a git repo, iterate directories
        log.debug(`${resolvedDir} is not a git repo, digging...`);
        const files = await fs.promises.readdir(resolvedDir);
        for (const file of files) {
          const fullPath = path.resolve(resolvedDir, file);
          const stat = await fs.promises.stat(fullPath);
          if (stat.isDirectory()) await scanRepoDir(fullPath);
        }
      } else await scanRepoDir(resolvedDir);
    } catch (e) {
      log.error(e, "SCAN FAILED");
      this.exit(1);
    }

    log.info(`SCAN COMPLETE (found ${ctx.summary?.findings.length} issues)`);
  }
}
