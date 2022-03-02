const fs = require('fs');

const content = fs.readFileSync(`${__dirname}/loaded-modules.d.ts`, 'utf8');
fs.writeFileSync(`${__dirname}/../dist/lib/loaded-modules.d.ts`, content);
