git-secret-scanner
=====================



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g git-secret-scanner
$ git-secret-scanner COMMAND
running command...
$ git-secret-scanner (-v|--version|version)
git-secret-scanner/0.1.0 darwin-x64 node-v12.14.1
$ git-secret-scanner --help [COMMAND]
USAGE
  $ git-secret-scanner COMMAND
  ...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`git-secret-scanner scan DIR`](#git-secret-scanner-scan)
* [`git-secret-scanner help [COMMAND]`](#git-secret-scanner-help-command)

## `git-secret-scanner scan DIR`

describe the command here

```
USAGE
  $ git-secret-scanner scan DIR

ARGUMENTS
  DIR   the directory path to scan

EXAMPLE
  $ git-secret-scanner scan /var/src/my-repo
  info: [ AWS_SECRET_ACCESS_KEY ] found AWS_SECRET_ACCESS_KEY=[redacted] in .env on line 198
  info: [ AWS_ACCESS_KEY_ID ] found [redacted] in .env on line 42
```
