const testlabs = [
  { "lab/name": "Fasting Plasma Glucose (FPG)", "lab/value": 98, "lab/when": "2020-01-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Fasting Plasma Glucose (FPG)", "lab/value": 102, "lab/when": "2020-06-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Fasting Plasma Glucose (FPG)", "lab/value": 105, "lab/when": "2021-01-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Fasting Plasma Glucose (FPG)", "lab/value": 110, "lab/when": "2021-06-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Fasting Plasma Glucose (FPG)", "lab/value": 112, "lab/when": "2022-01-15T00:00:00Z", "lab/demographic": 1 },

  { "lab/name": "Oral Glucose Tolerance Test (OGTT)", "lab/value": 128, "lab/when": "2020-01-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Oral Glucose Tolerance Test (OGTT)", "lab/value": 135, "lab/when": "2020-06-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Oral Glucose Tolerance Test (OGTT)", "lab/value": 142, "lab/when": "2021-01-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Oral Glucose Tolerance Test (OGTT)", "lab/value": 150, "lab/when": "2021-06-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Oral Glucose Tolerance Test (OGTT)", "lab/value": 155, "lab/when": "2022-01-15T00:00:00Z", "lab/demographic": 1 },

  { "lab/name": "Random Plasma Glucose", "lab/value": 120, "lab/when": "2020-01-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Random Plasma Glucose", "lab/value": 126, "lab/when": "2020-06-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Random Plasma Glucose", "lab/value": 131, "lab/when": "2021-01-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Random Plasma Glucose", "lab/value": 138, "lab/when": "2021-06-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Random Plasma Glucose", "lab/value": 140, "lab/when": "2022-01-15T00:00:00Z", "lab/demographic": 1 },

  { "lab/name": "Urine Albumin-to-Creatinine Ratio (UACR)", "lab/value": 12, "lab/when": "2020-01-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Urine Albumin-to-Creatinine Ratio (UACR)", "lab/value": 14, "lab/when": "2020-06-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Urine Albumin-to-Creatinine Ratio (UACR)", "lab/value": 18, "lab/when": "2021-01-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Urine Albumin-to-Creatinine Ratio (UACR)", "lab/value": 20, "lab/when": "2021-06-15T00:00:00Z", "lab/demographic": 1 },
  { "lab/name": "Urine Albumin-to-Creatinine Ratio (UACR)", "lab/value": 24, "lab/when": "2022-01-15T00:00:00Z", "lab/demographic": 1 }
]

const visits = [
  "2020-01-15T00:00:00Z",
  "2020-06-15T00:00:00Z",
  "2021-01-15T00:00:00Z",
  "2021-06-15T00:00:00Z",
  "2022-01-15T00:00:00Z"
]

export default {
  testlabs,
  visits,
  label: 'glucose panel 1'
}
