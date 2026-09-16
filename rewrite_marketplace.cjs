const fs = require('fs');
const path = './src/components/MarketplaceView.tsx';
let code = fs.readFileSync(path, 'utf8');

// Global backgrounds
code = code.replace(/bg-\[\#0b0f17\]/g, 'bg-slate-50');
code = code.replace(/bg-slate-900\/50/g, 'bg-white');
code = code.replace(/bg-slate-900/g, 'bg-white');
code = code.replace(/bg-slate-800\/50/g, 'bg-slate-50');
code = code.replace(/bg-slate-800/g, 'bg-slate-50');
code = code.replace(/bg-slate-950\/50/g, 'bg-white');
code = code.replace(/bg-\[\#0c101a\]/g, 'bg-slate-50');
code = code.replace(/bg-\[\#131a2a\]/g, 'bg-white');

// Borders
code = code.replace(/border-slate-800\/50/g, 'border-slate-200');
code = code.replace(/border-slate-800/g, 'border-slate-200');
code = code.replace(/border-slate-700/g, 'border-slate-300');
code = code.replace(/border-emerald-500\/30/g, 'border-emerald-200');
code = code.replace(/border-emerald-500\/20/g, 'border-emerald-200');
code = code.replace(/border-cyan-500\/30/g, 'border-blue-200');
code = code.replace(/border-sky-500\/30/g, 'border-sky-200');
code = code.replace(/border-sky-500\/20/g, 'border-sky-200');

// Text
code = code.replace(/text-slate-100/g, 'text-slate-900');
code = code.replace(/text-slate-200/g, 'text-slate-800');
code = code.replace(/text-slate-300/g, 'text-slate-700');
code = code.replace(/text-slate-400/g, 'text-slate-600');
code = code.replace(/text-slate-500/g, 'text-slate-500');

// Colors
code = code.replace(/text-emerald-400/g, 'text-emerald-700');
code = code.replace(/text-emerald-500/g, 'text-emerald-600');
code = code.replace(/bg-emerald-500\/10/g, 'bg-emerald-50');
code = code.replace(/text-cyan-400/g, 'text-blue-700');
code = code.replace(/bg-cyan-500\/10/g, 'bg-blue-50');
code = code.replace(/text-amber-400/g, 'text-amber-700');
code = code.replace(/bg-amber-500\/10/g, 'bg-amber-50');
code = code.replace(/text-sky-400/g, 'text-sky-700');
code = code.replace(/bg-sky-500\/10/g, 'bg-sky-50');

// Inputs
code = code.replace(/bg-slate-900\/80/g, 'bg-white');
code = code.replace(/placeholder-slate-500/g, 'placeholder-slate-400');
code = code.replace(/focus:border-emerald-500\/50/g, 'focus:border-emerald-500');

// Shadows
code = code.replace(/shadow-emerald-500\/10/g, 'shadow-sm');
code = code.replace(/shadow-emerald-500\/20/g, 'shadow-md');
code = code.replace(/shadow-2xl/g, 'shadow-xl');

// Button specific overrides if any text-white needs keeping
code = code.replace(/bg-emerald-500 hover:bg-emerald-600 text-black/g, 'bg-emerald-600 hover:bg-emerald-700 text-white');
code = code.replace(/text-white/g, 'text-white'); // ensure white remains white if used in explicit buttons

// Background gradients
code = code.replace(/bg-gradient-to-r from-emerald-500\/20 to-cyan-500\/20/g, 'bg-gradient-to-r from-slate-100 to-white');
code = code.replace(/bg-gradient-to-br from-slate-900 to-slate-800/g, 'bg-white');
code = code.replace(/bg-gradient-to-b from-slate-900\/50 to-transparent/g, 'bg-white');

fs.writeFileSync(path, code);
console.log('Marketplace patched successfully.');
