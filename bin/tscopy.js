#!/usr/bin/env node

import tscopy from '../index.js';

function main(src, tar, ign = '--ignore=node_modules') {
  tscopy({
    source: src,
    target: tar,
    ignore: ign.split('=')[1]
  });
}

main(...process.argv.slice(2))