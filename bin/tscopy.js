#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import copy from '../lib/copy.js';

function main(src, tar, ign) {
  if (!src || !tar) {
    console.log('usage: tsmove source target [--ignore=node_modules]');
    return;
  }

  const cwd = process.cwd();
  const source = path.resolve(cwd, src);
  const target = path.resolve(cwd, tar);
  const tsconfigFile = path.resolve(source, 'tsconfig.json');
  let ignore = ['node_modules'];

  if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
    console.log('usage: tsmove source target [--ignore=node_modules]');
    return;
  }

  if (!fs.statSync(tsconfigFile).isFile()) {
    console.log("The source should be a ts project, but I couldn't find the tsconfig.json");
  }

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  if (ign) {
    ignore = ign.split('=')[1].split(',');
  }

  const tsconfig = ts.getParsedCommandLineOfConfigFile(tsconfigFile, {}, ts.sys);

  const { baseUrl, paths } = tsconfig.options;

  for (const pathsName of Object.keys(paths)) {
    paths[pathsName] = paths[pathsName].map(p => path.resolve(baseUrl, p));
  }

  copy(cwd, source, target, tsconfig, ignore);
}

main(...process.argv.slice(2))