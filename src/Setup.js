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

function _debugFormula()
{
	const formula = getMasterFormula();
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	let sheet = ss.getSheetByName('Index');
	if (!sheet)
	{
		sheet = ss.insertSheet('Index');
	}
	sheet.getRange('A1').setFormula(formula);
}
