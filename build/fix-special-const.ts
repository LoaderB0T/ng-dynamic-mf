const fs = require('fs');

const srcPath = `${__dirname}/loaded-modules.d.ts`;
const destPath = `${__dirname}/../dist/lib/module-loading/loaded-modules.d.ts`;

const content = fs.readFileSync(srcPath, 'utf8');
if (!fs.existsSync(destPath)) {
  throw new Error('Destination file does not exist (did the path change?)');
}
fs.writeFileSync(destPath, content);
