#!/usr/bin/env node

const optionDefinitions = {
  boolean: ["show-body", "json-output"],
};

const minimist = require("minimist");
const argv = minimist(process.argv.slice(2), optionDefinitions);
const opts = require("./opts")(argv);

const pack = require("../package.json");
const httpstat = require("httpstat");
const reporter = require("./reporter");

const showHelp = () => {
  console.log(`
    ${pack.description}
    Usage: httpstat [options...] <url>
    options:
      -X, --method http method default GET
      -H, --header request header
      -d, --data request body
      -F, --form Specify HTTP multipart POST data
      -k, --insecure Allow connections to SSL sites without certs
      --json-output output response in json format
      --show-body Show response body
  `);
  process.exit(0);
};

if (opts.help) {
  showHelp();
} else if (opts.version) {
  console.log(pack.version);
  process.exit(0);
} else if (!opts.target) {
  showHelp();
}

const headers = opts.headers || [];
headers.push("x-vercel-debug-proxy-timing: 1");

httpstat(opts.target, opts.options, headers, opts.data, opts.formInputs)
  .then((results) => {
    const serverTiming = results.response.headers["server-timing"] || "";
    const timings = {};
    serverTiming
      .split(",")
      .map((part) => part.split(";dur="))
      .forEach((part) => console.log(part) || (timings[part[0]] = Number(part[1])));
    reporter(results, opts, timings);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
