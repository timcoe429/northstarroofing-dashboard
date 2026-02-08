// PDF generation using hidden iframe and browser print
import { InvoiceData, CompanyInfo, formatCurrency, formatDate } from './invoice-helpers';

export function generateInvoicePDF(invoiceData: InvoiceData, companyInfo: CompanyInfo): void {
  const logoHtml = companyInfo.logo 
    ? `<img src="${companyInfo.logo}" style="max-height:60px;max-width:180px;">`
    : '';

  // Filter out empty line items
  const validItems = invoiceData.lineItems.filter(item => 
    item.description.trim() || item.amount > 0
  );

  const itemRows = validItems.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee">${item.description}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.rate)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${formatCurrency(item.amount)}</td>
    </tr>
  `).join('');

  const taxRow = invoiceData.taxRate > 0 
    ? `<div class="tot-row"><span>Tax (${invoiceData.taxRate}%)</span><span>${formatCurrency(invoiceData.taxAmount)}</span></div>`
    : '';

  const notesSection = invoiceData.notes 
    ? `<div class="notes"><div class="notes-label">Notes</div>${invoiceData.notes.replace(/\n/g, '<br>')}</div>`
    : '';

  const companyDetails = [
    companyInfo.address,
    companyInfo.phone,
    companyInfo.email,
    companyInfo.website
  ].filter(Boolean).join('<br>');

  const clientDetails = [
    invoiceData.client.address,
    invoiceData.client.phone,
    invoiceData.client.email
  ].filter(Boolean).join('<br>');

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${invoiceData.invoiceNumber}</title>
  <style>
    @page { size: letter; margin: 0.5in; }
    body {
      font-family: Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      margin: 0;
      padding: 40px 50px;
      font-size: 13px;
      line-height: 1.5;
    }
    .hdr {
      border-top: 6px solid #00293f;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
    }
    .hdr-right { text-align: right; }
    .hdr h1 {
      margin: 0;
      font-size: 28px;
      color: #00293f;
      letter-spacing: 1px;
    }
    .meta {
      color: #64748b;
      font-size: 12px;
      margin-top: 4px;
    }
    .cols {
      display: flex;
      gap: 40px;
      margin-bottom: 30px;
    }
    .col { flex: 1; }
    .col-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .col-name {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .col-detail {
      color: #64748b;
      font-size: 12px;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: .5px;
    }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-box { min-width: 250px; }
    .tot-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #475569;
    }
    .tot-grand {
      font-size: 18px;
      font-weight: 700;
      color: #00293f;
      border-top: 2px solid #00293f;
      padding-top: 10px;
      margin-top: 6px;
    }
    .notes {
      margin-top: 30px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .notes-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .ftr {
      border-bottom: 6px solid #00293f;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="hdr">
    <div>${logoHtml}</div>
    <div class="hdr-right">
      <h1>INVOICE</h1>
      <div class="meta">
        ${invoiceData.invoiceNumber}<br>
        Date: ${formatDate(invoiceData.invoiceDate)}<br>
        Due: ${formatDate(invoiceData.dueDate)}${invoiceData.poNumber ? '<br>PO: ' + invoiceData.poNumber : ''}
      </div>
    </div>
  </div>
  
  <div class="cols">
    <div class="col">
      <div class="col-label">From</div>
      <div class="col-name">${companyInfo.name}</div>
      <div class="col-detail">${companyDetails}</div>
    </div>
    <div class="col">
      <div class="col-label">Bill To</div>
      <div class="col-name">${invoiceData.client.name}</div>
      <div class="col-detail">${clientDetails}</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>
  
  <div class="totals">
    <div class="totals-box">
      <div class="tot-row">
        <span>Subtotal</span>
        <span>${formatCurrency(invoiceData.subtotal)}</span>
      </div>
      ${taxRow}
      <div class="tot-row tot-grand">
        <span>Total Due</span>
        <span>${formatCurrency(invoiceData.total)}</span>
      </div>
    </div>
  </div>
  
  ${notesSection}
  
  <div class="ftr"></div>
</body>
</html>`;

  // Create or get the hidden iframe
  let printFrame = document.getElementById('northstarPrintFrame') as HTMLIFrameElement;
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'northstarPrintFrame';
    printFrame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;';
    document.body.appendChild(printFrame);
  }

  // Write HTML to iframe and trigger print
  const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
  if (frameDoc) {
    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();
    
    // Trigger print after a short delay to ensure content is loaded
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    }, 300);
  }
}