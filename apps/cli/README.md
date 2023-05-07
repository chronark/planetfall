<div align="center">
    <h1 align="center">@planetfall/cli</h1>
    <h5>Run global latency tests from your CLI</h5>
</div>

<div align="center">
  <a href="https://planetfall.io/play">https://planetfall.io/play</a>
</div>
<br/>

## Installation

```sh-session
$ npm install -g @planetfall/cli

$ planetfall ...
```

Or run globally with npx:

```sh-session
$ npx @planetfall/cli ...
```

## Usage

<!-- usage -->

```sh-session
$ npm install -g @planetfall/cli
$ planetfall COMMAND
running command...
$ planetfall (--version)
@planetfall/cli/0.1.1 darwin-arm64 node-v18.12.1
$ planetfall --help [COMMAND]
USAGE
  $ planetfall COMMAND
...
```

<!-- usagestop -->

```sh-session
$ planetfall check https://example.com

Checking... Done

Please visit the following URL to see the results:
https://planetfall.io/play/N3T4Ug8npBC
```

## Help

```sh-session
$ planetfall check --help

USAGE
  $ planetfall check [URL] [-m GET|POST|PUT|DELETE|PATCH] [-r] [--noopen]

FLAGS
  -m, --method=(GET|POST|PUT|DELETE|PATCH)  [default: GET] HTTP method
  -r, --repeat                              Repeat the check to similate a hot cache
  --noopen                                  Prevents your browser from being opened automatically

DESCRIPTION
  describe the command here

EXAMPLES
  $ planetfall check
```
