const fs = require('fs');
const path = './src/components/Navbar.tsx';
let code = fs.readFileSync(path, 'utf8');

// Container fixes
code = code.replace(/bg-slate-900\/90/g, 'bg-white');
code = code.replace(/border-slate-800\/60/g, 'border-slate-200');
code = code.replace(/border-slate-800/g, 'border-slate-200');
code = code.replace(/text-slate-100/g, 'text-slate-900');
code = code.replace(/text-slate-200/g, 'text-slate-800');
code = code.replace(/text-slate-300/g, 'text-slate-600');
code = code.replace(/text-slate-400/g, 'text-slate-500');

// Hover states
code = code.replace(/hover:bg-slate-800\/60/g, 'hover:bg-slate-50 hover:text-slate-900');
code = code.replace(/hover:bg-slate-800/g, 'hover:bg-slate-50 hover:text-slate-900');

// Specific active link styles for light mode
code = code.replace(/bg-slate-800 text-white shadow-sm/g, 'bg-slate-900 text-white shadow-sm');
code = code.replace(/text-emerald-400/g, 'text-emerald-600');
code = code.replace(/text-cyan-400/g, 'text-blue-600');
code = code.replace(/bg-emerald-950\/50 text-emerald-200 border border-emerald-500\/40 shadow-sm/g, 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm');
code = code.replace(/bg-cyan-950\/50 text-cyan-200 border border-cyan-500\/40 shadow-sm/g, 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm');
code = code.replace(/bg-sky-950\/50 text-sky-200 border border-sky-500\/40/g, 'bg-slate-50 text-slate-800 border border-slate-200');
code = code.replace(/text-sky-400 hover:bg-sky-950\/30/g, 'text-slate-600 hover:bg-slate-50');
code = code.replace(/bg-amber-950\/50 text-amber-200 border border-amber-500\/40 shadow-sm/g, 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm');
code = code.replace(/text-amber-400 hover:bg-amber-950\/30/g, 'text-amber-600 hover:bg-amber-50');
code = code.replace(/bg-purple-950\/50 text-purple-200 border border-purple-500\/40 shadow-sm/g, 'bg-purple-50 text-purple-800 border border-purple-200 shadow-sm');
code = code.replace(/text-purple-400 hover:bg-purple-950\/30/g, 'text-purple-600 hover:bg-purple-50');
code = code.replace(/bg-red-950\/50 text-red-200 border border-red-500\/40 shadow-sm/g, 'bg-red-50 text-red-800 border border-red-200 shadow-sm');
code = code.replace(/text-red-400 hover:bg-red-950\/30/g, 'text-red-600 hover:bg-red-50');

// Mobile specific active classes
code = code.replace(/bg-amber-950\/60/g, 'bg-amber-50 text-amber-700');
code = code.replace(/bg-purple-950\/60/g, 'bg-purple-50 text-purple-700');
code = code.replace(/bg-red-950\/60/g, 'bg-red-50 text-red-700');
code = code.replace(/bg-sky-950\/60/g, 'bg-slate-100 text-slate-900');
code = code.replace(/bg-emerald-950\/60/g, 'bg-emerald-50 text-emerald-700');
code = code.replace(/bg-cyan-950\/60/g, 'bg-blue-50 text-blue-700');
code = code.replace(/border-emerald-500\/30/g, 'border-emerald-200');
code = code.replace(/border-cyan-500\/30/g, 'border-blue-200');
code = code.replace(/text-emerald-300/g, 'text-emerald-700');
code = code.replace(/text-cyan-300/g, 'text-blue-700');

// Fix dropdown menu
code = code.replace(/bg-slate-900 border-slate-700/g, 'bg-white border-slate-200 shadow-xl');
code = code.replace(/border-slate-800/g, 'border-slate-200');
code = code.replace(/hover:bg-slate-800/g, 'hover:bg-slate-50');
code = code.replace(/text-slate-300/g, 'text-slate-700');
code = code.replace(/text-white/g, 'text-slate-900');

// Dropdown hover items
code = code.replace(/hover:bg-slate-800/g, 'hover:bg-slate-50');
code = code.replace(/text-red-400/g, 'text-red-600');

fs.writeFileSync(path, code);
console.log('Navbar patched successfully.');
