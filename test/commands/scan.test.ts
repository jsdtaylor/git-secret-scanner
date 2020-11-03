import { expect, test } from "@oclif/test";

describe("scan", () => {
  test
    .stdout()
    .command(["scan"])
    .it("scans the current directory", (ctx) => {
      expect(ctx.stdout).to.contain("[ PASSWORD ] found A_PASSWORD=\"mypassword\"");
      expect(ctx.stdout).to.contain("[ PASSWORD ] found MY_ENV_PASSWORD=\"super-secret-token\"");
      expect(ctx.stdout).to.contain("[ AWS_ACCESS_KEY_ID ] found AKIAIOSFODNN7OSFODNN");
    });
  test
    .stdout()
    .command(["scan", "-r"])
    .it("redacts secrets", (ctx) => {
      expect(ctx.stdout).to.not.contain("AKIAIOSFODNN7OSFODNN");
      expect(ctx.stdout).to.not.contain("mypassword");
    });
});
