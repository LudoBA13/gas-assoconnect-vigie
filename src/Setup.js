const alerts = require('./Alerts');

function setUpSheets()
{
	createSheets();
}

function createSheets()
{
	const ss = SpreadsheetApp.getActiveSpreadsheet();

	alerts.forEach(alert =>
	{
		const sheetName = 'Alert-' + alert.name;
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
		}
	});
}

module.exports = { setUpSheets };
