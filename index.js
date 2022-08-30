import copy from './lib/copy.js';

/**
 * tscopy
 * @param {Object} option
 * @param {string} option.source source directory
 * @param {string} option.target target directory
 * @param {string | (string | RegExp)[]} option.ignore `node_modules,package.json` | `['node_modules', /package\.json$/]`
 * @returns
 */
export default function tscopy({
  source, target, ignore
}) {
  if (!source || !target) {
    console.log('usage: tsmove source target [--ignore=node_modules]');
    return;
  }

  const cwd = process.cwd();
  const finalSource = path.resolve(cwd, source);
  const finalTarget = path.resolve(cwd, target);
  const tsconfigFile = path.resolve(source, 'tsconfig.json');

  if (!fs.existsSync(finalSource) || !fs.statSync(finalSource).isDirectory()) {
    console.log('usage: tsmove source target [--ignore=node_modules]');
    return;
  }

  if (!fs.statSync(tsconfigFile).isFile()) {
    console.log("The source should be a ts project, but I couldn't find the tsconfig.json");
  }

  if (!fs.existsSync(finalTarget)) {
    fs.mkdirSync(finalTarget, { recursive: true });
  }

  let finalIgnore = ['node_modules'];

  if (ignore) {
    if (typeof ignore === 'string') {
      finalIgnore = ignore.split(',');
    } else {
      finalIgnore = ignore;
    }
  }

  copy(cwd, finalSource, finalTarget, finalIgnore);
}