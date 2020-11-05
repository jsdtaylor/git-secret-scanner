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
  -g, --githubOrgName=githubOrgName  clone all repositories from this GitHub org
  -h, --help                         show CLI help
  -l, --createLogFiles               create log files
  -o, --outputDir=outputDir          output directory (log files)
  -r, --redact                       redact all matched secret strings

EXAMPLE
  $ git-secret-scanner scan -rlo ~/logs -d ~/code/github.com/my-org
  info: [ AWS_SECRET_ACCESS_KEY ] in .env on line 198
  info: [ AWS_ACCESS_KEY_ID ] in .env on line 42
```

# Logs

Logs are written to the console and, when the `--createLogFiles` flag is set, to a timestamp-named log file in the current directory.

To enable debug logs, set the `LOG_LEVEL` env var to `debug`.
