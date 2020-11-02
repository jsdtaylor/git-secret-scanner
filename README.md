git-secret-scanner
=====================



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Installation](#installation)
* [Commands](#commands)
<!-- tocstop -->
# Installation
<!-- usage -->
```sh-session
$ yarn add -g git-secret-scanner
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`git-secret-scanner scan DIR`](#git-secret-scanner-scan)

## `git-secret-scanner scan DIR`

Scans local git repositories for committed secrets

```
USAGE
  $ git-secret-scanner scan [DIR]

OPTIONS
  -h, --help    show CLI help
  -p, --pull    pull from repositories
  -r, --redact  redact all matched secret strings

EXAMPLE
  $ git-secret-scanner scan ~/code/github.com/my-org -r
  info: [ AWS_SECRET_ACCESS_KEY ] in .env on line 198
  info: [ AWS_ACCESS_KEY_ID ] in .env on line 42
```
