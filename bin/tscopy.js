#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import copy from '../lib/copy.js';

function main(src, tar) {
  if (!src || !tar) {
    console.log('usage: tsmove source target');
    return;
  }

  const cwd = process.cwd();
  const source = path.resolve(cwd, src);
  const target = path.resolve(cwd, tar);
  const tsconfigFile = path.resolve(source, 'tsconfig.json');

  if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
    console.log('usage: tsmove source target');
    return;
  }

  if (!fs.statSync(tsconfigFile).isFile()) {
    console.log("The source should be a ts project, but I couldn't find the tsconfig.json");
  }

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const tsconfig = ts.getParsedCommandLineOfConfigFile(tsconfigFile, {}, ts.sys);

  const { baseUrl, paths } = tsconfig.options;

  for (const pathsName of Object.keys(paths)) {
    paths[pathsName] = paths[pathsName].map(p => path.resolve(baseUrl, p));
  }

  copy(cwd, source, target, tsconfig);
}

main(...process.argv.slice(2))