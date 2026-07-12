function setUpSheets()
{
	createSheets();
}

function createSheets()
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

function generateMasterFormula()
{
	const alerts = getAlerts();
	const parts = alerts.map(alert =>
	{
		const range = `'${alert.sheetName}'!A2:B100`; // Assuming data in A2:B
		const message = alert.message;
		// Logic: If A2 is not empty and not an error (iserror?), include A, B, and message
		// Using LET for clarity
		return `LET(
			data; '${alert.sheetName}'!$A$2:$B;
			isValid; NOT(ISBLANK(INDEX(data; 1; 1))) * NOT(ISERROR(INDEX(data; 1; 1)));
			IF(isValid; HSTACK(MAKEARRAY(ROWS(data); 1; LAMBDA(r; c; "${alert.name}")); data; MAKEARRAY(ROWS(data); 1; LAMBDA(r; c; "${message}"))); IFERROR(1/0))
		)`;
	});

	// Stack and remove errors
	return `=QUERY(VSTACK(${parts.join('; ')}); "where Col2 is not null order by Col2 asc, Col1 asc")`;
}

function _debugFormula()
{
	const formula = generateMasterFormula();
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	let sheet = ss.getSheetByName('Index');
	if (!sheet)
	{
		sheet = ss.insertSheet('Index');
	}
	sheet.getRange('A1').setFormula(formula);
}
