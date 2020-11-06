import { Command, flags } from "@oclif/command";
import { Presets, SingleBar } from "cli-progress";

import { clone, rmDirSync, tempDir } from "../lib/cloner";
import { orgRepoUrls } from "../lib/github";
import { createLogger } from "../lib/log";
import { run } from "../lib/scanner";

export default class Scan extends Command {
  static description = "scans local git repositories for committed secrets";

  static examples = ["$ git-secret-scanner scan ~/code/github.com/my-org -r"];

  static flags = {
    help: flags.help({ char: "h" }),
    dir: flags.string({
      char: "d",
      description: "directory to scan (current direction if omitted)",
      exclusive: ["url"],
    }),
    redact: flags.boolean({
      char: "r",
      description: "redact all matched secret strings",
    }),
    githubOrgName: flags.string({
      char: "g",
      description: "clone all repositories from this GitHub org",
      exclusive: ["dir"],
    }),
    createLogFiles: flags.boolean({
      char: "l",
      description: "create log files",
    }),
    outputDir: flags.string({
      char: "o",
      description: "output directory (log files)",
    }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Scan);

    const log = createLogger(flags.createLogFiles, flags.outputDir);

    if (flags.githubOrgName) {
      // create a temp directory to clone into
      const cloneDir = tempDir();

      // set the scan context
      const ctx = {
        log,
        rootDirectory: cloneDir,
        redactValues: flags.redact,
      };

      // clone all organisation repositories
      const repos = await orgRepoUrls(ctx, flags.githubOrgName);
      log.info(`cloning ${repos.length} repositories`);
      let cloned = 0;
      const cloneFailures = [];
      const progress = new SingleBar({}, Presets.shades_classic);
      progress.start(repos.length, 0);
      for (const repo of repos) {
        try {
          await clone(ctx, repo);
          cloned++;
          progress.update(cloned);
        } catch (e) {
          log.debug(`cloning failed for ${repo}`, e);
          cloneFailures.push(repo);
        }
      }
      progress.stop();
      cloneFailures.forEach((failure) =>
        log.error(`failed to clone ${failure}`)
      );
      log.info(`cloned ${cloned} of ${repos.length} repositories`);

      // run a scan on all repositories in the temp directory
      await run(ctx);

      // we don't need this temp directory anymore
      rmDirSync(cloneDir);

      return;
    }

    await run({
      log,
      rootDirectory: flags.dir || ".",
      redactValues: flags.redact,
    });
  }
}
