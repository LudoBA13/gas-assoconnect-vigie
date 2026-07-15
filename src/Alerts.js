function getAlerts()
{
	return [
	{
		"name": "CNESSansÉpicerie",
		"sheetName": "Alert-CNESSansÉpicerie",
		"type": "issue",
		"description": "Partenaires qui reçoivent des produits CNES de la BA mais ne sont pas type épicerie sociale.",
		"message": "Reçoit des produits CNES mais n'est pas une épicerie sociale.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  cnesCol;  INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits CNES ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISERR(FIND(\"Epicerie Sociale\"; modesCol));\n    cnesCol = \"Oui de la BA\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ColisSansFSE",
		"sheetName": "Alert-ColisSansFSE",
		"type": "info",
		"description": "Partenaires éligibles au FSE+ dont le mode de distribution est colis ou repas mais qui ne reçoivent pas de produits FSE+.",
		"message": "Distribution de type '$3' mais ne reçoit pas de FSE+.",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Modes de distribution de l'aide alimentaire\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  fseCol;   INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits du FSE + ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    REGEXMATCH(modesCol; \"Colis|Repas\");\n    ISERR(FIND(\"Epicerie Sociale\"; modesCol));\n    fseCol <> \"Oui\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
	},
	{
		"name": "ConventionExpirée",
		"sheetName": "Alert-ConventionExpirée",
		"type": "issue",
		"description": "Partenaires dont la convention est antérieure à 5 ans.",
		"message": "La dernière signature de la convention est antérieure à 5 ans. ({3, date, dd/mm/yyyy})",
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Date de la dernière signature de la convention / du contrat\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; EDATE(TODAY(); -60);\n\n  typeCol; INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol; INDEX(dbRows; 0; MATCH(\"Date de la dernière signature de la convention / du contrat\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol <= cutoffDate\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
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
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol > 0;\n    dateCol <= cutoffDate;\n    networkCol = \"1- NON\";\n    statusCol <> \"CCAS/CIAS\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
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
		"formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$1000;\n\n  outputHeaders; { \"ID du Contact\" \\ \"Nom\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  minDate; TODAY();\n  maxDate; EDATE(TODAY(); 6);\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol >= minDate;\n    dateCol <= maxDate;\n    networkCol = \"1- NON\";\n    statusCol <> \"CCAS/CIAS\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
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
	return "=VSTACK({\"Alerte\" \\ \"ID du Contact\" \\ \"Nom\" \\ \"Message\" }; SORT(VSTACK(IF(\n  ISNA('Alert-CNESSansÉpicerie'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-CNESSansÉpicerie'!$A$2:$Z; 'Alert-CNESSansÉpicerie'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        IF(SEQUENCE(ROWS(data)); { \"CNESSansÉpicerie\" \\ \"Reçoit des produits CNES mais n'est pas une épicerie sociale.\" });\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-ColisSansFSE'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-ColisSansFSE'!$A$2:$Z; 'Alert-ColisSansFSE'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        IF(SEQUENCE(ROWS(data)); { \"ColisSansFSE\" \\ \"Distribution de type '$3' mais ne reçoit pas de FSE+.\" });\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-ConventionExpirée'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-ConventionExpirée'!$A$2:$Z; 'Alert-ConventionExpirée'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        MAKEARRAY(ROWS(data); 1; LAMBDA(r; c; { \"ConventionExpirée\" \\ \"La dernière signature de la convention est antérieure à 5 ans. (\" & TEXT(INDEX(data; r; 3); \"dd/mm/yyyy\") & \")\" }));\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-HabilitationInvalide'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-HabilitationInvalide'!$A$2:$Z; 'Alert-HabilitationInvalide'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        IF(SEQUENCE(ROWS(data)); { \"HabilitationInvalide\" \\ \"Absence d'habilitation valide.\" });\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-HabilitationRégionaleExpirée'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-HabilitationRégionaleExpirée'!$A$2:$Z; 'Alert-HabilitationRégionaleExpirée'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        MAKEARRAY(ROWS(data); 1; LAMBDA(r; c; { \"HabilitationRégionaleExpirée\" \\ \"Habilitation régionale expirée. (\" & TEXT(INDEX(data; r; 3); \"dd/mm/yyyy\") & \")\" }));\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-HabilitationRégionaleIncohérente'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-HabilitationRégionaleIncohérente'!$A$2:$Z; 'Alert-HabilitationRégionaleIncohérente'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        MAKEARRAY(ROWS(data); 1; LAMBDA(r; c; { \"HabilitationRégionaleIncohérente\" \\ \"Habilitation régionale incohérente. Statut : '\" & INDEX(data; r; 3) & \"'. Date : '\" & TEXT(INDEX(data; r; 4); \"dd/mm/yyyy\") & \"'.\" }));\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-RenouvelerConvention'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-RenouvelerConvention'!$A$2:$Z; 'Alert-RenouvelerConvention'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        MAKEARRAY(ROWS(data); 1; LAMBDA(r; c; { \"RenouvelerConvention\" \\ \"La convention doit être renouvelée bientôt. (\" & TEXT(INDEX(data; r; 3); \"dd/mm/yyyy\") & \")\" }));\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-RenouvelerHabilitationRégionale'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-RenouvelerHabilitationRégionale'!$A$2:$Z; 'Alert-RenouvelerHabilitationRégionale'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        MAKEARRAY(ROWS(data); 1; LAMBDA(r; c; { \"RenouvelerHabilitationRégionale\" \\ \"L'habilitation régionale expire bientôt. (\" & TEXT(INDEX(data; r; 3); \"dd/mm/yyyy\") & \")\" }));\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-SIRETInvalide'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-SIRETInvalide'!$A$2:$Z; 'Alert-SIRETInvalide'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        IF(SEQUENCE(ROWS(data)); { \"SIRETInvalide\" \\ \"SIRET manquant ou invalide.\" });\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-ÉpicerieFSE'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-ÉpicerieFSE'!$A$2:$Z; 'Alert-ÉpicerieFSE'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        IF(SEQUENCE(ROWS(data)); { \"ÉpicerieFSE\" \\ \"Épicerie sociale mais reçoit des produits FSE+.\" });\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-ÉquipementFraisManquant'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-ÉquipementFraisManquant'!$A$2:$Z; 'Alert-ÉquipementFraisManquant'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        IF(SEQUENCE(ROWS(data)); { \"ÉquipementFraisManquant\" \\ \"Souhaite recevoir du frais sans stockage réfrigéré.\" });\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n);\nIF(\n  ISNA('Alert-ÉquipementSurgeléManquant'!$A$2);\n  TOCOL(; 1);\n  LET(\n    data; FILTER('Alert-ÉquipementSurgeléManquant'!$A$2:$Z; 'Alert-ÉquipementSurgeléManquant'!$A$2:$A <> \"\");\n    CHOOSECOLS(\n      HSTACK(\n        IF(SEQUENCE(ROWS(data)); { \"ÉquipementSurgeléManquant\" \\ \"Souhaite recevoir du surgelé sans stockage à température négative.\" });\n        data\n      );\n      1; 3; 4; 2\n    )\n  )\n)); 3; TRUE; 1; TRUE))";
}
