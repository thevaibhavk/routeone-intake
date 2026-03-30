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
};

export type Section = {
  id: string;
  number: string;
  title: string;
  description?: string;
  fields: BaseField[];
};

export const contactRoleSuggestions = [
  "Primary Contact",
  "Accounts Payable",
  "Accounts Receivable",
  "Finance Lead",
  "Operations",
];

export const intakeSections: Section[] = [
  {
    id: "company-identity",
    number: "01",
    title: "Company Identity",
    fields: [
      { id: "legalCompanyName", label: "Legal Company Name", type: "text", required: true, placeholder: "Full registered legal name" },
      { id: "dbaName", label: "DBA / Trading Name", type: "text", placeholder: "If different from legal name" },
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
      { id: "incorporationDate", label: "Date of Incorporation", type: "date", required: true },
      {
        id: "jurisdiction",
        label: "Primary Jurisdiction",
        type: "select",
        required: true,
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
      { id: "revenueModel", label: "Nature of Business & Revenue Model", type: "textarea", required: true, placeholder: "What does your company do, and how does it generate revenue?" },
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
      { id: "organizationStructure", label: "Organisation Structure", type: "text", placeholder: "e.g. Parent company, subsidiaries, group entities" },
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
        id: "bankAccessLevel",
        label: "Online Banking Access Level",
        type: "radio",
        options: [
          { label: "Transaction initiating", value: "Transaction initiating" },
          { label: "View only", value: "View only" },
          { label: "Not yet provided", value: "Not yet provided" },
        ],
      },
      {
        id: "thirdPartyIntegrations",
        label: "Third-Party Integrations with Accounting Software",
        type: "checkbox-group",
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
      { id: "previousAccountingSystem", label: "Previous Accounting System", type: "text", placeholder: "e.g. QuickBooks Desktop, Sage" },
      { id: "creditCardProcess", label: "Credit Cards (access / reconciliation)", type: "text", placeholder: "Provider, who holds cards, how reconciled" },
      { id: "previousAccountant", label: "Previous Accountant / Bookkeeper", type: "text", placeholder: "Name or firm" },
      { id: "chartOfAccountsUpload", label: "Chart of Accounts", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "trialBalancesUpload", label: "Historical Trial Balances", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "financialStatementsUpload", label: "Monthly P&L & Balance Sheets", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      {
        id: "existingSops",
        label: "Existing SOPs for Accounting Functions?",
        type: "radio",
        options: [
          { label: "Yes - will share", value: "Yes - will share" },
          { label: "No", value: "No" },
          { label: "In progress", value: "In progress" },
        ],
      },
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
      { id: "priorYearAuditedFinancials", label: "Prior Year Audited Financials", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "loanLeaseAgreements", label: "Loan Agreements & Lease Contracts", type: "upload", accept: ".pdf,.docx,.doc", multiple: true },
      { id: "vatReturns", label: "UK VAT Returns", type: "upload", accept: ".pdf,.xlsx,.xls", multiple: true },
      { id: "ctTaxReturns", label: "UK CT Tax Returns", type: "upload", accept: ".pdf,.xlsx,.xls", multiple: true },
      { id: "salesTaxReturns", label: "US Sales Tax Returns", type: "upload", accept: ".pdf,.xlsx,.xls", multiple: true },
      { id: "federalTaxReturns", label: "US Federal Tax Returns", type: "upload", accept: ".pdf,.xlsx,.xls", multiple: true },
      { id: "payrollDetailsUpload", label: "Payroll Details", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "utilityBillsUpload", label: "Utility Bills & Subscription Renewals", type: "upload", accept: ".pdf,.jpg,.jpeg,.png", multiple: true },
      {
        id: "complianceObligations",
        label: "Compliance Obligations",
        type: "checkbox-group",
        options: [
          { label: "US Federal Tax Returns", value: "US Federal Tax Returns" },
          { label: "UK Corporation Tax (CT)", value: "UK Corporation Tax (CT)" },
          { label: "US Sales Tax (multi-state)", value: "US Sales Tax (multi-state)" },
          { label: "UK VAT Returns", value: "UK VAT Returns" },
          { label: "Payroll Tax Filings", value: "Payroll Tax Filings" },
          { label: "Annual Audit", value: "Annual Audit" },
          { label: "1099 / W-2 Filings", value: "1099 / W-2 Filings" },
          { label: "International Transfer Pricing", value: "International Transfer Pricing" },
        ],
      },
      { id: "financialStatementsAudited", label: "Financial Statements Audited?", type: "radio", options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }, { label: "Pending", value: "Pending" }] },
    ],
  },
  {
    id: "ar-ap-reporting",
    number: "05",
    title: "AR, AP & Reporting Operations",
    description: "Grouped from the original template to reduce friction while keeping the same operational coverage.",
    fields: [
      { id: "followUpOutstandingAr", label: "Follow Up on Outstanding AR?", type: "radio", required: true, options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }, { label: "Escalate only", value: "Escalate only" }] },
      { id: "arEscalationContact", label: "AR Escalation Contact", type: "text", placeholder: "Name, email, or phone" },
      { id: "invoiceTemplates", label: "Invoice Templates / Branding", type: "radio", options: [{ label: "Standard format exists", value: "Standard format exists" }, { label: "No standard", value: "No standard" }, { label: "Will provide", value: "Will provide" }] },
      { id: "creditNoteProcess", label: "Credit Note Process Applicable?", type: "radio", options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }] },
      { id: "billApprovalHierarchy", label: "Bill Approval Hierarchy", type: "text", placeholder: "e.g. Manager -> CFO -> CEO" },
      { id: "autoApproveBelow", label: "Auto-Approve Bills Below", type: "number", prefix: "$", placeholder: "0" },
      { id: "expensePolicy", label: "Petty Cash / Expense Reimbursement Policy", type: "textarea", placeholder: "Limits, submission process, approval chain..." },
      { id: "reportingFrequency", label: "Reporting Frequency", type: "radio", required: true, options: [{ label: "Weekly", value: "Weekly" }, { label: "Bi-Monthly", value: "Bi-Monthly" }, { label: "Monthly", value: "Monthly" }] },
      { id: "reportFormat", label: "Report Format", type: "radio", required: true, options: [{ label: "Excel", value: "Excel" }, { label: "PDF", value: "PDF" }, { label: "Dashboard", value: "Dashboard" }, { label: "G-Sheets", value: "G-Sheets" }] },
      { id: "preferredChannel", label: "Preferred Communication Channel", type: "radio", required: true, options: [{ label: "Email", value: "Email" }, { label: "WhatsApp", value: "WhatsApp" }, { label: "Slack", value: "Slack" }, { label: "Teams", value: "Teams" }] },
      { id: "arFollowUpSchedule", label: "AR Follow-Up Schedule", type: "radio", options: [{ label: "Weekly", value: "Weekly" }, { label: "Bi-weekly", value: "Bi-weekly" }, { label: "Monthly", value: "Monthly" }] },
      { id: "additionalNotes", label: "Additional Notes", type: "textarea", placeholder: "Anything else we should know before kickoff..." },
    ],
  },
  {
    id: "revenue-workflow",
    number: "06",
    title: "Revenue & Contract Workflow",
    fields: [
      { id: "whoBringsClients", label: "Who secures work / brings in clients?", type: "text", placeholder: "e.g. Agents, managers, directors" },
      { id: "whoReceivesDeals", label: "Who receives deal confirmations?", type: "text", placeholder: "Name or role" },
      { id: "whereContractsStored", label: "Where are contracts stored?", type: "text", placeholder: "e.g. Google Drive folder, DocuSign, Dropbox" },
      { id: "whoTracksDeals", label: "Who tracks deals internally?", type: "text", placeholder: "Name or role" },
      { id: "dealPaymentStructure", label: "Typical deal / payment structure", type: "textarea", placeholder: "e.g. Fixed fee, revenue share, milestone payments..." },
      { id: "managementFee", label: "Management fee %", type: "text", placeholder: "e.g. 10%" },
      { id: "legalFee", label: "Legal / other fee %", type: "text", placeholder: "e.g. 5% legal fee" },
      { id: "commissionStructure", label: "Commission structure", type: "textarea", placeholder: "Describe agent/manager commission rates and how they are calculated..." },
      { id: "activeDealPipeline", label: "Do you have an active deal pipeline tracked anywhere?", type: "radio", options: [{ label: "Yes - will share", value: "Yes - will share" }, { label: "No", value: "No" }, { label: "Informal / ad hoc", value: "Informal / ad hoc" }] },
      { id: "activeContractsUpload", label: "Active Contracts", type: "upload", accept: ".pdf,.docx,.doc,.xlsx", multiple: true },
      { id: "historicalContractsUpload", label: "Historical Contracts", type: "upload", accept: ".pdf,.docx,.doc,.xlsx", multiple: true },
      { id: "dealPipelineUpload", label: "Deal Pipeline / Tracker", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "clientRosterUpload", label: "Client Roster", type: "upload", accept: ".pdf,.xlsx,.xls,.csv,.docx", multiple: true },
    ],
  },
  {
    id: "billing-ar-detail",
    number: "07",
    title: "Billing & AR Detail",
    fields: [
      { id: "whoCreatesInvoices", label: "Who creates invoices?", type: "text", placeholder: "Name or role" },
      { id: "invoiceSystem", label: "What system generates invoices?", type: "text", placeholder: "e.g. QuickBooks, Xero, manual" },
      { id: "invoiceTiming", label: "When are invoices issued?", type: "text", placeholder: "e.g. On contract signing, on delivery, monthly" },
      { id: "whoTracksReceivables", label: "Who tracks receivables?", type: "text", placeholder: "Name or role" },
      { id: "whoFollowsUpInvoices", label: "Who follows up on unpaid invoices?", type: "text", placeholder: "Name or role" },
      { id: "collectionHistory", label: "Collection history - any chronic late payers?", type: "textarea", placeholder: "Note any patterns or problem accounts..." },
      { id: "arAgingUpload", label: "AR Aging Report", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "openInvoicesUpload", label: "Open Invoices List", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
    ],
  },
  {
    id: "ap-expenses-detail",
    number: "08",
    title: "AP & Expenses Detail",
    fields: [
      { id: "whoApprovesExpenses", label: "Who approves expenses?", type: "text", placeholder: "Name or role" },
      { id: "vendorInvoiceSubmission", label: "How are vendor invoices submitted?", type: "text", placeholder: "e.g. Email, accounting software, paper" },
      { id: "whoProcessesPayments", label: "Who processes payments?", type: "text", placeholder: "Name or role" },
      { id: "creditCardOps", label: "Credit card process", type: "textarea", placeholder: "Who holds cards, how are statements reconciled..." },
      { id: "vendorListUpload", label: "Vendor List", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "recurringExpensesUpload", label: "Recurring Expenses List", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
    ],
  },
  {
    id: "payroll-talent",
    number: "09",
    title: "Payroll & Talent Payments",
    fields: [
      { id: "payTalentDirectly", label: "Does your company pay talent directly?", type: "radio", options: [{ label: "Yes - direct", value: "Yes - direct" }, { label: "Pass-through only", value: "Pass-through only" }, { label: "Both", value: "Both" }] },
      { id: "commissionCalculation", label: "Are commissions calculated automatically or manually?", type: "radio", options: [{ label: "Automatically", value: "Automatically" }, { label: "Manually", value: "Manually" }, { label: "Mixed", value: "Mixed" }] },
      { id: "payrollSchedule", label: "Payroll schedule", type: "radio", options: [{ label: "Weekly", value: "Weekly" }, { label: "Bi-weekly", value: "Bi-weekly" }, { label: "Semi-monthly", value: "Semi-monthly" }, { label: "Monthly", value: "Monthly" }] },
      { id: "talentPayoutTiming", label: "Talent payout timing", type: "text", placeholder: "e.g. Net 30 after client payment received" },
      { id: "bonusStructure", label: "Bonus / commission structure per agent or role", type: "textarea", placeholder: "Describe how bonuses and commissions are structured per agent, manager, or role..." },
      { id: "employeeContractorUpload", label: "Employee vs Contractor List", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "payrollReportsUpload", label: "Payroll Reports (YTD)", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "employeeRosterUpload", label: "Employee Roster", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
      { id: "compensationStructureUpload", label: "Compensation / Commission Structure", type: "upload", accept: ".pdf,.xlsx,.xls,.docx", multiple: true },
    ],
  },
  {
    id: "team-roles",
    number: "10",
    title: "Team Roles & Responsibilities",
    fields: [
      { id: "teamOverview", label: "Team overview", type: "textarea", placeholder: "List your managers, agents, assistants, and operations roles - who owns what, what systems they use, and what data they control..." },
      { id: "managerCount", label: "Total number of managers / agents", type: "number", placeholder: "e.g. 4" },
      { id: "activeTalentCount", label: "Total number of active talent", type: "number", placeholder: "e.g. 12" },
      { id: "orgChartUpload", label: "Org Chart / Team Structure", type: "upload", accept: ".pdf,.xlsx,.xls,.pptx,.png,.jpg", multiple: true },
      { id: "financialTrackersUpload", label: "Financial Trackers Currently Maintained", type: "upload", accept: ".pdf,.xlsx,.xls,.csv", multiple: true },
    ],
  },
];

export const requiredFieldIds = intakeSections
  .flatMap((section) => section.fields)
  .filter((field) => field.required)
  .map((field) => field.id);
