#!/bin/sh
set -eu
rm -rf dist
mkdir -p dist
cp index.html legal.html privacy.html terms.html manifest.json sw.js lra-icon.svg lra-brand-mark.svg ops-pin.html ops-options.html dist/
cp -R assets dist/assets
