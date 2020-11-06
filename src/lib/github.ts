import { Octokit } from "@octokit/rest";

import { ScanContext } from "./scanner";

export const orgRepoUrls = async (
  ctx: ScanContext,
  org: string
): Promise<string[]> => {
  const auth = process.env.GITHUB_ACCESS_TOKEN;
  if (!auth)
    throw new Error(
      "you *must* set the GITHUB_ACCESS_TOKEN env var to clone from GitHub"
    );
  const { log } = ctx;
  const octokit = new Octokit({ auth, log });
  log.info(`listing repositories for https://github.com/${org}`);
  return octokit
    .paginate(octokit.repos.listForOrg, {
      org,
    })
    .then((data) =>
      data.map((repo) => {
        log.debug(`found repo ${repo.url}`);
        return repo.clone_url;
      })
    )
    .catch((e) => {
      log.error(e);
      throw e;
    });
};
