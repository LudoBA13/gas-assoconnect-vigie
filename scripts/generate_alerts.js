const fs = require('fs');
const path = require('path');
const toml = require('@iarna/toml');

const alertsDir = path.join(__dirname, '..', 'src', 'alerts');
const outputFile = path.join(__dirname, '..', 'src', 'alerts.js');

const files = fs.readdirSync(alertsDir).filter(file => file.endsWith('.toml'));

const alerts = files.map(file => {
    const filePath = path.join(alertsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8').replace(/ \\ /g, ' \\\\ ');
    const parsed = toml.parse(content);
    // Add the filename as a key/id if needed, or just include the parsed object
    return parsed;
});

const outputContent = `const alerts = ${JSON.stringify(alerts, null, 2)};\n\nmodule.exports = alerts;`;

fs.writeFileSync(outputFile, outputContent);
console.log(`Generated ${outputFile} with ${alerts.length} alerts.`);
