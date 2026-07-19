function getAlerts()
{
	return [
	{
		"name": "CNESSansÉpicerie",
		"sheetName": "Alert-CNESSansÉpicerie",
		"type": "issue",
		"description": "Partenaires qui reçoivent des produits CNES de la BA mais ne sont pas de type épicerie sociale.",
		"message": "Reçoit des produits CNES mais n'est pas une épicerie sociale.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  cnesCol;  INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits CNES ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISERR(FIND(\"Epicerie Sociale\"; modesCol));\n    cnesCol = \"Oui de la BA\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ColisSansFSE",
		"sheetName": "Alert-ColisSansFSE",
		"type": "info",
		"description": "Partenaires éligibles au FSE+ dont le mode de distribution est colis ou repas mais qui ne reçoivent pas de produits FSE+.",
		"message": "Distribution de type '{3}' mais ne reçoit pas de FSE+.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Modes de distribution de l'aide alimentaire\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  fseCol;   INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits du FSE + ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    REGEXMATCH(modesCol; \"Colis|Repas\");\n    ISERR(FIND(\"Epicerie Sociale\"; modesCol));\n    fseCol <> \"Oui\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ConventionDatesIncohérente",
		"sheetName": "Alert-ConventionDatesIncohérente",
		"type": "warning",
		"description": "Partenaires dont les dates de signature de convention sont incohérentes.",
		"message": "Les dates de signature de convention sont incohérente. Initiale : {3, date, dd/mm/yyyy}. Dernière : {4, date, dd/mm/yyyy}.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Date de la signature initiale de la convention / du contrat\" \\ \"Date de la dernière signature de la convention / du contrat\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  firstCol; INDEX(dbRows; 0; MATCH(\"Date de la signature initiale de la convention / du contrat\"; dbHeaders; 0));\n  lastCol;  INDEX(dbRows; 0; MATCH(\"Date de la dernière signature de la convention / du contrat\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    firstCol > lastCol\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ConventionExpirée",
		"sheetName": "Alert-ConventionExpirée",
		"type": "issue",
		"description": "Partenaires dont la convention est antérieure à 5 ans. Sont exclus les partenaires du réseau Croix Rouge.",
		"message": "La dernière signature de la convention est antérieure à 5 ans. ({3, date, dd/mm/yyyy})",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Date de la dernière signature de la convention / du contrat\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; EDATE(TODAY(); -60);\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Date de la dernière signature de la convention / du contrat\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    networkCol <> \"Croix Rouge\";\n    dateCol <= cutoffDate\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "HabilitationInvalide",
		"sheetName": "Alert-HabilitationInvalide",
		"type": "issue",
		"description": "Partenaires qui ne possèdent pas d'habilitation valide. Sont exclus : CCAS/CIAS, membres d'un réseau ayant une habilitation nationale, partenaires ayant une habilitation régionale valide.",
		"message": "Absence d'habilitation valide.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  regionCol;  INDEX(dbRows; 0; MATCH(\"Si non, a-t-il une habilitation régionale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  isCCAS;      ARRAYFORMULA(statusCol = \"CCAS/CIAS\");\n  hasRegion;   ARRAYFORMULA((regionCol = \"Oui\") * (dateCol > cutoffDate));\n  isInNetwork; ARRAYFORMULA((networkCol <> \"\") * (networkCol <> \"1- NON\"));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    NOT(isCCAS + hasRegion + isInNetwork)\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "HabilitationRégionaleExpirée",
		"sheetName": "Alert-HabilitationRégionaleExpirée",
		"type": "issue",
		"description": "Partenaires dont l'habilitation régionale est expirée.",
		"message": "Habilitation régionale expirée. ({3, date, dd/mm/yyyy})",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol > 0;\n    dateCol <= cutoffDate;\n    (networkCol = \"1- NON\") + (networkCol = \"\");\n    statusCol <> \"CCAS/CIAS\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "HabilitationRégionaleIncohérente",
		"sheetName": "Alert-HabilitationRégionaleIncohérente",
		"type": "warning",
		"description": "Partenaires dont l'habilitation régionale est incorrectement configurée. Le statut de l'habilitation régionale 'Oui'/'Non' doit être cohérent avec la présence d'une date de fin d'habilitation.",
		"message": "Habilitation régionale incohérente. Statut : '{3}'. Date : '{4, date, dd/mm/yyyy}'.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Si non, a-t-il une habilitation régionale ?\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;   INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  regionCol; INDEX(dbRows; 0; MATCH(\"Si non, a-t-il une habilitation régionale ?\"; dbHeaders; 0));\n  dateCol;   INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    (regionCol = \"Oui\") = ISBLANK(dateCol)\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "RenouvelerConvention",
		"sheetName": "Alert-RenouvelerConvention",
		"type": "info",
		"description": "Partenaires dont la convention aura 5 ans dans les 6 prochains mois.",
		"message": "La convention doit être renouvelée bientôt. ({3, date, dd/mm/yyyy})",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Date de la dernière signature de la convention / du contrat\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  minDate; EDATE(TODAY(); -60);\n  maxDate; EDATE(TODAY(); -54);\n\n  typeCol; INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol; INDEX(dbRows; 0; MATCH(\"Date de la dernière signature de la convention / du contrat\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol >= minDate;\n    dateCol <= maxDate\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "RenouvelerHabilitationRégionale",
		"sheetName": "Alert-RenouvelerHabilitationRégionale",
		"type": "info",
		"description": "Partenaires dont l'habilitation régionale expire dans les 6 prochains mois.",
		"message": "L'habilitation régionale expire bientôt. ({3, date, dd/mm/yyyy})",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  minDate; TODAY();\n  maxDate; EDATE(TODAY(); 6);\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol >= minDate;\n    dateCol <= maxDate;\n    (networkCol = \"1- NON\") + (networkCol = \"\");\n    statusCol <> \"CCAS/CIAS\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "SIRETInvalide",
		"sheetName": "Alert-SIRETInvalide",
		"type": "issue",
		"description": "Partenaires dont le numéro SIRET est manquant ou invalide. (14 chiffres dont clé Luhn)",
		"message": "SIRET manquant ou invalide.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows; ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  siretCol; INDEX(dbRows; 0; MATCH(\"Siret\"; dbHeaders; 0));\n  \n  siretValid; MAP(siretCol; LAMBDA(siret; \n    IF(OR(ISBLANK(siret); NOT(ISNUMBER(siret)); siret < 10000000000000; siret > 99999999999999); FALSE; \n      LET(\n        str; TO_TEXT(siret);\n        numLen; LEN(str);\n        processed; MAP(SEQUENCE(numLen); LAMBDA(idx;\n          LET(\n            d; VALUE(MID(str; numLen - idx + 1; 1));\n            IF(ISODD(idx); d; IF(d * 2 > 9; (d * 2) - 9; d * 2))\n          )\n        ));\n        MOD(SUM(processed); 10) = 0\n      )\n    )\n  ));\n  \n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    NOT(siretValid)\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ÉpicerieFSE",
		"sheetName": "Alert-ÉpicerieFSE",
		"type": "issue",
		"description": "Partenaires de type épicerie sociale qui reçoivent des produits FSE+.",
		"message": "Épicerie sociale mais reçoit des produits FSE+.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  fseCol;   INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits du FSE + ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISNUMBER(FIND(\"Epicerie Sociale\"; modesCol));\n    fseCol = \"Oui\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ÉquipementFraisManquant",
		"sheetName": "Alert-ÉquipementFraisManquant",
		"type": "warning",
		"description": "Partenaires qui souhaitent recevoir des produits frais mais n'ont ni réfrigérateurs ni chambres froides positives dans leur liste d'équipement.",
		"message": "Souhaite recevoir du frais sans stockage réfrigéré.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  equipCol; INDEX(dbRows; 0; MATCH(\"Equipements/Locaux\"; dbHeaders; 0));\n  prodCol;  INDEX(dbRows; 0; MATCH(\"Produits de la BA souhaités par le partenaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISNUMBER(FIND(\"Frais\"; prodCol));\n    NOT(REGEXMATCH(\"Chambre froide positive|Réfrigérateur\"; equipCol))\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ÉquipementSurgeléManquant",
		"sheetName": "Alert-ÉquipementSurgeléManquant",
		"type": "warning",
		"description": "Partenaires qui souhaitent recevoir des produits surgelés mais n'ont ni congélateurs ni chambres froides négatives dans leur liste d'équipement.",
		"message": "Souhaite recevoir du surgelé sans stockage à température négative.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  equipCol; INDEX(dbRows; 0; MATCH(\"Equipements/Locaux\"; dbHeaders; 0));\n  prodCol;  INDEX(dbRows; 0; MATCH(\"Produits de la BA souhaités par le partenaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISNUMBER(FIND(\"Surgelé\"; prodCol));\n    NOT(REGEXMATCH(\"Chambre froide négative|Congélateur\"; equipCol))\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	}
];
}

function getMasterFormula()
{
	return "=LET(\n  headers;    { \"CAR\" \\ \"Alerte\" \\ \"ID du Contact\" \\ \"Nom\" \\ \"Message\" };\n  alertsData; VSTACK(IF(\n    ISNA('Alert-CNESSansÉpicerie'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-CNESSansÉpicerie'!$A$2:$Z; 'Alert-CNESSansÉpicerie'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"CNESSansÉpicerie\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"Reçoit des produits CNES mais n'est pas une épicerie sociale.\"))\n      )\n    )\n  );\nIF(\n    ISNA('Alert-ColisSansFSE'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-ColisSansFSE'!$A$2:$Z; 'Alert-ColisSansFSE'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"ColisSansFSE\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(\"Distribution de type '\" & INDEX(alertData; 0; 3) & \"' mais ne reçoit pas de FSE+.\")\n      )\n    )\n  );\nIF(\n    ISNA('Alert-ConventionDatesIncohérente'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-ConventionDatesIncohérente'!$A$2:$Z; 'Alert-ConventionDatesIncohérente'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"ConventionDatesIncohérente\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(\"Les dates de signature de convention sont incohérente. Initiale : \" & TEXT(INDEX(alertData; 0; 3); \"dd/mm/yyyy\") & \". Dernière : \" & TEXT(INDEX(alertData; 0; 4); \"dd/mm/yyyy\") & \".\")\n      )\n    )\n  );\nIF(\n    ISNA('Alert-ConventionExpirée'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-ConventionExpirée'!$A$2:$Z; 'Alert-ConventionExpirée'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"ConventionExpirée\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(\"La dernière signature de la convention est antérieure à 5 ans. (\" & TEXT(INDEX(alertData; 0; 3); \"dd/mm/yyyy\") & \")\")\n      )\n    )\n  );\nIF(\n    ISNA('Alert-HabilitationInvalide'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-HabilitationInvalide'!$A$2:$Z; 'Alert-HabilitationInvalide'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"HabilitationInvalide\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"Absence d'habilitation valide.\"))\n      )\n    )\n  );\nIF(\n    ISNA('Alert-HabilitationRégionaleExpirée'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-HabilitationRégionaleExpirée'!$A$2:$Z; 'Alert-HabilitationRégionaleExpirée'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"HabilitationRégionaleExpirée\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(\"Habilitation régionale expirée. (\" & TEXT(INDEX(alertData; 0; 3); \"dd/mm/yyyy\") & \")\")\n      )\n    )\n  );\nIF(\n    ISNA('Alert-HabilitationRégionaleIncohérente'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-HabilitationRégionaleIncohérente'!$A$2:$Z; 'Alert-HabilitationRégionaleIncohérente'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"HabilitationRégionaleIncohérente\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(\"Habilitation régionale incohérente. Statut : '\" & INDEX(alertData; 0; 3) & \"'. Date : '\" & TEXT(INDEX(alertData; 0; 4); \"dd/mm/yyyy\") & \"'.\")\n      )\n    )\n  );\nIF(\n    ISNA('Alert-RenouvelerConvention'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-RenouvelerConvention'!$A$2:$Z; 'Alert-RenouvelerConvention'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"RenouvelerConvention\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(\"La convention doit être renouvelée bientôt. (\" & TEXT(INDEX(alertData; 0; 3); \"dd/mm/yyyy\") & \")\")\n      )\n    )\n  );\nIF(\n    ISNA('Alert-RenouvelerHabilitationRégionale'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-RenouvelerHabilitationRégionale'!$A$2:$Z; 'Alert-RenouvelerHabilitationRégionale'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"RenouvelerHabilitationRégionale\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(\"L'habilitation régionale expire bientôt. (\" & TEXT(INDEX(alertData; 0; 3); \"dd/mm/yyyy\") & \")\")\n      )\n    )\n  );\nIF(\n    ISNA('Alert-SIRETInvalide'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-SIRETInvalide'!$A$2:$Z; 'Alert-SIRETInvalide'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"SIRETInvalide\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"SIRET manquant ou invalide.\"))\n      )\n    )\n  );\nIF(\n    ISNA('Alert-ÉpicerieFSE'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-ÉpicerieFSE'!$A$2:$Z; 'Alert-ÉpicerieFSE'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"ÉpicerieFSE\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"Épicerie sociale mais reçoit des produits FSE+.\"))\n      )\n    )\n  );\nIF(\n    ISNA('Alert-ÉquipementFraisManquant'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-ÉquipementFraisManquant'!$A$2:$Z; 'Alert-ÉquipementFraisManquant'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"ÉquipementFraisManquant\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"Souhaite recevoir du frais sans stockage réfrigéré.\"))\n      )\n    )\n  );\nIF(\n    ISNA('Alert-ÉquipementSurgeléManquant'!$A$2);\n    TOCOL(; 1);\n    LET(\n      alertData; FILTER('Alert-ÉquipementSurgeléManquant'!$A$2:$Z; 'Alert-ÉquipementSurgeléManquant'!$A$2:$A <> \"\");\n      HSTACK(\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"ÉquipementSurgeléManquant\"));\n        CHOOSECOLS(alertData; 1; 2);\n        INDEX(IF(SEQUENCE(ROWS(alertData)); \"Souhaite recevoir du surgelé sans stockage à température négative.\"))\n      )\n    )\n  ));\n  carColIdx;  MATCH(\"Interlocuteur principal dans la BA (nom, fonction)\"; ACStructures!$1:$1; 0);\n  carCol;     ARRAYFORMULA(XLOOKUP(INDEX(alertsData;; 2); ACStructures!$A:$A; INDEX(ACStructures!$A:$Z;; carColIdx)));\n  data;       SORT(HSTACK(carCol; alertsData); 4; TRUE; 2; TRUE; 1; TRUE);\n\n  VSTACK(headers; data)\n)";
}
