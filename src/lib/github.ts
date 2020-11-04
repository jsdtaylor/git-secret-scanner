import { Octokit } from "@octokit/rest";

import { ScanContext } from "./scanner";

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

export const orgRepoUrls = async (
  ctx: ScanContext,
  org: string
): Promise<string[]> => {
  ctx.log.info(`listing repositories for https://github.com/${org}`);
  return octokit
    .paginate(octokit.repos.listForOrg, {
      org,
    })
    .then((data) =>
      data.map((repo) => {
        ctx.log.debug(`found repo ${repo.url}`);
        return repo.clone_url;
      })
    )
    .catch((e) => {
      ctx.log.error(e);
      throw e;
    });
};
