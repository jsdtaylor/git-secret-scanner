import { expect, test } from "@oclif/test";

describe("scan", () => {
  test
    .stdout()
    .command(["scan", "-p"])
    .it("fetches remotes then scans the current directory", (ctx) => {
      expect(ctx.stdout).to.contain("fetching from remotes...");
      expect(ctx.stdout).to.contain("[ AWS_ACCESS_KEY_ID ]");
      expect(ctx.stdout).to.contain("[ PASSWORD ]");
    });
  test
    .stdout()
    .command(["scan", "-r"])
    .it("redacts secrets", (ctx) => {
      expect(ctx.stdout).to.not.contain("AKIAIOSFODNN7EXAMPLE");
      expect(ctx.stdout).to.not.contain("mypassword");
    });
});
