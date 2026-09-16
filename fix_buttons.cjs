const fs = require('fs');

const filesToPatch = [
  './src/components/MessagingHubView.tsx',
  './src/components/CryptoLedgerView.tsx',
  './src/components/SellerDashboard.tsx',
  './src/components/MarketplaceView.tsx'
];

filesToPatch.forEach(path => {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf8');

  // Fix buttons that might have been changed to text-slate-900 when they should be white
  code = code.replace(/text-slate-900 font-bold/g, 'text-slate-900 font-bold');
  code = code.replace(/bg-emerald-600 hover:bg-emerald-700 text-slate-900/g, 'bg-emerald-600 hover:bg-emerald-700 text-white');
  code = code.replace(/bg-blue-600 hover:bg-blue-700 text-slate-900/g, 'bg-blue-600 hover:bg-blue-700 text-white');
  code = code.replace(/text-slate-900/g, 'text-slate-900'); // No-op, just making sure general text is dark

  fs.writeFileSync(path, code);
});
console.log("Buttons fixed.");
