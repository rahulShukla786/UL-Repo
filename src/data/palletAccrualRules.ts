export interface PalletAccrualRule {
  sub_system_id: string;
  document_name: string;
  sub_system_name: string;
  rule_id: string;
  title: string;
  description: string;
  rule_type: string;
  order_of_execution: number;
  enabled: boolean;
  conditions: unknown;
  actions: unknown;
  outputs: unknown;
  controls: unknown;
  exceptions: unknown;
  context: unknown;
  tags: unknown;
}

export const PALLET_ACCRUAL_RULES = [
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R001",
    "title": "Extract B&M Upload Data for Accrual Month",
    "description": "Extract B&M monthly upload data from file Unilever Costs - Europe <Year>.xlsx, sheet Data, columns A to BC. Filters: Month (AR) = accrual month, Year (AS) = accrual year. Output: B&M Monthly Upload dataset. Frequency: Monthly.",
    "rule_type": "Sourcing",
    "order_of_execution": 1,
    "enabled": true,
    "conditions": [
      {
        "field": "Month",
        "operator": "=",
        "value": "accrual month"
      },
      {
        "field": "Year",
        "operator": "=",
        "value": "accrual year"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "B&M Monthly Upload dataset",
      "description": "Columns A to BC from sheet Data"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Unilever Costs - Europe <Year>.xlsx",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R002",
    "title": "Extract SAP Pallet Cost Centre Data",
    "description": "Extract SAP KSB1 line items for cost centre groups 10_3530229 (SU pallets) and 10_3550337 (DC pallets) into sheet WE SAP DATA, columns B to T. Fields extracted: Cost Center, CO object name, Cost Element, Cost element descr., Period, Name of offsetting account, Name, Ref. document number, Offsetting acct no., Company Code, User Name, Document Header Text, Var.val.in rep.cur., Document Date, Posting Date, Plant, Purchasing Document, Purchase order text, Document type. Filters: cost_centre_group IN 10_3530229, 10_3550337. Output: SAP Pallet Cost dataset. Frequency: Monthly.",
    "rule_type": "Sourcing",
    "order_of_execution": 2,
    "enabled": true,
    "conditions": [
      {
        "field": "cost_centre_group",
        "operator": "IN",
        "value": "10_3530229, 10_3550337"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "SAP Pallet Cost dataset",
      "description": "Cost Center, CO object name, Cost Element, Cost element descr., Period, Name of offsetting account, Name, Ref. document number, Offsetting acct no., Company Code, User Name, Document Header Text, Var.val.in rep.cur., Document Date, Posting Date, Plant, Purchasing Document, Purchase order text, Document type"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "SAP KSB1",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R003",
    "title": "Extract SAP Opening Balance Data",
    "description": "Extract SAP opening balance line items from SAP into sheet SAP Opening DATA, columns A to S, using the same layout as WE SAP DATA without the derived columns. Output: SAP Opening Balance dataset. Frequency: Monthly.",
    "rule_type": "Sourcing",
    "order_of_execution": 3,
    "enabled": true,
    "conditions": [],
    "actions": [],
    "outputs": {
      "dataset_name": "SAP Opening Balance dataset",
      "description": "SAP opening balance line items in columns A to S (same layout as WE SAP DATA without the derived columns)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "SAP",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R004",
    "title": "Extract CHEP Raw Data",
    "description": "Extract B&M current-month CHEP data from file <Month> <Year> CHEP Accrual.xlsx, sheet Raw Data, columns A to BB. Fields extracted: Country (B), Plant Code (C), Category (D), Plant Name (E), Plant Type (F), Total Cost (L), pt (O), sender (R), Receiver (AF), PostingDate (AV), and DateTimeCreate (BB). Output: CHEP Raw Data dataset. Frequency: Monthly.",
    "rule_type": "Sourcing",
    "order_of_execution": 4,
    "enabled": true,
    "conditions": [],
    "actions": [],
    "outputs": {
      "dataset_name": "CHEP Raw Data dataset",
      "description": "B&M current-month CHEP data from columns A to BB including Country (B), Plant Code (C), Category (D), Plant Name (E), Plant Type (F), Total Cost (L), pt (O), sender (R), Receiver (AF), PostingDate (AV) and DateTimeCreate (BB)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "B&M",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R005",
    "title": "Extract Outstanding Credit Debit Notes",
    "description": "Extract one-off credit and debit notes from file Outstanding Credit Debit Reports <Year>.xlsx, source tabs: CEE & Baltics, NorDACH, Northern Europe, and Southern Europe, with header row 2. Fields extracted: Date Raised, Country, Plant Code, Site Name, IC / Non IC, Date of Credit / Debit Note, Credit / Debit Note Number, Original Invoice Number, Value, Credit / Debit, Issue Description, Status, Comments. Output: Outstanding Notes dataset.",
    "rule_type": "Sourcing",
    "order_of_execution": 5,
    "enabled": true,
    "conditions": [
      {
        "field": "header_row",
        "operator": "=",
        "value": "2"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Outstanding Notes dataset",
      "description": "Date Raised, Country, Plant Code, Site Name, IC / Non IC, Date of Credit / Debit Note, Credit / Debit Note Number, Original Invoice Number, Value, Credit / Debit, Issue Description, Status, Comments"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Outstanding Credit Debit Reports <Year>.xlsx",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "[]"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R006",
    "title": "Extract Master Reference",
    "description": "Master Reference: Plant (A), Plant Combination (B), Plant Type (C), Cost Centre at plant level (I), Plant (J), Plnt (V), Plant Type (X) and Rep.Cntry (Y); PO Reference: Purch.Doc. (C), Name 1 (D), Short text (F); Copack Reference: Key (F), Copack (G); Plant Mapping Reference - B&M mapping basic: columns C to E; B&M mapping exemptions multi-plant: columns J:K; B&M mapping exemptions repack and MSO: columns M:P; B&M mapping exemptions manual calculation: columns E:G; B&M mapping exemptions out-of-scope countries: columns R:S; Masterdata: plant name, plant type, cost centre; Calendar and FX Reference - calendar mapping: Key YYYYMM (column A), Calendar Days (column D), Working Days (column E); FX: rate by country",
    "rule_type": "Sourcing",
    "order_of_execution": 6,
    "enabled": true,
    "conditions": [],
    "actions": [],
    "outputs": {
      "dataset_name": "Master Reference",
      "description": "Plant (A), Plant Combination (B), Plant Type (C), Cost Centre at plant level (I), Plant (J), Plnt (V), Plant Type (X) and Rep.Cntry (Y)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "working file",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "[]"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R007",
    "title": "Extract Split Percentage Reference",
    "description": "Extract split percentage reference data from sheet Split of the working file. Fields extracted: Plant input (column B), Final Plant (column D), Cost Centre (column H), and Split % (column N). Output: Split Reference dataset. Frequency: Monthly.",
    "rule_type": "Sourcing",
    "order_of_execution": 7,
    "enabled": true,
    "conditions": [],
    "actions": [],
    "outputs": {
      "dataset_name": "Split Reference",
      "description": "Plant input, Final Plant, Cost Centre, Split %"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Excel working file",
      "process": "SCFS Pallet Accrual",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R008",
    "title": "Validate B&M Monthly Upload Period Coverage",
    "description": "Validate the B&M Monthly Upload dataset: check that accrual_month is present in B&M Monthly Upload rows. If check fails, stop processing. Output: Validated B&M Monthly Upload. Frequency: Monthly.",
    "rule_type": "Validation",
    "order_of_execution": 8,
    "enabled": true,
    "conditions": [
      {
        "field": "accrual_month",
        "operator": "IN",
        "value": "B&M Monthly Upload rows"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Validated B&M Monthly Upload",
      "description": "B&M Monthly Upload records confirmed for accrual month"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "B&M Monthly Upload",
      "process": "SCFS Pallet Accrual",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R009",
    "title": "Validate CHEP Raw Data Period Coverage",
    "description": "Validate the CHEP Raw Data dataset: check that DateTimeCreate (column BB) falls within the accrual month. If check fails, stop processing. Output: Validated CHEP Raw Data. Frequency: Monthly.",
    "rule_type": "Validation",
    "order_of_execution": 9,
    "enabled": true,
    "conditions": [
      {
        "field": "DateTimeCreate",
        "operator": "RELATIVE_DATE",
        "value": "accrual month"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Validated CHEP Raw Data",
      "description": "CHEP Raw Data records confirmed for accrual month"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "CHEP Raw Data",
      "process": "SCFS Pallet Accrual",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R010",
    "title": "Validate SAP Pallet Cost Period Coverage",
    "description": "Validate the SAP Pallet Cost dataset: check that posting_period falls within the accrual month. If check fails, stop processing. Output: Validated SAP Pallet Cost. Frequency: Monthly.",
    "rule_type": "Validation",
    "order_of_execution": 10,
    "enabled": true,
    "conditions": [
      {
        "field": "posting_period",
        "operator": "RELATIVE_DATE",
        "value": "accrual month"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Validated SAP Pallet Cost",
      "description": "SAP Pallet Cost postings confirmed for accrual month"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "SAP Pallet Cost",
      "process": "SCFS Pallet Accrual",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R011",
    "title": "Derive and Validate SAP Pallet Cost Fields",
    "description": "Validate and enrich the SAP Pallet Cost dataset by performing the following lookups and checks: (1) Match Cost Centre at plant level (column I) from Master Reference with Cost Center (column B) from SAP Pallet Cost dataset to populate Plant_2 (column V) with Plant (column J) from Master Reference. (2) Match Plant (column A) from Master Reference with Plant_2 (column V) from SAP Pallet Cost dataset to populate Final Plant (column W) with Plant Combination (column B) from Master Reference. (3) Match Plnt (column V) from Master Reference with Final Plant (column W) from SAP Pallet Cost dataset to populate Country (column X) with Rep.Cntry (column Y) from Master Reference. (4) Match Purch.Doc. from PO Reference with Purchasing Document (column R) from SAP Pallet Cost dataset to populate Name 1 (column Y) from PO Reference. (5) Match Purch.Doc. from PO Reference with Purchasing Document (column R) from SAP Pallet Cost dataset to populate Short text (column Z) from PO Reference. (6) Check that Invoice of Month is not blank, Name 1 is not N/A, and Final Plant is not #N/A; list failing rows as exceptions for review; processing continues. Output: SAP Pallet Cost dataset with Plant_2, Final Plant, Country, Name 1, and Short text populated, plus exception list of failing rows. Frequency: Step 15.",
    "rule_type": "Validation",
    "order_of_execution": 11,
    "enabled": true,
    "conditions": [
      {
        "field": "Cost Centre at plant level",
        "operator": "=",
        "value": "Cost Center"
      },
      {
        "field": "Plant",
        "operator": "=",
        "value": "Plant_2"
      },
      {
        "field": "Plnt",
        "operator": "=",
        "value": "Final Plant"
      },
      {
        "field": "Purch.Doc.",
        "operator": "=",
        "value": "Purchasing Document"
      },
      {
        "field": "Invoice_of_Month",
        "operator": "!=",
        "value": "blank"
      },
      {
        "field": "Name_1",
        "operator": "!=",
        "value": "N/A"
      },
      {
        "field": "Final_Plant",
        "operator": "!=",
        "value": "#N/A"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "SAP Pallet Cost dataset",
      "description": "Plant_2 field populated; Final Plant field populated; Country field populated; Name 1 field populated; Short text field populated; Validated dataset with Invoice of Month, Name 1, and Final Plant fields checked; exception list of failing rows"
    },
    "controls": [],
    "exceptions": [
      "Rows with blank Invoice of Month",
      "Rows with Name 1 = N/A",
      "Rows with Final Plant = #N/A"
    ],
    "context": {
      "system": "SAP",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Step 15"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R012",
    "title": "Append B&M Monthly Upload to B&M Input",
    "description": "Append B&M Monthly Upload rows below the existing rows of sheet B&M Input of the working file without overwriting previous months. Calculate year_mapping (BG) as the concatenation of Year (AU) and Month (AT). Output: B&M Input dataset. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 12,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "Year (AU) & Month (AT)",
          "target_field": "year_mapping_BG"
        }
      }
    ],
    "outputs": {
      "dataset_name": "B&M Input",
      "description": "B&M Monthly Upload rows appended with year mapping field"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "B&M Input sheet",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R013",
    "title": "Derive Invoice of Month from Document Header Text",
    "description": "Calculate Invoice of Month (column U) on the SAP Pallet Cost dataset. Formula: Invoice of Month = first day of the month coded in Document Header Text (column M) in the format M + MM + YY (for example M0726 = 01-Jul-2026). Output: Invoice of Month field on SAP Pallet Cost dataset. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 13,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "first day of the month coded in Document Header Text (M) in the format M + MM + YY",
          "target_field": "invoice_of_month_U"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Invoice of Month",
      "description": "Invoice of Month field derived from Document Header Text"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "SAP Pallet Cost dataset",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R014",
    "title": "Classify CHEP Bookings on SAP Pallet Cost",
    "description": "IF Name 1 contains CHEP (not case sensitive) THEN set Classification = CHEP; ELSE set Classification = Non-CHEP. Target: Classification field on SAP Pallet Cost dataset. Output: SAP Pallet Cost dataset with Classification field populated. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 14,
    "enabled": true,
    "conditions": [
      {
        "field": "Name_1",
        "operator": "LIKE",
        "value": "CHEP"
      }
    ],
    "actions": [
      {
        "type": "reclassify",
        "parameters": {
          "condition": "Name 1 contains CHEP (not case sensitive)",
          "formula": "CHEP",
          "target_field": "Classification"
        }
      },
      {
        "type": "reclassify",
        "parameters": {
          "condition": "ELSE",
          "formula": "Non-CHEP",
          "target_field": "Classification"
        }
      }
    ],
    "outputs": {
      "dataset_name": "SAP Pallet Cost dataset",
      "description": "Classification field populated with CHEP or Non-CHEP values"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "SAP",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R015",
    "title": "Create B&M Pivot by Plant and Month",
    "description": "Calculate the sum of TOTAL (column U) grouped by PlantID (column AN), Plant Type (column AO), and year mapping (column BG) on the B&M Input dataset, with Cost Centre (column BB) as selected in the pivot filter. Output: B&M to be invoiced by plant and month.",
    "rule_type": "Calculation",
    "order_of_execution": 15,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "pivot",
        "parameters": {
          "formula": "sum of TOTAL (U) by PlantID (AN) and Plant Type (AO) for each year mapping (BG), with Cost Centre (BB) as selected in the pivot filter",
          "target_field": "B&M to be invoiced by plant and month"
        }
      }
    ],
    "outputs": {
      "dataset_name": "B&M to be invoiced by plant and month",
      "description": "B&M Pivot with sum of TOTAL by PlantID, Plant Type, and year mapping"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "B&M Input dataset",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "[]"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R016",
    "title": "Extract To Be Invoiced and SAP Invoiced by Plant",
    "description": "Extract To Be Invoiced value from B&M Pivot for each plant (PlantID, Plant Type, Country, Cost Centre) and each month from January 2025 to the month before the accrual month. Filters: month BETWEEN January 2025 AND month before accrual month. Output: Summary for Re-Accrual with To Be Invoiced populated by plant and month. Also extract SAP Invoiced value from WE SAP Pivot for each plant and month from January 2025 to the month before the accrual month; if value not found, use 0. Output: Summary for Re-Accrual with SAP Invoiced populated by plant and month. Frequency: monthly.",
    "rule_type": "Sourcing",
    "order_of_execution": 16,
    "enabled": true,
    "conditions": [
      {
        "field": "month",
        "operator": "BETWEEN",
        "value": "January 2025 AND month before accrual month"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Summary for Re-Accrual",
      "description": "PlantID, Plant Type, Country, Cost Centre, To Be Invoiced by month; PlantID, Plant Type, Country, Cost Centre, SAP Invoiced by month"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "B&M Pivot",
      "process": "Pallets Accrual",
      "timing": "monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R017",
    "title": "Apply Accrual Exclusions to Calculation Input",
    "description": "Validate Calculation Input dataset by excluding rows that meet any of the following criteria: Final_plant IN (#N/A, out of scope, repack, BCS, BiP); Plant_Code IN (Transit point, COPACK, REPACK, MSO, CONCESS, POSM, R&D, 0); Plant_Code = E004 AND amount < 1000 (EUR); plant = Romania 3PM. Remaining non-plant amounts above EUR 3,000 are listed for review. Output: Eligible Calculation Input.",
    "rule_type": "Validation",
    "order_of_execution": 17,
    "enabled": true,
    "conditions": [
      {
        "field": "Final_plant",
        "operator": "IN",
        "value": "#N/A, out of scope, repack, BCS, BiP"
      },
      {
        "field": "Plant_Code",
        "operator": "IN",
        "value": "Transit point, COPACK, REPACK, MSO, CONCESS, POSM, R&D, 0"
      },
      {
        "field": "Plant_Code",
        "operator": "=",
        "value": "E004"
      },
      {
        "field": "amount",
        "operator": "<",
        "value": "1000"
      },
      {
        "field": "plant",
        "operator": "=",
        "value": "Romania 3PM"
      },
      {
        "field": "amount",
        "operator": ">",
        "value": "3000"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Eligible Calculation Input",
      "description": "Calculation Input rows after exclusion of out-of-scope plants, transit points, copacks, repacks, MSO, concessions, POSM, R&D, zero plant codes, E004 amounts below EUR 1,000, Romania 3PM plants, and non-plant amounts above EUR 3,000 listed for review"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Unknown",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Unknown"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R018",
    "title": "Validate Final Plant Mapping Coverage",
    "description": "Validate Eligible Calculation Input dataset: Check Final_plant against Masterdata to confirm every eligible row has a Final_plant mapped. Flag rows where Final_plant = null as unmapped. List unmapped plants and their corresponding amounts as exceptions; unmapped amounts are not accrued. Output: Unmapped Plants Exception List.",
    "rule_type": "Validation",
    "order_of_execution": 18,
    "enabled": true,
    "conditions": [
      {
        "field": "Final_plant",
        "operator": "=",
        "value": "null"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Unmapped Plants Exception List",
      "description": "List of plants without Final_plant mapping in Masterdata and their corresponding amounts that will not be accrued"
    },
    "controls": [],
    "exceptions": [
      "Unmapped plants and their amounts are not accrued"
    ],
    "context": {
      "system": "Masterdata",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Unknown"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R019",
    "title": "Validate One-Off Totals and Final Accrual Amount",
    "description": "Validate One-offs_EUR totals in the Excel workbook: Match sum of One-offs_EUR (column W) with In Progress total from Outstanding Notes pivot; if totals are not equal, stop processing. Also validate Final Amount to be Accrued: Match total Final Amount to be Accrued (column T) with total in sheet pivot check with PY; if totals are not equal, stop processing. Output: Validation result. Frequency: Monthly.",
    "rule_type": "Validation",
    "order_of_execution": 19,
    "enabled": true,
    "conditions": [
      {
        "field": "One-offs_EUR",
        "operator": "=",
        "value": "In Progress total from Outstanding Notes pivot"
      },
      {
        "field": "Final Amount to be Accrued",
        "operator": "=",
        "value": "total in sheet pivot check with PY"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Validation result",
      "description": "Validation status indicating whether One-offs_EUR sum equals In Progress total; Validation status indicating whether Final Amount to be Accrued equals pivot check total"
    },
    "controls": [
      "Stop processing if validation fails"
    ],
    "exceptions": [],
    "context": {
      "system": "Excel workbook",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R020",
    "title": "Compare Each Plant with Prior Year Amount",
    "description": "Validate each plant against prior year: Compare each plant with the prior-year amount for the same month from sheet pivot check with PY. Calculate difference and difference % between current and prior-year amounts. Differences against prior year are reported as warnings only. Output: Prior year comparison report with differences. Frequency: Monthly.",
    "rule_type": "Validation",
    "order_of_execution": 20,
    "enabled": true,
    "conditions": [
      {
        "field": "plant",
        "operator": "=",
        "value": "prior-year amount for the same month"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Prior year comparison report",
      "description": "Plant-level comparison showing difference and difference % against prior year amounts"
    },
    "controls": [],
    "exceptions": [
      "Differences against prior year are reported as warnings only"
    ],
    "context": {
      "system": "Excel workbook",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R021",
    "title": "Map Final Plant from Master Reference",
    "description": "Validate B&M Accrual <Mon YY>: Match Plant (CQ) with Plant Combination from Master Reference to derive Final Plant (CR). Output: B&M Accrual <Mon YY> with Final Plant (CR) mapped from Master Reference. Frequency: Monthly.",
    "rule_type": "Validation",
    "order_of_execution": 21,
    "enabled": true,
    "conditions": [
      {
        "field": "Plant",
        "operator": "=",
        "value": "Plant Combination from Master Reference"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "B&M Accrual <Mon YY>",
      "description": "Final Plant (CR) mapped from Master Reference based on Plant (CQ)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Sirius",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R022",
    "title": "Validate BlackLine Journal Balance",
    "description": "Validate the BlackLine journal: Check that the total of posting_key = 40 lines equals the posting_key = 50 balancing line. Check positive amounts (amount > 0) booked on posting_key 40 separately against negative amounts (amount < 0) on posting_key 50. If totals do not balance, stop processing. Output: Validated journal dataset.",
    "rule_type": "Validation",
    "order_of_execution": 22,
    "enabled": true,
    "conditions": [
      {
        "field": "posting_key",
        "operator": "=",
        "value": "40"
      },
      {
        "field": "posting_key",
        "operator": "=",
        "value": "50"
      },
      {
        "field": "amount",
        "operator": ">",
        "value": "0"
      },
      {
        "field": "amount",
        "operator": "<",
        "value": "0"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Validated journal dataset",
      "description": "BlackLine journal with balanced posting key 40 and 50 lines"
    },
    "controls": [],
    "exceptions": [
      "If not balanced, stop processing"
    ],
    "context": {
      "system": "BlackLine",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Step 50"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R023",
    "title": "Reconcile BlackLine with Final Summary",
    "description": "Validate BlackLine template against Final Summary: Match re_accrual_lines_total with Final_Summary_previous_month_re_accrual_total, and match current_month_accrual_lines_total with both Final_Summary_current_month_accrual_total and ACCR_estim_template_total. If a difference exists, stop processing and report the difference. Output: Validated BlackLine template. Frequency: Monthly.",
    "rule_type": "Validation",
    "order_of_execution": 23,
    "enabled": true,
    "conditions": [
      {
        "field": "re_accrual_lines_total",
        "operator": "=",
        "value": "Final_Summary_previous_month_re_accrual_total"
      },
      {
        "field": "current_month_accrual_lines_total",
        "operator": "=",
        "value": "Final_Summary_current_month_accrual_total"
      },
      {
        "field": "current_month_accrual_lines_total",
        "operator": "=",
        "value": "ACCR_estim_template_total"
      }
    ],
    "actions": [],
    "outputs": {
      "dataset_name": "Validated BlackLine template",
      "description": "BlackLine template reconciled with Final Summary and ACCR estim template totals"
    },
    "controls": [],
    "exceptions": [
      "If a difference exists, stop processing and report the difference"
    ],
    "context": {
      "system": "BlackLine",
      "process": "SCFS Pallet Accrual",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R024",
    "title": "Calculate Monthly Re-Accrual by Plant",
    "description": "Calculate Re-Accrual for each plant and month on Summary for Re-Accrual sheet. Formula: Re-Accrual = MAX(0, To Be Invoiced - SAP Invoiced). Output: Summary for Re-Accrual sheet with Re-Accrual by plant and month. Frequency: monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 24,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "MAX(0, To Be Invoiced - SAP Invoiced)",
          "target_field": "Re-Accrual"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Summary for Re-Accrual",
      "description": "PlantID, Plant Type, Country, Cost Centre, Re-Accrual by month"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Excel",
      "process": "Pallets Accrual",
      "timing": "monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R025",
    "title": "Populate Plant_2 on SAP Opening Balance",
    "description": "Populate Plant_2 (T) on SAP Opening Balance dataset using Master Reference as in the Derive Plant and Final Plant step. Output: SAP Opening Balance dataset with Plant_2 populated. Frequency: monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 25,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "using Master Reference as in the Derive Plant and Final Plant step",
          "target_field": "Plant_2"
        }
      }
    ],
    "outputs": {
      "dataset_name": "SAP Opening Balance",
      "description": "Plant_2 (T)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "SAP",
      "process": "Pallets Accrual",
      "timing": "monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R026",
    "title": "Calculate Key on CHEP Raw Data",
    "description": "Calculate Key field on CHEP Raw Data dataset. Formula: Key = sender (R) & Receiver (AF), stored as a value. Output: CHEP Raw Data with Key field populated. Frequency: monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 26,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "sender (R) & Receiver (AF)",
          "target_field": "Key"
        }
      }
    ],
    "outputs": {
      "dataset_name": "CHEP Raw Data",
      "description": "Key"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "CHEP",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R027",
    "title": "Derive Copack Flag on CHEP Raw Data",
    "description": "Populate Copack field on CHEP Raw Data dataset. Formula: Copack = Copack (G) from Copack Reference where Key (F) = Key (BC). When no match is found (#N/A), the movement is not copack and remains eligible for the accrual. Output: CHEP Raw Data with Copack flag populated. Frequency: monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 27,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "Copack (G) from Copack Reference where Key (F) = Key (BC)",
          "target_field": "Copack"
        }
      }
    ],
    "outputs": {
      "dataset_name": "CHEP Raw Data",
      "description": "Copack flag"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "CHEP",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R028",
    "title": "Create Summary by Plant without Copack",
    "description": "Pivot CHEP Raw Data dataset to create Plant Summary without Copack. Filters: Copack = #N/A, excluding any Plant Code activities named copack. Formula: sum of Total Cost (L) by Country (B), Category (D), Plant Code (C) and Plant Name (E). Output: Plant Summary without Copack. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 28,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "pivot",
        "parameters": {
          "formula": "sum of Total Cost (L) by Country (B), Category (D), Plant Code (C) and Plant Name (E)",
          "target_field": "Plant Summary without Copack"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Plant Summary without Copack",
      "description": "Pivoted summary of Total Cost by Country, Category, Plant Code and Plant Name excluding Copack activities"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "CHEP",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R029",
    "title": "Create Summary by Plant DACH PL Pivot",
    "description": "Pivot CHEP Raw Data dataset to create Summary by Plant DACH PL. Filters: Copack = #N/A, pt (O) IN (8, 16), Country IN (Austria, Germany, Poland, Switzerland). Formula: sum of Total Cost by plant for repack amounts above EUR 1,000. Output: Summary by Plant DACH PL. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 29,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "pivot",
        "parameters": {
          "formula": "sum of Total Cost by plant for repack amounts above EUR 1,000",
          "target_field": "Summary by Plant DACH PL"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Summary by Plant DACH PL",
      "description": "Pivoted summary of Total Cost for DACH and Poland repack activities where amount exceeds EUR 1,000"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "CHEP",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R030",
    "title": "Populate Calculation Input and Final Plant",
    "description": "Copy Country, Category, Plant Code, Plant Name, and Total Cost from Adjusted Plant Summary into Calculation Input sheet columns A to E. Extend formulas in columns F to M: Key1 (F) = Plant Code & Plant Name; basic mapping (G) from B&M mapping basic; multi-plant (H), repack and MSO (I), manual calculation (J), and out-of-scope country (K) from B&M mapping exemptions; Final plant (L) = exemption result where exemption applies, otherwise basic mapping result; Amount to accrue (M) = Total Cost. Output: Calculation Input with Final plant. Frequency: monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 30,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy Country, Category, Plant Code, Plant Name, Total Cost from Adjusted Plant Summary to columns A to E",
          "target_field": "input_b_and_m.country"
        }
      },
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy Country, Category, Plant Code, Plant Name, Total Cost from Adjusted Plant Summary to columns A to E",
          "target_field": "input_b_and_m.category"
        }
      },
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy Country, Category, Plant Code, Plant Name, Total Cost from Adjusted Plant Summary to columns A to E",
          "target_field": "input_b_and_m.plant_code"
        }
      },
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy Country, Category, Plant Code, Plant Name, Total Cost from Adjusted Plant Summary to columns A to E",
          "target_field": "input_b_and_m.plant_name"
        }
      },
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy Country, Category, Plant Code, Plant Name, Total Cost from Adjusted Plant Summary to columns A to E",
          "target_field": "input_b_and_m.total_cost"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "Plant Code & Plant Name",
          "target_field": "input_b_and_m.key1"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "from B&M mapping basic",
          "target_field": "input_b_and_m.basic_mapping"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "from B&M mapping exemptions",
          "target_field": "input_b_and_m.multi_plant"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "from B&M mapping exemptions",
          "target_field": "input_b_and_m.repack_and_mso"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "from B&M mapping exemptions",
          "target_field": "input_b_and_m.manual_calculation"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "from B&M mapping exemptions",
          "target_field": "input_b_and_m.out_of_scope_country"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "exemption result where exemption applies, otherwise basic mapping result",
          "target_field": "input_b_and_m.final_plant"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "Total Cost",
          "target_field": "input_b_and_m.amount_to_accrue"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Calculation Input",
      "description": "Country, Category, Plant Code, Plant Name, Total Cost, Key1, basic mapping, multi-plant, repack and MSO, manual calculation, out-of-scope country, Final plant, Amount to accrue"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Excel workbook",
      "process": "SCFS Pallet Accrual",
      "timing": "monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R031",
    "title": "Determine Date of ACT from CHEP Raw Data",
    "description": "Calculate Date of ACT (L) in sheet ACCR estim template. Formula: Date of ACT = DateTimeCreate (BB) of the CHEP Raw Data minus 1 day (example for October 2026: 26-Oct-2026 - 1 = 25-Oct-2026). Output: Date of ACT. Frequency: monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 31,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "DateTimeCreate - 1 day",
          "target_field": "Date_of_ACT"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Date of ACT",
      "description": "Date of ACT"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "ACCR estim template",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R032",
    "title": "Calculate Working Days Covered in ACCR estim template",
    "description": "Calculate No. Of ACT Days on ACCR estim template sheet. Formula: No. Of ACT Days = NETWORKDAYS(First Day of Month, Date of ACT). Example: October 2026 result is 17 working days. Output: ACCR estim template with No. Of ACT Days (P) populated. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 32,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "NETWORKDAYS(First Day of Month, Date of ACT)",
          "target_field": "No. Of ACT Days"
        }
      }
    ],
    "outputs": {
      "dataset_name": "ACCR estim template",
      "description": "No. Of ACT Days (P), Year (J), Month (K), Key to calendar (M), First Day of Month (N), Last Day of Month (O)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Excel",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R033",
    "title": "Determine Days to be Accrued in ACCR estim template",
    "description": "Populate No. of Days to be Accrued (Q) on ACCR estim template sheet. Formula: No. of Days to be Accrued = 5 working days, applied to all plants. Output: ACCR estim template with No. of Days to be Accrued (Q) populated. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 33,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "5",
          "target_field": "No. of Days to be Accrued"
        }
      }
    ],
    "outputs": {
      "dataset_name": "ACCR estim template",
      "description": "No. of Days to be Accrued (Q)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Excel",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R034",
    "title": "Calculate Final Amount to be Accrued by Plant",
    "description": "Populate sheet ACCR estim template for each Final Plant with the following fields sourced from Masterdata: Country (C), Final Plant (D), Plant Name (E), Plant type (F), cc (G); GL (H) = 41612001; Amount in Loc Curr (I) from Amount by Final Plant; FX (R) by country from FX Reference. Calculate Amount in EUR (S) = Amount in Loc Curr / FX. Calculate Final Amount to be Accrued (T) = Amount in EUR + Amount in EUR / No. Of ACT Days x No. of Days to be Accrued + One-offs_EUR. Calculate Period (U) = P + month (MM) + year (YY). Calculate Item Text (V) = Period & ACR & Country & PAL CHEP & Final Plant. Output: ACCR estim template with current-month accrual by plant. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 34,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "Amount in Loc Curr / FX",
          "target_field": "Amount_in_EUR"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "Amount in EUR + Amount in EUR / No. Of ACT Days x No. of Days to be Accrued + One-offs_EUR",
          "target_field": "Final_Amount_to_be_Accrued"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "P + month (MM) + year (YY)",
          "target_field": "Period"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "Period & ACR & Country & PAL CHEP & Final Plant",
          "target_field": "Item_Text"
        }
      }
    ],
    "outputs": {
      "dataset_name": "ACCR estim template",
      "description": "Current-month accrual by plant with Country (C), Final Plant (D), Plant Name (E), Plant type (F), cc (G), GL (H), Amount in Loc Curr (I), FX (R), Amount in EUR (S), Final Amount to be Accrued (T), Period (U), Item Text (V)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Masterdata, FX Reference",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R035",
    "title": "Extract Plant from Line Item Text",
    "description": "Calculate Plant (CQ) in sheet B&M Accrual <Mon YY> of the working file by extracting the last four characters of Line Item Text. Formula: Plant (CQ) = RIGHT(Line Item Text, 4). Output: B&M Accrual <Mon YY> with Plant (CQ) extracted from Line Item Text. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 35,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "RIGHT(Line Item Text, 4)",
          "target_field": "Plant"
        }
      }
    ],
    "outputs": {
      "dataset_name": "B&M Accrual <Mon YY>",
      "description": "Plant (CQ) extracted from Line Item Text"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Sirius",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R036",
    "title": "Calculate Current Month Accrual per Plant",
    "description": "Calculate Current Month Accrual as sum of Amount (Y) by Final Plant using pivot CU:CV in sheet B&M Accrual <Mon YY>. Formula: Current Month Accrual = sum of Amount (Y) by Final Plant. Output: B&M Accrual <Mon YY> with Current Month Accrual by plant. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 36,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "sum of Amount (Y) by Final Plant",
          "target_field": "Current Month Accrual"
        }
      }
    ],
    "outputs": {
      "dataset_name": "B&M Accrual <Mon YY>",
      "description": "Current Month Accrual by Final Plant (pivot CU:CV)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Sirius",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R037",
    "title": "Populate Final Summary Plant Master Data",
    "description": "Populate sheet Final Summary with plant master data for each plant. Copy Plant (column A), Plant Type (column B), Country (column C) from Master Reference, and Cost Centre (column D) from Master Reference. Output: Final Summary with Plant, Plant Type, Country, and Cost Centre populated.",
    "rule_type": "Calculation",
    "order_of_execution": 37,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy from Master Reference",
          "target_field": "Plant"
        }
      },
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy from Master Reference",
          "target_field": "Plant_Type"
        }
      },
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy from Master Reference",
          "target_field": "Country"
        }
      },
      {
        "type": "copy",
        "parameters": {
          "formula": "Copy from Master Reference",
          "target_field": "Cost_Centre"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Final Summary",
      "description": "Plant, Plant Type, Country, Cost Centre"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Final Summary sheet",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "[]"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R038",
    "title": "Calculate Final Summary Opening Balance",
    "description": "Calculate Opening balance (column E) in sheet Final Summary. Formula: Opening_balance (E) = Opening Balance by plant from SAP Opening Balance Pivot. Output: Final Summary with Opening_balance by plant.",
    "rule_type": "Calculation",
    "order_of_execution": 38,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "Opening Balance by plant",
          "target_field": "Opening_balance"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Final Summary",
      "description": "Opening balance by plant"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Final Summary sheet",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "[]"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R039",
    "title": "Calculate Final Summary Monthly Re-Accrual Columns",
    "description": "Calculate monthly Re-accrual columns (F to Z) in sheet Final Summary. Formula: monthly_Re-accrual_columns_F_to_Z = Selected Re-Accrual by plant and month from the Selected Re-Accrual dataset. Output: Final Summary with monthly re-accrual values in columns F to Z.",
    "rule_type": "Calculation",
    "order_of_execution": 39,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "Selected Re-Accrual by plant and month",
          "target_field": "monthly_Re-accrual_columns_F_to_Z"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Final Summary",
      "description": "Monthly re-accrual columns F to Z by plant and month"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Final Summary sheet",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "[]"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R040",
    "title": "Calculate Final Summary Final Result",
    "description": "Calculate Final Result (column AC) in sheet Final Summary. Formula: Final_Result (AC) = Total Accrual + Opening balance. Output: Final Summary with Final_Result in column AC.",
    "rule_type": "Calculation",
    "order_of_execution": 40,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "Total Accrual + Opening balance",
          "target_field": "Final_Result"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Final Summary",
      "description": "Final Result column AC"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Final Summary sheet",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "[]"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R041",
    "title": "Create Summary Sheet with Accrual Totals",
    "description": "Populate sheet Summary with calculated totals from Final Summary. Calculate Opening Balance = total Final Summary Opening balance; Re-Accrual for previous month = total of the previous-month re-accrual column; Accrual for current month = total of the current-month accrual column; Total Accrual = Re-Accrual + Accrual; Final Result = Opening Balance + Total Accrual - amounts excluded for blocked cost centres. Output: Summary. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 41,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "total Final Summary Opening balance",
          "target_field": "Opening Balance"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "total of the previous-month re-accrual column",
          "target_field": "Re-Accrual for previous month"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "total of the current-month accrual column",
          "target_field": "Accrual for current month"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "Re-Accrual + Accrual",
          "target_field": "Total Accrual"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "Opening Balance + Total Accrual - amounts excluded for blocked cost centres",
          "target_field": "Final Result"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Summary",
      "description": "Opening Balance, Re-Accrual for previous month, Accrual for current month, Total Accrual, Final Result"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Excel",
      "process": "SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R042",
    "title": "Create Non-Split Plant Lines for Journal",
    "description": "Populate sheet other than Split for Final Summary rows where Plant does not contain / and the amount is not 0 or blank. Create one line for the previous-month re-accrual column and one line for the current-month accrual column. Populate Plant (A), Plant Type (B), Country (C), Cost Centre (D), amount (E), and Text (F) built as in the split step. Output: Non-split plant lines. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 42,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "populate",
        "parameters": {
          "formula": "Populate from Final Summary rows where Plant does not contain / and amount is not 0 or blank",
          "target_field": "Plant"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "Populate from Final Summary rows where Plant does not contain / and amount is not 0 or blank",
          "target_field": "Plant_Type"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "Populate from Final Summary rows where Plant does not contain / and amount is not 0 or blank",
          "target_field": "Country"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "Populate from Final Summary rows where Plant does not contain / and amount is not 0 or blank",
          "target_field": "Cost_Centre"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "Populate from Final Summary rows where Plant does not contain / and amount is not 0 or blank",
          "target_field": "amount"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "Built as in the split step",
          "target_field": "Text"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Non-split plant lines",
      "description": "Plant (A), Plant Type (B), Country (C), Cost Centre (D), amount (E), Text (F)"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Excel",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R043",
    "title": "Create BlackLine Journal Header Row",
    "description": "Populate the header row (row 4) of sheet Blackline Template with the following field values: Record Type = H; JE Classification = ACCRUALS; Document Type = Y1; Document Date = run date; Posting Date = Document Date; Document Header Text = P + MM + ' + YY + ACR SUDC PALLETS; Header Company Code = 2611; Document Currency = EUR; Translation Date = Document Date; Reversal Reason = 05; Reversal Date = EOMONTH(Document Date, 0) + 1; Calculate Tax = N. Output: Journal header. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 43,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "populate",
        "parameters": {
          "formula": "H",
          "target_field": "Record_Type"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "ACCRUALS",
          "target_field": "JE_Classification"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "Y1",
          "target_field": "Document_Type"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "run date",
          "target_field": "Document_Date"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "Document Date",
          "target_field": "Posting_Date"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "P + MM + ' + YY + ACR SUDC PALLETS",
          "target_field": "Document_Header_Text"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "2611",
          "target_field": "Header_Company_Code"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "EUR",
          "target_field": "Document_Currency"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "Document Date",
          "target_field": "Translation_Date"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "05",
          "target_field": "Reversal_Reason"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "EOMONTH(Document Date, 0) + 1",
          "target_field": "Reversal_Date"
        }
      },
      {
        "type": "populate",
        "parameters": {
          "formula": "N",
          "target_field": "Calculate_Tax"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Journal header",
      "description": "Record Type, JE Classification, Document Type, Document Date, Posting Date, Document Header Text, Header Company Code, Document Currency, Translation Date, Reversal Reason, Reversal Date, Calculate Tax"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "BlackLine",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R044",
    "title": "Create Balancing Line in BlackLine Template",
    "description": "Add the balancing line after the last journal line in sheet Blackline Template. Set the following fields: Record Type = L; Posting Key = 50; Cross Company Code = 2611; Account = 14410014; Amount = SUM of all journal line amounts; Line Item Text = P + MM + ' + YY + ACR PAL Other. Output: Balancing line. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 44,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "calculate",
        "parameters": {
          "formula": "L",
          "target_field": "Record Type"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "50",
          "target_field": "Posting Key"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "2611",
          "target_field": "Cross Company Code"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "14410014",
          "target_field": "Account"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "SUM of all journal line amounts",
          "target_field": "Amount"
        }
      },
      {
        "type": "calculate",
        "parameters": {
          "formula": "P + MM + ' + YY + ACR PAL Other",
          "target_field": "Line Item Text"
        }
      }
    ],
    "outputs": {
      "dataset_name": "Balancing line",
      "description": "Balancing line with Record Type, Posting Key, Cross Company Code, Account, Amount, Line Item Text"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "BlackLine",
      "process": "Pallets Accrual",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R045",
    "title": "Save BlackLine Upload File",
    "description": "Save sheet Blackline Template as file SUDC Pallet Accrual <Mon'YY>.xlsx in the output folder to create the BlackLine upload file. Output: BlackLine upload file. Frequency: Monthly.",
    "rule_type": "Calculation",
    "order_of_execution": 45,
    "enabled": true,
    "conditions": [],
    "actions": [
      {
        "type": "save",
        "parameters": {
          "formula": "Save sheet Blackline Template as file SUDC Pallet Accrual <Mon'YY>.xlsx",
          "target_field": "BlackLine_upload_file"
        }
      }
    ],
    "outputs": {
      "dataset_name": "BlackLine upload file",
      "description": "SUDC Pallet Accrual <Mon'YY>.xlsx file saved in output folder"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "BlackLine",
      "process": "SCFS Pallet Accrual",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R046",
    "title": "Upload BlackLine Journal Month-End",
    "description": "Upload the BlackLine upload file to BlackLine for posting and save the files in the month-end folder. Frequency: monthly.",
    "rule_type": "Sourcing",
    "order_of_execution": 46,
    "enabled": false,
    "conditions": [],
    "actions": [],
    "outputs": {
      "dataset_name": "BlackLine upload file",
      "description": "Journal entry posted to BlackLine and files saved in month-end folder"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "BlackLine",
      "process": "Pallets Accrual",
      "timing": "monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  },
  {
    "sub_system_id": "007",
    "document_name": "DTP_SCF_Pallets_Accrual",
    "sub_system_name": "Journal Entry",
    "rule_id": "DTP_SCF_Pallets_Accrual - R047",
    "title": "Extract Pallet Accrual Data Sirius",
    "description": "Extract pallet accrual data from Sirius for DTP SCFS PALLET ACCRUAL processing. Output: Pallet accrual dataset. Frequency: Monthly.",
    "rule_type": "Sourcing",
    "order_of_execution": 47,
    "enabled": true,
    "conditions": [],
    "actions": [],
    "outputs": {
      "dataset_name": "Pallet accrual dataset",
      "description": "Pallet accrual data for DTP SCFS PALLET ACCRUAL processing"
    },
    "controls": [],
    "exceptions": [],
    "context": {
      "system": "Sirius",
      "process": "DTP SCFS PALLET ACCRUAL",
      "timing": "Monthly"
    },
    "tags": [
      "B&M",
      "monthly upload",
      "accrual month",
      "Europe costs",
      "pallet accrual"
    ]
  }
] as const satisfies readonly PalletAccrualRule[];
