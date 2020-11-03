import { Command, flags } from "@oclif/command";

import { run } from "../lib/scanner";

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
    await run({
      rootDirectory: flags.dir || ".",
      redactValues: flags.redact,
      fetchRemotes: flags.pull,
    });
  }
}
