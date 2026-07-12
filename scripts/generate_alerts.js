const fs = require('fs');
const path = require('path');
const toml = require('@iarna/toml');

const alertsDir = path.join(__dirname, '..', 'src', 'alerts');
const outputFile = path.join(__dirname, '..', 'src', 'Alerts.js');

const files = fs.readdirSync(alertsDir).filter(file => file.endsWith('.toml'));

const alerts = files.map(file =>
{
	const filePath = path.join(alertsDir, file);
	const content = fs.readFileSync(filePath, 'utf-8').replace(/ \\ /g, ' \\\\ ');
	const parsed = toml.parse(content);
	const sheetName = 'Alert-' + path.basename(file, '.toml');
	return { name: path.basename(file, '.toml'), sheetName, ...parsed };
});

function generateMasterFormula(alerts)
{
	const parts = alerts.map(alert =>
	{
		const messageParts = alert.message.split(/(\$\d+)/g).map(part => {
			if (part.startsWith('$')) {
				const colIndex = parseInt(part.substring(1));
				return `INDEX(data; r; ${colIndex})`;
			}
			return `"${part.replace(/"/g, '""')}"`;
		});
		const formulaMessage = messageParts.join(' & ');

		return `LET(
			data; '${alert.sheetName}'!$A$2:$Z;
			validRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));
			HSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; "${alert.name}")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; ${formulaMessage})))
		)`;
	});

	// Stack and remove errors
	return `=QUERY(VSTACK(${parts.join('; ')}); "where Col2 is not null order by Col2 asc, Col1 asc")`;
}

const masterFormula = generateMasterFormula(alerts);

const outputContent = `function getAlerts()
{
	return ${JSON.stringify(alerts, null, '\t')};
}

function getMasterFormula()
{
	return "${masterFormula.replace(/"/g, '""')}";
}
`;

fs.writeFileSync(outputFile, outputContent);
console.log(`Generated ${outputFile} with ${alerts.length} alerts and master formula.`);
