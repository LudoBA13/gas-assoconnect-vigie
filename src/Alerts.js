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
		"message": "Habilitation régionale expirée.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n\tdateCol > 0;\n    dateCol <= cutoffDate;\n    networkCol = \"1- NON\";\n    statusCol <> \"CCAS/CIAS\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "HabilitationRégionaleIncohérente",
		"sheetName": "Alert-HabilitationRégionaleIncohérente",
		"type": "warning",
		"description": "Liste des partenaires dont l'habilitation régionale est incorrectement configurée. Le statut de l'habilitation régionale 'Oui'/'Non' doit être cohérent avec la présence d'une date de fin d'habilitation.",
		"message": "Habilitation régionale incohérente. Statut : '$3'. Date : '$4'.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" \\ \"Si non, a-t-il une habilitation régionale ?\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;   INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  regionCol; INDEX(dbRows; 0; MATCH(\"Si non, a-t-il une habilitation régionale ?\"; dbHeaders; 0));\n  dateCol;   INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    (regionCol = \"Oui\") = ISBLANK(dateCol)\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
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
	},
	{
		"name": "ÉquipementFraisManquant",
		"sheetName": "Alert-ÉquipementFraisManquant",
		"type": "warning",
		"description": "Partenaires qui souhaitent recevoir des produits frais mais n'ont ni réfrigérateurs ni chambres froides positives dans leur liste d'équipement.",
		"message": "Souhaite recevoir du frais sans stockage réfrigéré.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  equipCol; INDEX(dbRows; 0; MATCH(\"Equipements/Locaux\"; dbHeaders; 0));\n  prodCol;  INDEX(dbRows; 0; MATCH(\"Produits de la BA souhaités par le partenaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISNUMBER(FIND(\"Frais\"; prodCol));\n    NOT(REGEXMATCH(\"Chambre froide positive|Réfrigérateur\"; equipCol))\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ÉquipementSurgeléManquant",
		"sheetName": "Alert-ÉquipementSurgeléManquant",
		"type": "warning",
		"description": "Partenaires qui souhaitent recevoir des produits surgelés mais n'ont ni congélateurs ni chambres froides négatives dans leur liste d'équipement.",
		"message": "Souhaite recevoir du surgelé sans stockage à température négative.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  equipCol; INDEX(dbRows; 0; MATCH(\"Equipements/Locaux\"; dbHeaders; 0));\n  prodCol;  INDEX(dbRows; 0; MATCH(\"Produits de la BA souhaités par le partenaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISNUMBER(FIND(\"Surgelé\"; prodCol));\n    NOT(REGEXMATCH(\"Chambre froide négative|Congélateur\"; equipCol))\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	}
];
}

function getMasterFormula()
{
	return "=VSTACK({\"Alerte\" \\ \"Code VIF\" \\ \"Nom\" \\ \"Message\" }; QUERY(VSTACK(LET(\n\t\t\tdata; 'Alert-CNESSansÉpicerie'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"CNESSansÉpicerie\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"Reçoit des produits CNES mais n'est pas une épicerie sociale.\")))\n\t\t); LET(\n\t\t\tdata; 'Alert-ConventionExpirée'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"ConventionExpirée\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"La date de dernière signature de convention est antérieure à 5 ans.\")))\n\t\t); LET(\n\t\t\tdata; 'Alert-HabilitationInvalide'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"HabilitationInvalide\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"Absence d'habilitation valide.\")))\n\t\t); LET(\n\t\t\tdata; 'Alert-HabilitationRégionaleExpirée'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"HabilitationRégionaleExpirée\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"Habilitation régionale expirée.\")))\n\t\t); LET(\n\t\t\tdata; 'Alert-HabilitationRégionaleIncohérente'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"HabilitationRégionaleIncohérente\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"Habilitation régionale incohérente. Statut : '\" & INDEX(data; r; 3) & \"'. Date : '\" & INDEX(data; r; 4) & \"'.\")))\n\t\t); LET(\n\t\t\tdata; 'Alert-SIRETInvalide'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"SIRETInvalide\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"SIRET manquant ou invalide.\")))\n\t\t); LET(\n\t\t\tdata; 'Alert-ÉpicerieFSE'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"ÉpicerieFSE\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"Épicerie sociale mais reçoit des produits FSE+.\")))\n\t\t); LET(\n\t\t\tdata; 'Alert-ÉquipementFraisManquant'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"ÉquipementFraisManquant\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"Souhaite recevoir du frais sans stockage réfrigéré.\")))\n\t\t); LET(\n\t\t\tdata; 'Alert-ÉquipementSurgeléManquant'!$A$2:$Z;\n\t\t\tvalidRows; FILTER(data; NOT(ISBLANK(INDEX(data; 0; 1))) * NOT(ISERROR(INDEX(data; 0; 1))));\n\t\t\tHSTACK(MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"ÉquipementSurgeléManquant\")); CHOOSECOLS(validRows; 1; 2); MAKEARRAY(ROWS(validRows); 1; LAMBDA(r; c; \"Souhaite recevoir du surgelé sans stockage à température négative.\")))\n\t\t)); \"where Col3 is not null order by Col3 asc, Col1 asc\"))";
}
