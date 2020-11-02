github-secret-scanner
=====================



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g github-secret-scanner
$ github-secret-scanner COMMAND
running command...
$ github-secret-scanner (-v|--version|version)
github-secret-scanner/0.1.0 darwin-x64 node-v12.14.1
$ github-secret-scanner --help [COMMAND]
USAGE
  $ github-secret-scanner COMMAND
  ...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`github-secret-scanner scan DIR`](#github-secret-scanner-scan)
* [`github-secret-scanner help [COMMAND]`](#github-secret-scanner-help-command)

## `github-secret-scanner scan DIR`

describe the command here

```
USAGE
  $ github-secret-scanner scan DIR

ARGUMENTS
  DIR   the directory path to scan

EXAMPLE
  $ github-secret-scanner scan /var/src/my-repo
  info: [ AWS_SECRET_ACCESS_KEY ] found AWS_SECRET_ACCESS_KEY=[redacted] in .env on line 198
  info: [ AWS_ACCESS_KEY_ID ] found [redacted] in .env on line 42
```
