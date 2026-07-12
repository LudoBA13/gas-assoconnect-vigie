function getAlerts()
{
	return [
	{
		"name": "CNESSansÉpicerie",
		"sheetName": "Alert-CNESSansÉpicerie",
		"type": "issue",
		"description": "Liste des partenaires qui reçoit des produits CNES de la BA mais ne sont pas type épicerie sociale.",
		"message": "Reçoit des produits CNES mais n'est pas une épicerie sociale.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  cnesCol;  INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits CNES ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISERR(FIND(\"Epicerie Sociale\"; modesCol));\n    cnesCol = \"Oui de la BA\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ConventionExpirée",
		"sheetName": "Alert-ConventionExpirée",
		"type": "issue",
		"description": "Liste des partenaires dont la convention est antérieure à 5 ans.",
		"message": "La date de dernière signature de convention est antérieure à 5 ans.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" \\ \"Date de la dernière signature de la convention / du contrat\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; EDATE(TODAY(); -60);\n\n  typeCol; INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol; INDEX(dbRows; 0; MATCH(\"Date de la dernière signature de la convention / du contrat\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol <= cutoffDate\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "HabilitationInvalide",
		"sheetName": "Alert-HabilitationInvalide",
		"type": "issue",
		"description": "Liste des partenaires qui ne possèdent pas d'habilitation valide. Sont exclus : CCAS/CIAS, membres d'un réseau ayant une habilitation nationale, partenaires ayant une habilitation régionale valide.",
		"message": "Absence d'habilitation valide.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  regionCol;  INDEX(dbRows; 0; MATCH(\"Si non, a-t-il une habilitation régionale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  isCCAS;      ARRAYFORMULA(statusCol = \"CCAS/CIAS\");\n  hasRegion;   ARRAYFORMULA((regionCol = \"Oui\") * (dateCol > cutoffDate));\n  isInNetwork; ARRAYFORMULA((networkCol <> \"\") * (networkCol <> \"1- NON\"));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    NOT(isCCAS + hasRegion + isInNetwork)\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "HabilitationRégionaleExpirée",
		"sheetName": "Alert-HabilitationRégionaleExpirée",
		"type": "issue",
		"description": "Liste des partenaires dont l'habilitation régionale est expirée.",
		"message": "Habilitation régionale invalide.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol <= cutoffDate;\n    networkCol = \"1- NON\";\n    statusCol <> \"CCAS/CIAS\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "SIRETInvalide",
		"sheetName": "Alert-SIRETInvalide",
		"type": "issue",
		"description": "Liste des partenaires dont le numéro SIRET est manquant ou invalide. (14 chiffres dont clé Luhn)",
		"message": "SIRET manquant ou invalide.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows; ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  siretCol; INDEX(dbRows; 0; MATCH(\"Siret\"; dbHeaders; 0));\n  \n  siretValid; MAP(siretCol; LAMBDA(siret; \n    IF(OR(ISBLANK(siret); NOT(ISNUMBER(siret)); siret < 10000000000000; siret > 99999999999999); FALSE; \n      LET(\n        str; TO_TEXT(siret);\n        numLen; LEN(str);\n        processed; MAP(SEQUENCE(numLen); LAMBDA(idx;\n          LET(\n            d; VALUE(MID(str; numLen - idx + 1; 1));\n            IF(ISODD(idx); d; IF(d * 2 > 9; (d * 2) - 9; d * 2))\n          )\n        ));\n        MOD(SUM(processed); 10) = 0\n      )\n    )\n  ));\n  \n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    NOT(siretValid)\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ÉpicerieFSE",
		"sheetName": "Alert-ÉpicerieFSE",
		"type": "issue",
		"description": "Liste des partenaires de type épicerie sociale qui reçoivent des produits FSE+.",
		"message": "Épicerie sociale mais reçoit des produits FSE+.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  fseCol;   INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits du FSE + ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISNUMBER(FIND(\"Epicerie Sociale\"; modesCol));\n    fseCol = \"Oui\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	}
];
}
