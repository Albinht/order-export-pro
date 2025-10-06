import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ShopifyOrder, ExportRow } from '@/types/shopify';

export async function exportToExcelWithStyling(data: ExportRow[], filename: string = 'shopify_orders_export.xlsx') {
  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  // Define columns with headers
  worksheet.columns = [
    { header: 'Order ID', key: 'orderId', width: 15 },
    { header: 'Photo', key: 'photo', width: 30 },
    { header: 'Size', key: 'size', width: 12 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Stones', key: 'stones', width: 15 },
    { header: 'Minimal Colors', key: 'minimalColors', width: 15 },
    { header: 'Framed', key: 'framed', width: 10 },
    { header: 'Extra', key: 'extra', width: 15 },
    { header: 'Extra 1', key: 'extra1', width: 15 },
    { header: 'Extra 2', key: 'extra2', width: 15 },
    { header: 'Country', key: 'country', width: 15 },
    { header: '收件人姓名 Name', key: 'name', width: 20 },
    { header: '收件人城市 City', key: 'city', width: 20 },
    { header: 'Street', key: 'street', width: 25 },
    { header: '收件人电话Phone/Email', key: 'phoneEmail', width: 25 },
    { header: '收件人邮编 Zip code', key: 'zipCode', width: 15 }
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  // Add data rows
  data.forEach((row) => {
    const newRow = worksheet.addRow(row);
    
    // Check if any critical address field is missing
    const hasAddressIssue = !row.name || !row.street || !row.city || !row.zipCode || !row.country;
    
    if (hasAddressIssue) {
      // Apply red background to entire row if address is incomplete
      newRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' } // Light red background
        };
        cell.font = {
          color: { argb: 'FFCC0000' }, // Dark red text
          bold: true
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCC0000' } },
          left: { style: 'thin', color: { argb: 'FFCC0000' } },
          bottom: { style: 'thin', color: { argb: 'FFCC0000' } },
          right: { style: 'thin', color: { argb: 'FFCC0000' } }
        };
      });
      
      // Add warning to Order ID cell
      const orderIdCell = newRow.getCell('orderId');
      const missingFields = [];
      if (!row.name) missingFields.push('NAME');
      if (!row.street) missingFields.push('STREET');
      if (!row.city) missingFields.push('CITY');
      if (!row.zipCode) missingFields.push('ZIPCODE');
      if (!row.country) missingFields.push('COUNTRY');
      
      orderIdCell.value = `⚠️ ${orderIdCell.value} - MISSING: ${missingFields.join(', ')}`;
    }
  });

  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      if (!cell.border) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });
  });

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Save file
  saveAs(blob, filename);
}
