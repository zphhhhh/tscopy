#!/usr/bin/env node

import tscopy from '../index.js';

function main(src, tar, ...others) {
  const options = others.reduce((pre, o) => {
    const [key, value] = o.split('=');

    switch (key.slice(2)) {
      case 'ignore':
        pre['ignore'] = value.split('=')[1];
        break;
    }

    return pre;
  }, {});

  tscopy({
    source: src,
    target: tar,
    ...options,
  });
}

main(...process.argv.slice(2))