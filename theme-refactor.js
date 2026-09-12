const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { from: /bg-slate-950/g, to: 'bg-slate-50' },
  { from: /bg-slate-900/g, to: 'bg-white' },
  { from: /border-slate-800\/50/g, to: 'border-slate-200/50' },
  { from: /border-slate-800\/80/g, to: 'border-slate-200/80' },
  { from: /border-slate-800/g, to: 'border-slate-200' },
  { from: /text-slate-200/g, to: 'text-slate-800' },
  { from: /text-slate-300/g, to: 'text-slate-700' },
  { from: /text-slate-400/g, to: 'text-slate-500' },
  { from: /text-slate-500/g, to: 'text-slate-400' },
  { from: /text-white/g, to: 'text-slate-900' },
  { from: /bg-slate-800\/50/g, to: 'bg-slate-100/50' },
  { from: /bg-slate-800/g, to: 'bg-slate-100' },
  { from: /hover:bg-slate-700/g, to: 'hover:bg-slate-200' },
  { from: /hover:bg-slate-800/g, to: 'hover:bg-slate-100' },
  { from: /bg-slate-950\/50/g, to: 'bg-slate-50/50' },
  { from: /bg-slate-950\/80/g, to: 'bg-slate-50/80' },
  { from: /text-slate-950/g, to: 'text-white' }, // for inverted badges like the Bot icon
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      for (const r of replacements) {
        content = content.replace(r.from, r.to);
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done!');
