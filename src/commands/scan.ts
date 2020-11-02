import * as path from "path";
import * as fs from "fs";
import { Command, flags } from "@oclif/command";
import * as nodegit from "nodegit";

import { rules, RuleType } from "../lib/rules";
import { Results } from "../lib/results";
import log from "../lib/log";

export default class Scan extends Command {
  static description = "describe the command here";

  static examples = ["$ git-secret-scanner scan"];

  static flags = {
    help: flags.help({ char: "h" }),
  };

  static args = [{ name: "dir" }];

  async run() {
    const { args } = (this.parse(Scan) as unknown) as { args: { dir: string } };

    const check = async (
      entry: nodegit.TreeEntry,
      blobString: string,
      ruleType: RuleType
    ) => {
      const rule = rules[ruleType];
      const matches = blobString.match(rule!.pattern);
      if (matches && matches.length > 0) {
        log.debug(`[!] found ${matches.length} matches for ${ruleType}`);
        matches.forEach((matched) => {
          blobString.split("\n").forEach((line, i) => {
            if (line.includes(matched)) {
              const result = {
                ruleType,
                detail: `found ${matched} in ${entry.toString()} on line ${
                  i + 1
                }`,
              };
              log.warn(`[ ${result.ruleType} ] ${result.detail}`);
            }
          });
        });
      }
    };

    const testEntry = async (entry: nodegit.TreeEntry) => {
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

    const scanRepoDir = async (dir: string) => {
      log.info(`scanning ${dir}...`);
      try {
        const repo = await nodegit.Repository.open(path.resolve(dir));
        const commit = await repo.getMasterCommit();
        log.info(`analysing files at commit ${commit.toString()}`);
        const tree = await commit.getTree();
        for (const entry of tree.entries()) await testEntry(entry);
      } catch (e) {
        log.warn("directory not scanned - check debug log for details")
        log.debug(e);
      }
    };

    try {
      // is this a git repo?
      const resolvedDir = path.resolve(args.dir);
      const gitDir = path.resolve(resolvedDir, ".git");
      log.info(`SCAN STARTED: ${resolvedDir}`);
      log.debug(`checking for ${gitDir}`);
      if (!fs.existsSync(gitDir)) {
        // not a git repo, iterate directories
        log.debug(`${resolvedDir} is not a git repo, digging...`);
        const files = await fs.promises.readdir(resolvedDir);
        for (const file of files) {
          const fullPath = path.resolve(args.dir, file);
          const stat = await fs.promises.stat(fullPath);
          if (stat.isDirectory()) await scanRepoDir(fullPath);
        }
      }
    } catch (e) {
      log.error(e, "SCAN FAILED");
      this.exit(1);
    }
    log.info("SCAN COMPLETE");
  }
}
