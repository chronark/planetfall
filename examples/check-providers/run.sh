#!/usr/bin/env bash

node check-providers.mjs crux-top1m-202102.csv 2>error.log | tee -a output-crux.csv
