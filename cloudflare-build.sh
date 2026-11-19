#!/bin/sh
set -eu
rm -rf dist
mkdir -p dist
cp index.html 404.html sw.js _headers _redirects dist/
cp -R sorla dist/sorla
