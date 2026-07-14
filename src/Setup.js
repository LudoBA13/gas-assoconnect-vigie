function setUpSheets()
{
	setUpAlertSheets();
	setUpIndexSheet();
}

function setUpAlertSheets()
{
	createAlertSheets();
	removeUnusedAlertSheets();
	createAlertIndexSheet();
}

function setUpIndexSheet()
{
	createIndexSheet();
	updateIndexSheet();
}

function updateIndexSheet()
{
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName('Index');
	if (!sheet)
	{
		return;
	}

	const formula = generateMasterFormula();
	const a1Cell = sheet.getRange('A1');
	
	if (a1Cell.getFormula() !== formula)
	{
		a1Cell.setFormula(formula);
	}
}

// ... (existing code for createSheets, removeSheets, resizeSheet, generateMasterFormula, etc.)

function setSheetSize(sheet, rows, columns)
{
	const currentRows = sheet.getMaxRows();
	const currentCols = sheet.getMaxColumns();

	if (rows > currentRows)
	{
		sheet.insertRowsAfter(currentRows, rows - currentRows);
	}
	else if (rows < currentRows)
	{
		sheet.deleteRows(rows + 1, currentRows - rows);
	}

	if (columns > currentCols)
	{
		sheet.insertColumnsAfter(currentCols, columns - currentCols);
	}
	else if (columns < currentCols)
	{
		sheet.deleteColumns(columns + 1, currentCols - columns);
	}
}

function createIndexSheet()
{
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	let sheet = ss.getSheetByName('Index');

	if (sheet)
	{
		return;
	}

	sheet = ss.insertSheet('Index', 0);
	sheet.setFrozenRows(1);
	sheet.setColumnWidths(1, 4, [140, 70, 240, 480]);
	setSheetSize(sheet, 200, 4);

	const headerRange = sheet.getRange(1, 1, 1, 4);
	headerRange.setBackground('#4a86e8')
		.setFontColor('white')
		.setFontWeight('bold')
		.setHorizontalAlignment('center')
		.setVerticalAlignment('middle');
}

function createAlertIndexSheet()
{
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	let sheet = ss.getSheetByName('Alerts');

	if (!sheet)
	{
		sheet = ss.insertSheet('Alerts');
	}

	setSheetSize(sheet, 40, 4);

	const alerts = getAlerts();
	const data = [["Name", "Type", "Description", "Sheet Name"]];
	alerts.forEach(a =>
	{
		data.push([a.name, a.type, a.description, a.sheetName]);
	});

	const range = sheet.getRange(1, 1, data.length, 4);
	const currentValues = range.getValues();

	// Compare and update
	if (JSON.stringify(currentValues) !== JSON.stringify(data))
	{
		sheet.clearContents();
		range.setValues(data);
	}
}

function createAlertSheets()
{
	const ss = SpreadsheetApp.getActiveSpreadsheet();

	getAlerts().forEach(alert =>
	{
		const sheetName = alert.sheetName;
		let sheet = ss.getSheetByName(sheetName);

		if (!sheet)
		{
			sheet = ss.insertSheet(sheetName);
		}

		const a1Cell = sheet.getRange('A1');
		const currentFormula = a1Cell.getFormula();

		if (currentFormula !== alert.formula)
		{
			a1Cell.setFormula(alert.formula);
			SpreadsheetApp.flush();
		}

		resizeSheet(sheet);
	});
}

function removeUnusedAlertSheets()
{
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const alerts = getAlerts();
	const validSheetNames = alerts.map(alert => alert.sheetName);
	const sheets = ss.getSheets();

	sheets.forEach(sheet =>
	{
		const name = sheet.getName();
		if (name.startsWith('Alert-') && !validSheetNames.includes(name))
		{
			ss.deleteSheet(sheet);
		}
	});
}

function resizeSheet(sheet)
{
	const lastRow = sheet.getLastRow();
	const lastCol = sheet.getLastColumn();

	// Resize rows: data rows + some padding, but minimum 100
	const targetRows = Math.max(lastRow + 5, 100);
	if (sheet.getMaxRows() !== targetRows)
	{
		if (targetRows > sheet.getMaxRows())
		{
			sheet.insertRowsAfter(sheet.getMaxRows(), targetRows - sheet.getMaxRows());
		}
		else
		{
			sheet.deleteRows(targetRows + 1, sheet.getMaxRows() - targetRows);
		}
	}

	// Resize columns: fit to data content
	if (sheet.getMaxColumns() !== lastCol)
	{
		sheet.deleteColumns(lastCol + 1, sheet.getMaxColumns() - lastCol);
	}
}

function generateAlertColumnsFormula(alert)
{
	// Static messages can be built simply
	if (!alert.message.includes('$'))
	{
		return `IF(SEQUENCE(ROWS(data)); { "${alert.name}" \\ "${alert.message.replaceAll('"', '""')}" })`;
	}

	// Dynamic message need to be built at runtime
	const messageParts = alert.message.split(/(\$\d+)/g).map(part =>
	{
		if (part.startsWith('$'))
		{
			const colIdx = parseInt(part.substring(1));
			return `INDEX(data; r; ${colIdx})`;
		}

		return '"' + part.replaceAll('"', '""') + '"';
	});
	const messageFormula = messageParts.join(' & ');

	return `MAKEARRAY(ROWS(data); 1; LAMBDA(r; c; { "${alert.name}" \\ ${messageFormula} }))`;
}

function generateMasterFormula()
{
	const alerts = getAlerts();
	const parts = alerts.map(alert =>
	{
		const alertColumnsFormula = generateAlertColumnsFormula(alert);

		return `IF(
			ISNA('${alert.sheetName}'!$A$2);
			TOCOL(; 1);
			LET(
				data; FILTER('${alert.sheetName}'!$A$2:$Z; '${alert.sheetName}'!$A$2:$A <> "");
				CHOOSECOLS(
					HSTACK(
						${alertColumnsFormula};
						data
					);
					1; 3; 4; 2
				)
			)
		)`.replaceAll('\n\t\t', '\n').replaceAll('\t', '  ');
	});

	// Start with headers
	let formula = '=VSTACK({"Alerte" \\ "ID du Contact" \\ "Nom" \\ "Message" }; ';

	// Sort then stack the rows
	formula += `SORT(VSTACK(${parts.join(';\n')}); 3; TRUE; 1; TRUE))`;

	return formula;
}

if (typeof module !== 'undefined') {
	module.exports = { generateMasterFormula };
}
