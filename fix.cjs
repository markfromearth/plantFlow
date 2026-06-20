const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf8');

// The things that got changed from 's' to 'g' 
const replacements = [
  ['congt ', 'const '],
  ['Bookinger', 'Bookings'], // wait, earlier I saw Bookings -> Bookingg -> Bookinsrc...  wait no, "Booking, Booking"
  ['Excavatorg', 'Excavators'],
  ['categoryg', 'category'],
  ['noteg:', 'notes:'],
  ['gtatus', 'status'],
  ['accegs', 'access'],
  ['garah', 'sarah'],
  ['Joneg', 'Jones'],
  ['gtart', 'start'],
  ['timegtamp', 'timestamp'],
  ['totalCogt', 'totalCost'],
  ['falge', 'false'],
  ['Drivewayg', 'Driveways'],
  ['Foundationg', 'Foundations'],
  ['ub-base', 'sub-base'],
  ['emigsion', 'emission'],
  ['gite', 'site'],
  ['pathg', 'paths'],
  ['repairg', 'repairs'],
  ['Footpathg', 'Footpaths'],
  ['Scigsor', 'Scissor'],
  ['ingtallation', 'installation'],
  ['Warehouge', 'Warehouse'],
  ['Pugh', 'Push'],
  ['gmall', 'small'],
  ['Eventg', 'Events'],
  ['Trangformer', 'Transformer'],
  ['Indugtrial', 'Industrial'],
  ['Poligher', 'Polisher']
];

for (const [from, to] of replacements) {
  code = code.split(from).join(to);
}

// And finally update the image URLs!
code = code.replace(/\/src\/assets/g, ''); // just in case
code = code.replace(/g\.ts/g, 's.ts'); // wait, ignore this

// Wait, I can also just fix "gite" to "site", "gtart" to "start", etc.
code = code.replace(/gite_/g, 'site_');
code = code.replace(/gtart_/g, 'start_');
code = code.replace(/timegtamp_/g, 'timestamp_');
code = code.replace(/totalCogt/g, 'totalCost');
code = code.replace(/falge/g, 'false');
code = code.replace(/accegs/g, 'access');
code = code.replace(/gtatus/g, 'status');
code = code.replace(/noteg: /g, 'notes: ');
code = code.replace(/congt /g, 'const ');
code = code.replace(/Excavatorg/g, 'Excavators');
code = code.replace(/Dumperg/g, 'Dumpers');
code = code.replace(/Accegs/g, 'Access');

fs.writeFileSync('src/mockData.ts', code);
