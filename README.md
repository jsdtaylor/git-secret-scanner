# git-secret-scanner

[![npm version](https://badge.fury.io/js/git-secret-scanner.svg)](https://badge.fury.io/js/git-secret-scanner) [![Codecov](https://codecov.io/gh/jsdtaylor/git-secret-scanner/branch/main/graph/badge.svg?token=XJO4F5GUWL)](https://codecov.io/gh/jsdtaylor/git-secret-scanner)

- [Installation](#installation)
- [Commands](#commands)

# Installation

```sh-session
$ yarn global add git-secret-scanner
```

# Commands

- [`git-secret-scanner scan`](#git-secret-scanner-scan)

## `git-secret-scanner scan`

Scans local git repositories for committed secrets

```
USAGE
  $ git-secret-scanner scan [OPTIONS]

OPTIONS
  -d, --dir=dir                      directory to scan (current direction if omitted)
  -g, --githubOrgName=githubOrgName  clone all repositories from this GitHub org (requires GITHUB_ACCESS_TOKEN env var)
  -h, --help                         show CLI help
  -l, --createLogFiles               create log files
  -o, --outputDir=outputDir          output directory (log files)
  -r, --redact                       redact all matched secret strings

EXAMPLE
  $ git-secret-scanner scan -lo ~/logs -d ~/code/github.com/my-org
  2020-11-05T09:14:01.619Z [info] SCAN STARTED: ~/code/github.com/jsdtaylor/github-secret-scanner
  2020-11-05T09:14:01.620Z [info] scanning ~/code/github.com/jsdtaylor/github-secret-scanner
  2020-11-05T09:14:01.622Z [info] analysing files at commit 66f005f82edc4684559df25a74d859583572dd9f (main)
  2020-11-05T09:14:01.641Z [warn] (github-secret-scanner) [AWS_ACCESS_KEY_ID] found AKIAIOSFODNN7OSFODNN in test/commands/scan.test.ts on line 15 (f8e28a25a59d4e727f132f831fbb926ac68047cb by jsdtaylor@me.com at 2020-11-04T16:06:09.000Z)
  2020-11-05T09:14:01.641Z [warn] (github-secret-scanner) [AWS_ACCESS_KEY_ID] found AKIAIOSFODNN7OSFODNN in test/commands/scan.test.ts on line 22 (4f35f8a6d9234cdc3688e914ac52b3bf8a5c0012 by jsdtaylor@me.com at 2020-11-03T20:57:26.000Z)
```

# Logs

Logs are written to the console and, when the `--createLogFiles` flag is set, to a timestamp-named log file in the current directory.

To enable debug logs, set the `LOG_LEVEL` env var to `debug`.
