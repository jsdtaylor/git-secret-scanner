import { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } from "fs";
import * as tempy from "tempy";
import { Clone, Cred } from "nodegit";

import { ScanContext } from "./scanner";

export const tempDir = (): string => tempy.directory();
export const rmDirSync = (path: string): void => {
  if (existsSync(path)) {
    readdirSync(path).forEach((file) => {
      const curPath = path + "/" + file;
      if (lstatSync(curPath).isDirectory()) {
        // recurse
        rmDirSync(curPath);
      } else {
        // delete file
        unlinkSync(curPath);
      }
    });
    rmdirSync(path);
  }
};

export const clone = async (ctx: ScanContext, url: string): Promise<void> => {
  const urlParts = url.split("/");
  const cloneDir = `${ctx.rootDirectory}/${urlParts[
    urlParts.length - 1
  ].replace(".git", "")}`;
  ctx.log.debug(`cloning ${url} to ${cloneDir}`);
  await Clone.clone(url, cloneDir, {
    fetchOpts: {
      callbacks: {
        certificateCheck: (): number => 1,
        credentials: (): Cred =>
          Cred.userpassPlaintextNew(
            process.env.GITHUB_ACCESS_TOKEN || "",
            "x-oauth-basic"
          ),
      },
    },
  });
};
