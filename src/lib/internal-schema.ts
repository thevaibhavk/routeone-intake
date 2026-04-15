import type { Option, BaseField, Section } from "@/lib/form-schema";

export const internalSections: Section[] = [
  {
    id: "accounts-receivable",
    number: "01",
    title: "Accounts Receivable (AR)",
    fields: [
      { id: "followUpOutstandingAr", label: "Follow Up on Outstanding AR?", type: "radio", required: true, options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }, { label: "Escalate only", value: "Escalate only" }] },
      { id: "arEscalationContact", label: "AR Escalation Contact", type: "text", placeholder: "Name, email, or phone" },
      { id: "invoiceTemplates", label: "Invoice Templates / Branding", type: "radio", options: [{ label: "Standard format exists", value: "Standard format exists" }, { label: "No standard", value: "No standard" }, { label: "Will provide", value: "Will provide" }] },
      { id: "creditNoteProcess", label: "Credit Note Process Applicable?", type: "radio", options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }] },
    ],
  },
  {
    id: "accounts-payable",
    number: "02",
    title: "Accounts Payable (AP)",
    fields: [
      { id: "billApprovalHierarchy", label: "Bill Approval Hierarchy", type: "text", placeholder: "e.g. Manager → CFO → CEO" },
      { id: "autoApproveBelow", label: "Auto-Approve Bills Below", type: "number", prefix: "$", placeholder: "0" },
      { id: "expensePolicy", label: "Petty Cash / Expense Reimbursement Policy", type: "textarea", placeholder: "Limits, submission process, approval chain..." },
    ],
  },
  {
    id: "accounting-setup",
    number: "03",
    title: "Accounting Setup",
    fields: [
      { id: "chartOfAccountsReview", label: "Chart of Accounts — Review Needed?", type: "radio", options: [{ label: "Yes", value: "Yes" }, { label: "No — looks good", value: "No — looks good" }, { label: "Not sure", value: "Not sure" }] },
      { id: "bankRulesAutoMatch", label: "Bank Rules / Auto-Matching in Place?", type: "radio", options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }, { label: "Unknown", value: "Unknown" }] },
      { id: "userRolesPermissions", label: "User Roles & Permissions — Review Needed?", type: "radio", options: [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }] },
    ],
  },
  {
    id: "reporting-communication",
    number: "04",
    title: "Reporting & Communication",
    fields: [
      { id: "reportingFrequency", label: "Reporting Frequency", type: "radio", required: true, options: [{ label: "Weekly", value: "Weekly" }, { label: "Bi-Monthly", value: "Bi-Monthly" }, { label: "Monthly", value: "Monthly" }] },
      { id: "reportFormat", label: "Report Format", type: "radio", required: true, options: [{ label: "Excel", value: "Excel" }, { label: "PDF", value: "PDF" }, { label: "Dashboard", value: "Dashboard" }, { label: "G-Sheets", value: "G-Sheets" }] },
      { id: "arFollowUpSchedule", label: "AR Follow-Up Schedule", type: "radio", options: [{ label: "Weekly", value: "Weekly" }, { label: "Bi-weekly", value: "Bi-weekly" }, { label: "Monthly", value: "Monthly" }] },
      { id: "additionalNotes", label: "Additional Notes", type: "textarea", placeholder: "Anything else we should know before kickoff..." },
    ],
  },
  {
    id: "revenue-workflow",
    number: "05",
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
    ],
  },
  {
    id: "billing-ar-detail",
    number: "06",
    title: "Billing & AR Detail",
    fields: [
      { id: "whoCreatesInvoices", label: "Who creates invoices?", type: "text", placeholder: "Name or role" },
      { id: "invoiceSystem", label: "What system generates invoices?", type: "text", placeholder: "e.g. QuickBooks, Xero, manual" },
      { id: "invoiceTiming", label: "When are invoices issued?", type: "text", placeholder: "e.g. On contract signing, on delivery, monthly" },
      { id: "whoTracksReceivables", label: "Who tracks receivables?", type: "text", placeholder: "Name or role" },
      { id: "whoFollowsUpInvoices", label: "Who follows up on unpaid invoices?", type: "text", placeholder: "Name or role" },
      { id: "collectionHistory", label: "Collection history - any chronic late payers?", type: "textarea", placeholder: "Note any patterns or problem accounts..." },
    ],
  },
  {
    id: "ap-expenses-detail",
    number: "07",
    title: "AP & Expenses Detail",
    fields: [
      { id: "whoApprovesExpenses", label: "Who approves expenses?", type: "text", placeholder: "Name or role" },
      { id: "vendorInvoiceSubmission", label: "How are vendor invoices submitted?", type: "text", placeholder: "e.g. Email, accounting software, paper" },
      { id: "whoProcessesPayments", label: "Who processes payments?", type: "text", placeholder: "Name or role" },
      { id: "creditCardOps", label: "Credit card process", type: "textarea", placeholder: "Who holds cards, how are statements reconciled..." },
    ],
  },
  {
    id: "payroll-talent",
    number: "08",
    title: "Payroll & Talent Payments",
    fields: [
      { id: "payTalentDirectly", label: "Does your company pay talent directly?", type: "radio", options: [{ label: "Yes - direct", value: "Yes - direct" }, { label: "Pass-through only", value: "Pass-through only" }, { label: "Both", value: "Both" }] },
      { id: "commissionCalculation", label: "Are commissions calculated automatically or manually?", type: "radio", options: [{ label: "Automatically", value: "Automatically" }, { label: "Manually", value: "Manually" }, { label: "Mixed", value: "Mixed" }] },
      { id: "payrollSchedule", label: "Payroll schedule", type: "radio", options: [{ label: "Weekly", value: "Weekly" }, { label: "Bi-weekly", value: "Bi-weekly" }, { label: "Semi-monthly", value: "Semi-monthly" }, { label: "Monthly", value: "Monthly" }] },
      { id: "talentPayoutTiming", label: "Talent payout timing", type: "text", placeholder: "e.g. Net 30 after client payment received" },
      { id: "bonusStructure", label: "Bonus / commission structure per agent or role", type: "textarea", placeholder: "Describe how bonuses and commissions are structured per agent, manager, or role..." },
    ],
  },
  {
    id: "team-roles",
    number: "09",
    title: "Team Roles & Responsibilities",
    fields: [
      { id: "teamOverview", label: "Team overview", type: "textarea", placeholder: "List your managers, agents, assistants, and operations roles - who owns what, what systems they use, and what data they control..." },
      { id: "managerCount", label: "Total number of managers / agents", type: "number", placeholder: "e.g. 4" },
      { id: "activeTalentCount", label: "Total number of active talent", type: "number", placeholder: "e.g. 12" },
    ],
  },
];

export const internalRequiredFieldIds = internalSections
  .flatMap((section) => section.fields)
  .filter((field) => field.required)
  .map((field) => field.id);
