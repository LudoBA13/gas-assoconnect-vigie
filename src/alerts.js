const alerts = [
  {
    "name": "CNESSansÉpicerie",
    "type": "issue",
    "description": "Liste des partenaires qui reçoit des produits CNES de la BA mais ne sont pas type épicerie sociale.",
    "message": "Le partenaire reçoit des produits CNES mais n'est pas une épicerie sociale.",
    "formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$200;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  cnesCol;  INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits CNES ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISERR(FIND(\"Epicerie Sociale\"; modesCol));\n    cnesCol = \"Oui de la BA\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
  },
  {
    "name": "ConventionExpirée",
    "type": "issue",
    "description": "Liste des partenaires dont la convention est antérieure à 5 ans.",
    "message": "La date de dernière signature de convention est antérieure à 5 ans.",
    "formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$200;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" \\ \"Date de la dernière signature de la convention / du contrat\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; EDATE(TODAY(); -60);\n\n  typeCol; INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol; INDEX(dbRows; 0; MATCH(\"Date de la dernière signature de la convention / du contrat\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol <= cutoffDate\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
  },
  {
    "name": "HabilitationRégionaleInvalide",
    "type": "issue",
    "description": "Liste des partenaires qui ne possèdent pas d'habilitation régionale valide. Sont exclus : CCAS/CIAS, membres d'un réseau ayant une habilitation nationale.",
    "message": "Le partenaire ne possède pas d'habilitation régionale valide.",
    "formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$200;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" \\ \"Oui - Date de fin de l'habilitation\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  cutoffDate; TODAY();\n\n  typeCol;    INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  dateCol;    INDEX(dbRows; 0; MATCH(\"Oui - Date de fin de l'habilitation\"; dbHeaders; 0));\n  networkCol; INDEX(dbRows; 0; MATCH(\"Appartient-il à un grand réseau ayant une habilitation nationale ?\"; dbHeaders; 0));\n  statusCol;  INDEX(dbRows; 0; MATCH(\"Statut\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    dateCol <= cutoffDate;\n    networkCol = \"1- NON\";\n    statusCol <> \"CCAS/CIAS\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
  },
  {
    "name": "ÉpicerieFSE",
    "type": "issue",
    "description": "Liste des partenaires de type épicerie sociale qui reçoivent des produits FSE+.",
    "message": "Le partenaire est une épicerie sociale mais reçoit des produits FSE+.",
    "formula": "=LET(\n  dbHeaders; ACStructures!$1:$1;\n  dbRows;    ACStructures!$2:$200;\n\n  outputHeaders; { \"Code VIF\" \\ \"Nom\" };\n  outputIndexes; BYCOL(outputHeaders; LAMBDA(colName; MATCH(colName; dbHeaders; 0)));\n\n  typeCol;  INDEX(dbRows; 0; MATCH(\"Type de structure\"; dbHeaders; 0));\n  fseCol;   INDEX(dbRows; 0; MATCH(\"Le partenaire reçoit-il des produits du FSE + ?\"; dbHeaders; 0));\n  modesCol; INDEX(dbRows; 0; MATCH(\"Modes de distribution de l'aide alimentaire\"; dbHeaders; 0));\n\n  outputRows; FILTER(\n    CHOOSECOLS(dbRows; outputIndexes);\n    ISNUMBER(FIND(\"1_Partenaire\"; typeCol));\n    ISNUMBER(FIND(\"Epicerie Sociale\"; modesCol));\n    fseCol = \"Oui\"\n  );\n\n  VSTACK(outputHeaders; outputRows)\n)\n"
  }
];

module.exports = alerts;