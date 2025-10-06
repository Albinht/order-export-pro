import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ShopifyOrder, ExportRow } from '@/types/shopify';

export function prepareExportData(orders: ShopifyOrder[], productImages: Record<string, string> | Map<string, string>): ExportRow[] {
  const exportData: ExportRow[] = [];

  orders.forEach(order => {
    order.line_items.forEach(item => {
      // Helper function to find property by name (case-insensitive)
      const findProperty = (names: string[]) => {
        const prop = item.properties?.find(p => 
          names.some(name => p.name.toLowerCase().includes(name.toLowerCase()))
        );
        return prop?.value || '';
      };

      // Extract uploaded images from properties
      // Look for uploadkit URLs or properties that contain image URLs
      const uploadedPhotos: string[] = [];
      if (item.properties) {
        item.properties.forEach(prop => {
          // Check if the property value contains an uploadkit URL or any image URL
          if (prop.value && (
            prop.value.includes('uploadkit.app') || 
            prop.value.includes('cdn.shopify.com') ||
            prop.value.includes('.jpg') ||
            prop.value.includes('.jpeg') ||
            prop.value.includes('.png') ||
            prop.value.includes('.gif') ||
            prop.value.includes('.webp') ||
            prop.value.startsWith('http')
          )) {
            uploadedPhotos.push(prop.value);
          }
          // Also check for properties with names indicating uploads
          if (prop.name.toLowerCase().includes('upload') || 
              prop.name.toLowerCase().includes('image') ||
              prop.name.toLowerCase().includes('photo') ||
              prop.name.toLowerCase().includes('bild') ||
              prop.name.toLowerCase().includes('picture')) {
            if (prop.value && !uploadedPhotos.includes(prop.value)) {
              uploadedPhotos.push(prop.value);
            }
          }
        });
      }

      // Extract custom properties - enhanced for WooCommerce
      const stones = findProperty(['stone', 'stones', 'gem', 'crystal', 'Stones']);
      const minimalColors = findProperty(['minimal color', 'minimal colours', 'colors', 'colour', 'kleur', 'kleuren', 'Minimal Colors']);
      const framed = findProperty(['framed', 'frame', 'framing', 'lijst', 'canvas', 'Framed']);
      const extra = findProperty(['extra', 'additional', 'special']);
      const extra1 = findProperty(['extra 1', 'extra1', 'additional 1']);
      const extra2 = findProperty(['extra 2', 'extra2', 'additional 2']);
      
      // Use uploaded photos first, then fall back to product images
      const photo = uploadedPhotos[0] || 
        (productImages instanceof Map ? productImages.get(item.product_id) : productImages[item.product_id]) || 
        '';
      
      // Prepare customer/shipping information
      const customerName = order.shipping_address?.name || 
        (order.customer ? `${order.customer.first_name} ${order.customer.last_name}`.trim() : '');
      
      const phone = order.shipping_address?.phone || 
        order.phone || 
        order.customer?.phone || 
        '';
      
      const email = order.email || 
        order.customer?.email || 
        '';
      
      // Email first, then phone
      const phoneEmail = email && phone ? `${email} / ${phone}` : email || phone;
      
      const exportRow: ExportRow = {
        orderId: order.name || order.id,
        photo: photo,
        size: item.variant_title || '',
        quantity: item.quantity,
        stones: stones,
        minimalColors: minimalColors,
        framed: framed,
        extra: extra,
        extra1: extra1,
        extra2: extra2,
        country: order.shipping_address?.country || '',
        name: customerName,
        city: order.shipping_address?.city || '',
        street: order.shipping_address?.address1 || '',
        phoneEmail: phoneEmail,
        zipCode: order.shipping_address?.zip || '',
      };
      
      exportData.push(exportRow);
    });
  });

  return exportData;
}

export function exportToExcel(data: ExportRow[], filename: string = 'shopify_orders_export.xlsx') {
  // Create workbook
  const ws = XLSX.utils.json_to_sheet(data, {
    header: [
      'orderId',
      'photo',
      'size',
      'quantity',
      'stones',
      'minimalColors',
      'framed',
      'extra',
      'extra1',
      'extra2',
      'country',
      'name',
      'city',
      'street',
      'phoneEmail',
      'zipCode'
    ],
  });

  // Set column headers with bilingual labels
  const headers = {
    A1: { v: 'Order ID', t: 's' },
    B1: { v: 'Photo', t: 's' },
    C1: { v: 'Size', t: 's' },
    D1: { v: 'Quantity', t: 'n' },
    E1: { v: 'Stones', t: 's' },
    F1: { v: 'Minimal Colors', t: 's' },
    G1: { v: 'Framed', t: 's' },
    H1: { v: 'Extra', t: 's' },
    I1: { v: 'Extra 1', t: 's' },
    J1: { v: 'Extra 2', t: 's' },
    K1: { v: 'Country', t: 's' },
    L1: { v: '收件人姓名 Name', t: 's' },
    M1: { v: '收件人城市 City', t: 's' },
    N1: { v: 'Street', t: 's' },
    O1: { v: '收件人电话Phone/Email', t: 's' },
    P1: { v: '收件人邮编 Zip code', t: 's' },
  };

  Object.keys(headers).forEach(key => {
    ws[key] = headers[key as keyof typeof headers];
  });

  // Check for missing address data and add warning
  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because Excel is 1-indexed and we have headers
    
    // Check if any critical address field is missing
    const missingFields = [];
    if (!row.name) missingFields.push('NAME');
    if (!row.street) missingFields.push('STREET');
    if (!row.city) missingFields.push('CITY');
    if (!row.zipCode) missingFields.push('ZIPCODE');
    if (!row.country) missingFields.push('COUNTRY');
    
    if (missingFields.length > 0) {
      // Add warning to Order ID column
      const cellAddress = `A${rowNum}`;
      if (ws[cellAddress]) {
        ws[cellAddress].v = `⚠️ ${ws[cellAddress].v} - MISSING: ${missingFields.join(', ')}`;
      }
      
      // Try to add red background (works in some Excel versions)
      const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
      columns.forEach(col => {
        const addr = `${col}${rowNum}`;
        if (ws[addr]) {
          ws[addr].s = {
            fill: {
              patternType: "solid",
              fgColor: { rgb: "FFCCCC" }
            }
          };
        }
      });
    }
  });

  // Set column widths
  ws['!cols'] = [
    { width: 15 },  // Order ID
    { width: 30 },  // Photo
    { width: 12 },  // Size
    { width: 10 },  // Quantity
    { width: 15 },  // Stones
    { width: 15 },  // Minimal Colors
    { width: 10 },  // Framed
    { width: 15 },  // Extra
    { width: 15 },  // Extra 1
    { width: 15 },  // Extra 2
    { width: 15 },  // Country
    { width: 20 },  // Name
    { width: 20 },  // City
    { width: 25 },  // Street
    { width: 25 },  // Phone/Email
    { width: 15 },  // Zip code
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');

  // Generate Excel file with styles
  const excelBuffer = XLSX.write(wb, { 
    bookType: 'xlsx', 
    type: 'array',
    bookSST: true,
    cellStyles: true // Enable cell styles
  });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(blob, filename);
}

export function generateFilename(storeName?: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  
  // Include store name if provided
  if (storeName) {
    const cleanStoreName = storeName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `orders_${cleanStoreName}_${date}.xlsx`;
  }
  
  return `orders_export_${date}.xlsx`;
}
