export type Option = {
  label: string;
  value: string;
};

export type BaseField = {
  id: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox-group"
    | "upload";
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  prefix?: string;
  options?: Option[];
  accept?: string;
  multiple?: boolean;
  hasOtherSpecify?: boolean;
  hasAiAssist?: boolean;
  visibleWhen?: { fieldId: string; value: string | string[] };
};

export type Section = {
  id: string;
  number: string;
  title: string;
  description?: string;
  fields: BaseField[];
};

export const contactRoleOptions: Option[] = [
  { label: "Primary Contact", value: "Primary Contact" },
  { label: "Accounts Payable", value: "Accounts Payable" },
  { label: "Accounts Receivable", value: "Accounts Receivable" },
  { label: "Finance Lead", value: "Finance Lead" },
  { label: "Operations", value: "Operations" },
  { label: "Other", value: "Other" },
];

export const intakeSections: Section[] = [
  {
    id: "company-identity",
    number: "01",
    title: "Company Identity",
    fields: [
      { id: "legalCompanyName", label: "Legal Company Name", type: "text", required: true, placeholder: "Full registered legal name" },
      { id: "website", label: "Website", type: "text", prefix: "https://", placeholder: "yourcompany.com" },
      {
        id: "entityType",
        label: "Entity / Corporation Type",
        type: "select",
        required: true,
        options: [
          { label: "LLC", value: "LLC" },
          { label: "S-Corp", value: "S-Corp" },
          { label: "C-Corp", value: "C-Corp" },
          { label: "Sole Proprietorship", value: "Sole Proprietorship" },
          { label: "Partnership", value: "Partnership" },
          { label: "Non-Profit (501c3)", value: "Non-Profit (501c3)" },
          { label: "Limited Company (Ltd)", value: "Limited Company (Ltd)" },
          { label: "LLP", value: "LLP" },
          { label: "PLC", value: "PLC" },
          { label: "Sole Trader", value: "Sole Trader" },
          { label: "Other / International", value: "Other / International" },
        ],
      },
      { id: "incorporationDate", label: "Date of Incorporation", type: "date" },
      {
        id: "jurisdiction",
        label: "Primary Jurisdiction",
        type: "select",
        required: true,
        hasOtherSpecify: true,
        options: [
          { label: "United States", value: "United States" },
          { label: "United Kingdom", value: "United Kingdom" },
          { label: "European Union", value: "European Union" },
          { label: "UAE / Middle East", value: "UAE / Middle East" },
          { label: "Southeast Asia", value: "Southeast Asia" },
          { label: "Other", value: "Other" },
        ],
      },
      { id: "registeredAddress", label: "Registered Business Address", type: "text", required: true, placeholder: "Street, city, state/region, postal code, country" },
      { id: "registrationNumber", label: "FEIN / Company Registration No.", type: "text", required: true, placeholder: "e.g. 12-3456789" },
      { id: "taxNumber", label: "VAT / Sales Tax Registration No.", type: "text", placeholder: "If applicable" },
      {
        id: "fiscalYearEnd",
        label: "Fiscal Year End",
        type: "select",
        required: true,
        options: [
          { label: "December (12/31)", value: "December (12/31)" },
          { label: "March (3/31)", value: "March (3/31)" },
          { label: "June (6/30)", value: "June (6/30)" },
          { label: "September (9/30)", value: "September (9/30)" },
          { label: "Other", value: "Other" },
        ],
      },
      {
        id: "timezone",
        label: "Timezone",
        type: "select",
        required: true,
        hasOtherSpecify: true,
        options: [
          { label: "EST (UTC-5)", value: "EST (UTC-5)" },
          { label: "CST (UTC-6)", value: "CST (UTC-6)" },
          { label: "MST (UTC-7)", value: "MST (UTC-7)" },
          { label: "PST (UTC-8)", value: "PST (UTC-8)" },
          { label: "GMT (UTC+0)", value: "GMT (UTC+0)" },
          { label: "CET (UTC+1)", value: "CET (UTC+1)" },
          { label: "GST (UTC+4)", value: "GST (UTC+4)" },
          { label: "SGT (UTC+8)", value: "SGT (UTC+8)" },
          { label: "Other", value: "Other" },
        ],
      },
    ],
  },
  {
    id: "business-overview",
    number: "02",
    title: "Business Overview",
    fields: [
      { id: "revenueModel", label: "Nature of Business & Revenue Model", type: "textarea", hasAiAssist: true, placeholder: "What does your company do, and how does it generate revenue?" },
      {
        id: "industry",
        label: "Industry / Sector",
        type: "select",
        required: true,
        options: [
          { label: "Technology / SaaS", value: "Technology / SaaS" },
          { label: "E-Commerce / Retail", value: "E-Commerce / Retail" },
          { label: "Financial Services", value: "Financial Services" },
          { label: "Professional Services", value: "Professional Services" },
          { label: "Healthcare", value: "Healthcare" },
          { label: "Real Estate", value: "Real Estate" },
          { label: "Hospitality / F&B", value: "Hospitality / F&B" },
          { label: "Media / Creative", value: "Media / Creative" },
          { label: "Manufacturing", value: "Manufacturing" },
          { label: "Logistics / Supply Chain", value: "Logistics / Supply Chain" },
          { label: "Other", value: "Other" },
        ],
      },
      {
        id: "annualRevenueRange",
        label: "Annual Revenue Range",
        type: "select",
        options: [
          { label: "Pre-revenue / Startup", value: "Pre-revenue / Startup" },
          { label: "Under $250K", value: "Under $250K" },
          { label: "$250K - $1M", value: "$250K - $1M" },
          { label: "$1M - $5M", value: "$1M - $5M" },
          { label: "$5M - $20M", value: "$5M - $20M" },
          { label: "$20M+", value: "$20M+" },
        ],
      },
      {
        id: "employeeCount",
        label: "Number of Employees",
        type: "select",
        options: [
          { label: "Solo / 1", value: "Solo / 1" },
          { label: "2 - 10", value: "2 - 10" },
          { label: "11 - 50", value: "11 - 50" },
          { label: "51 - 200", value: "51 - 200" },
          { label: "200+", value: "200+" },
        ],
      },
      { id: "operatingCountries", label: "Operating Countries", type: "text", placeholder: "e.g. US, UK, Thailand" },
      { id: "preferredChannel", label: "Preferred Communication Channel", type: "radio", required: true, options: [{ label: "Email", value: "Email" }, { label: "WhatsApp", value: "WhatsApp" }, { label: "Slack", value: "Slack" }, { label: "Teams", value: "Teams" }] },
    ],
  },
  {
    id: "access-credentials",
    number: "03",
    title: "Access & Credentials",
    fields: [
      {
        id: "accountingSoftware",
        label: "Accounting Software",
        type: "select",
        required: true,
        hasOtherSpecify: true,
        options: [
          { label: "QuickBooks Online", value: "QuickBooks Online" },
          { label: "QuickBooks Desktop", value: "QuickBooks Desktop" },
          { label: "Xero", value: "Xero" },
          { label: "Sage", value: "Sage" },
          { label: "NetSuite", value: "NetSuite" },
          { label: "Wave", value: "Wave" },
          { label: "FreshBooks", value: "FreshBooks" },
          { label: "None / Setting Up", value: "None / Setting Up" },
          { label: "Other", value: "Other" },
        ],
      },
      {
        id: "payrollProvider",
        label: "Payroll Provider",
        type: "select",
        hasOtherSpecify: true,
        options: [
          { label: "ADP", value: "ADP" },
          { label: "Paychex", value: "Paychex" },
          { label: "Gusto", value: "Gusto" },
          { label: "Rippling", value: "Rippling" },
          { label: "Deel", value: "Deel" },
          { label: "Remote", value: "Remote" },
          { label: "N/A - No payroll", value: "N/A - No payroll" },
          { label: "Other", value: "Other" },
        ],
      },
      {
        id: "cloudStorage",
        label: "Cloud Storage Platform",
        type: "radio",
        options: [
          { label: "Google Drive", value: "Google Drive" },
          { label: "Dropbox", value: "Dropbox" },
          { label: "SharePoint", value: "SharePoint" },
          { label: "Box", value: "Box" },
          { label: "None", value: "None" },
        ],
      },
      {
        id: "thirdPartyIntegrations",
        label: "Third-Party Integrations with Accounting Software",
        type: "checkbox-group",
        hasOtherSpecify: true,
        options: [
          { label: "Shopify", value: "Shopify" },
          { label: "Stripe", value: "Stripe" },
          { label: "Square", value: "Square" },
          { label: "Gusto", value: "Gusto" },
          { label: "Amazon Seller", value: "Amazon Seller" },
          { label: "PayPal", value: "PayPal" },
          { label: "Bill.com", value: "Bill.com" },
          { label: "Expensify", value: "Expensify" },
          { label: "HubSpot", value: "HubSpot" },
          { label: "Other", value: "Other" },
        ],
      },
      { id: "bankAccountsList", label: "Please list all the bank accounts / credit cards for the business", type: "textarea", placeholder: "e.g. Chase Business Checking, Amex Platinum, Bank of America Savings..." },
      { id: "previousAccountant", label: "Previous Accountant / Bookkeeper", type: "text", placeholder: "Name or firm" },
      {
        id: "existingSops",
        label: "Existing SOPs for Accounting Functions?",
        type: "radio",
        options: [
          { label: "Yes - will share", value: "Yes - will share" },
          { label: "No", value: "No" },
        ],
      },
      { id: "sopsUpload", label: "SOP Documents", type: "upload", accept: ".pdf,.docx,.doc,.xlsx,.xls", multiple: true, visibleWhen: { fieldId: "existingSops", value: "Yes - will share" } },
    ],
  },
  {
    id: "historical-data",
    number: "04",
    title: "Historical Data & Documents",
    fields: [
      { id: "outstandingBacklog", label: "Outstanding Backlog or Open Items?", type: "radio", options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }, { label: "Unsure", value: "Unsure" }] },
      { id: "fixedAssetRegister", label: "Fixed Asset Register Available?", type: "radio", options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }, { label: "N/A", value: "N/A" }] },
      { id: "backlogNotes", label: "Backlog / Open Items Notes", type: "textarea", placeholder: "Describe any known backlog, corrections needed, or missing records..." },
      { id: "lastYearFinancials", label: "Last Year Financials", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "loanLeaseAgreements", label: "Loan Agreements & Lease Contracts", type: "upload", accept: ".pdf,.docx,.doc", multiple: true },
      { id: "vatReturns", label: "UK VAT Returns", type: "upload", accept: ".pdf,.xlsx,.xls", multiple: true, visibleWhen: { fieldId: "jurisdiction", value: "United Kingdom" } },
      { id: "ctTaxReturns", label: "UK CT Tax Returns", type: "upload", accept: ".pdf,.xlsx,.xls", multiple: true, visibleWhen: { fieldId: "jurisdiction", value: "United Kingdom" } },
      { id: "salesTaxReturns", label: "US Sales Tax Returns", type: "upload", accept: ".pdf,.xlsx,.xls", multiple: true, visibleWhen: { fieldId: "jurisdiction", value: "United States" } },
      { id: "federalTaxReturns", label: "US Federal Tax Returns", type: "upload", accept: ".pdf,.xlsx,.xls", multiple: true, visibleWhen: { fieldId: "jurisdiction", value: "United States" } },
    ],
  },
];

export const requiredFieldIds = intakeSections
  .flatMap((section) => section.fields)
  .filter((field) => field.required)
  .map((field) => field.id);
