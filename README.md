git-secret-scanner
=====================

[![npm version](https://badge.fury.io/js/git-secret-scanner.svg)](https://badge.fury.io/js/git-secret-scanner) ![Codecov](https://img.shields.io/codecov/c/github/jsdtaylor/git-secret-scanner)

* [Installation](#installation)
* [Commands](#commands)

# Installation

```sh-session
$ yarn global add git-secret-scanner
```

# Commands

* [`git-secret-scanner scan DIR`](#git-secret-scanner-scan)

## `git-secret-scanner scan DIR`

Scans local git repositories for committed secrets

```
USAGE
  $ git-secret-scanner scan [DIR]

OPTIONS
  -d, --dir=dir  directory to scan (current directory if omitted)
  -h, --help     show CLI help
  -p, --pull     pull from repositories
  -r, --redact   redact all matched secret strings

EXAMPLE
  $ git-secret-scanner scan -d ~/code/github.com/my-org -r
  info: [ AWS_SECRET_ACCESS_KEY ] in .env on line 198
  info: [ AWS_ACCESS_KEY_ID ] in .env on line 42
```
