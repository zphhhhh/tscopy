import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import minimatch from 'minimatch';

export default function copy(cwd, source, target, ignore) {
  const tsconfigFile = path.resolve(source, 'tsconfig.json');
  const tsconfig = ts.getParsedCommandLineOfConfigFile(tsconfigFile, {}, ts.sys);

  const { fileNames, options: { baseUrl, paths } } = tsconfig;

  for (const pathsName of Object.keys(paths)) {
    paths[pathsName] = paths[pathsName].map(p => path.resolve(baseUrl, p));
  }

  const sourceFiles = findFiles(source);

  for (const file of sourceFiles) {
    if (ignore.some(ign => typeof ign === 'string' ? file.includes(ign) : ign.test(file))) {
      console.log('Ignored:', file);
      continue;
    }
    console.log('Copying:', file);
    if (fileNames.includes(file)) {
      processFile(file, source, target, tsconfig);
    } else {
      copyFileByContent(file, source, target);
    }
  }

  console.log('Done!');
}

function findFiles(root) {
  const files = [];
  const subFiles = fs.readdirSync(root);

  for (const filename of subFiles) {
    const file = path.resolve(root, filename);
    const fileStat = fs.statSync(file);

    if (fileStat.isFile()) {
      files.push(file);
    } else if (fileStat.isDirectory()) {
      const sub = findFiles(path.resolve(root, file));
      files.push(...sub);
    }
  }

  return files;
}

function processFile(file, source, target, tsconfig) {
  const filepath = path.dirname(file);
  const relative = path.relative(source, file);
  const targetFile = path.join(target, relative);
  const targetPath = path.dirname(targetFile);
  const content = fs.readFileSync(file, 'utf-8');
  const sourceFile = ts.createSourceFile(file, content);
  const { options: { baseUrl, paths, pathsBasePath } } = tsconfig;

  const pathsNames = Object.keys(paths);

  for (let i = 0; i < sourceFile.statements.length; i++) {
    const statement = sourceFile.statements[i];
    if (statement.kind === ts.SyntaxKind.ImportDeclaration) {
      const { text } = statement.moduleSpecifier;
      const foundPathsName = pathsNames.find(pathsName => minimatch(text, pathsName));
      if (foundPathsName) {
        let newModulePath = '';
        if (foundPathsName.endsWith('/*')) {
          // 1. tsconfig paths, and { "settlement/*": ["modules/settlement/src/*"] }
          const preText = text.slice(foundPathsName.slice(0, -1).length);
          const modulePaths = paths[foundPathsName].map(m => m.endsWith('/*') ? m.slice(0, -2) : m);
          const absModulePath = modulePaths.find(p => fileExists(path.resolve(p, preText)));
          newModulePath = path.relative(targetPath, path.resolve(absModulePath, preText));
        } else {
          // 1. tsconfig paths
          const modulePaths = paths[foundPathsName];
          const absModulePath = modulePaths.find(p => fileExists(p));
          newModulePath = path.relative(targetPath, absModulePath);

          if (newModulePath.includes('/node_modules/')) {
            if (newModulePath.includes('/@types/')) {
              continue;
            } else {
              newModulePath = newModulePath.slice(
                newModulePath.indexOf('/node_modules/') + '/node_modules/'.length,
              );
            }
          }
        }
        statement.moduleSpecifier.text = newModulePath;
      } else if (text.startsWith('.')) {
        // 2. ./  ../
        // // we do nothing
      } else if (fs.existsSync(path.resolve(baseUrl, text))) {
        // 3. baseUrl/
        let absModulePath = path.resolve(baseUrl, text);
        if (absModulePath.startsWith(source)) {
          absModulePath = path.resolve(target, path.relative(source, absModulePath))
        }
        const newModulePath = path.relative(targetPath, absModulePath);
        statement.moduleSpecifier.text = newModulePath;
      } else if (true) {
        // 3. node_modules
      }
    }
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    sourceFile.getSourceFile(),
    sourceFile.getSourceFile()
  );

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  fs.writeFileSync(targetFile, result);
}

function copyFileByContent(file, source, target) {
  const relative = path.relative(source, file);
  const targetFile = path.join(target, relative);
  const targetPath = path.dirname(targetFile);
  const content = fs.readFileSync(file);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  fs.writeFileSync(targetFile, content);
}

function fileExists(filename) {
  const ext = ['.ts', '.tsx', '.js', '.jsx'];
  if (!fs.existsSync(filename)) {
    const fullnames = ext.map(e => filename + e);
    return fullnames.some(name => fs.existsSync(name));
  }
  return true;
}
