/**
 * Google Apps Script Backend for PlantFlow OS Plant-Hire
 * 
 * Deployment Instructions:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Paste this code into Code.gs
 * 3. Click Deploy -> New Deployment
 * 4. Select type: Web App
 * 5. Execute as: Me
 * 6. Who has access: Anyone
 * 7. Copy the Web App URL and use it in your frontend app.
 */

function doGet(e) {
  try {
    // If machine_id is provided, fetch specific machine
    if (e.parameter.machine_id) {
      return getMachineById(e.parameter.machine_id);
    }
    
    // Otherwise, check for action parameter or default to getInventory
    const action = e.parameter.action || 'getInventory';

    if (action === 'getInventory') {
      return getInventory();
    } else if (action === 'getQrCode') {
      if (!e.parameter.booking_id) throw new Error('booking_id parameter is required.');
      return generateQrCodeBase64(e.parameter.booking_id);
    } else {
      throw new Error('Invalid action requested.');
    }

  } catch (error) {
    return errorResponse(error.toString());
  }
}

function getMachineById(machineId) {
  const sheetName = 'Inventory';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet named "${sheetName}" not found.`);
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    throw new Error('Machine not found.');
  }

  const headers = data[0];
  const rows = data.slice(1);
  
  const machineIdIndex = headers.indexOf('machine_id');
  if (machineIdIndex === -1) {
    throw new Error('machine_id column not found.');
  }

  const targetRow = rows.find(row => String(row[machineIdIndex]) === String(machineId));
  
  if (!targetRow) {
    throw new Error('Machine not found.');
  }

  const item = {};
  headers.forEach((header, index) => {
    item[header] = targetRow[index] === "" ? null : targetRow[index];
  });

  return successResponse(item);
}

function getInventory() {
  const sheetName = 'Inventory';
  
  // Use getActiveSpreadsheet() if the script is bound to the sheet, 
  // otherwise use SpreadsheetApp.openById('YOUR_SHEET_ID')
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet named "${sheetName}" not found.`);
  }

  // Get all data from the sheet
  const data = sheet.getDataRange().getValues();
  
  // Handle empty sheet case (only headers or completely empty)
  if (data.length <= 1) {
    return successResponse([]);
  }

  // Map rows to JSON objects using the header row as keys
  const headers = data[0];
  const rows = data.slice(1);

  const inventory = rows.map(row => {
    const item = {};
    headers.forEach((header, index) => {
      // Clean undefined or entirely blank cells
      item[header] = row[index] === "" ? null : row[index];
    });
    return item;
  });

  return successResponse(inventory);
}

/**
 * Helper to generate a successful JSON response
 * Note: Google Apps Script ContentService automatically handles CORS headers
 * (Access-Control-Allow-Origin: *) when deployed as a Web App via a 302 redirect.
 */
function successResponse(data) {
  const result = {
    status: 'success',
    data: data
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper to generate an error JSON response
 */
function errorResponse(errorMessage) {
  const result = {
    status: 'error',
    message: errorMessage
  };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle preflight OPTIONS requests for CORS (Google Apps Script handles this automatically,
 * but explicitly defining it can help in some strict environments)
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      throw new Error('No POST data provided.');
    }
    
    // Parse the incoming JSON payload
    const payload = JSON.parse(e.postData.contents);
    const action = e.parameter.action || payload.action || 'createBooking';
    
    if (action === 'createBooking') {
      return createBooking(payload);
    } else if (action === 'updateBookingStatus') {
      return updateBookingStatus(payload);
    } else {
      throw new Error('Invalid POST action requested.');
    }
  } catch (error) {
    return errorResponse(error.toString());
  }
}

function createBooking(payload) {
  const sheetName = 'Bookings';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet named "${sheetName}" not found.`);
  }

  const data = sheet.getDataRange().getValues();
  if (data.length === 0) {
    throw new Error('Bookings sheet is empty. Please add headers first.');
  }

  // Generate unique IDs and timestamps
  const timestamp = new Date().toISOString();
  const uniqueFragment = Math.random().toString(36).slice(2, 8).toUpperCase();
  const bookingId = `bk-${Date.now().toString().slice(-6)}-${uniqueFragment}`;
  const qrStartCode = `QR-START-${bookingId}`;
  const qrEndCode = `QR-END-${bookingId}`;

  const newBooking = {
    booking_id: bookingId,
    machine_id: payload.machine_id || '',
    hirer_name: payload.hirer_name || '',
    hirer_phone: payload.hirer_phone || '',
    hirer_email: payload.hirer_email || '',
    site_address: payload.site_address || 'Collection',
    start_date: payload.start_date || '',
    end_date: payload.end_date || '',
    delivery_window: payload.delivery_window || 'None',
    status: payload.status || 'pending',
    qr_start_code: qrStartCode,
    qr_end_code: qrEndCode,
    timestamp_created: timestamp
  };

  // Ensure row values follow exactly the column headings in the sheet
  const headers = data[0];
  const rowData = headers.map(header => {
    return newBooking.hasOwnProperty(header) ? newBooking[header] : '';
  });

  // Append the newly formed row
  sheet.appendRow(rowData);

  // Return the newly created booking JSON back to the client
  return successResponse(newBooking);
}

function updateBookingStatus(payload) {
  const { booking_id, status } = payload;
  
  if (!booking_id || !status) {
    throw new Error('booking_id and status are required for updating booking status.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bookingsSheet = ss.getSheetByName('Bookings');
  const inventorySheet = ss.getSheetByName('Inventory');

  if (!bookingsSheet) throw new Error('Sheet named "Bookings" not found.');
  if (!inventorySheet) throw new Error('Sheet named "Inventory" not found.');

  // Update Booking Status
  const bookingData = bookingsSheet.getDataRange().getValues();
  if (bookingData.length <= 1) throw new Error('No bookings found.');
  
  const bHeaders = bookingData[0];
  const bIdIndex = bHeaders.indexOf('booking_id');
  const bStatusIndex = bHeaders.indexOf('status');
  const bMachineIdIndex = bHeaders.indexOf('machine_id');

  if (bIdIndex === -1 || bStatusIndex === -1 || bMachineIdIndex === -1) {
    throw new Error('Required columns not found in Bookings sheet.');
  }

  let targetBookingRowIndex = -1;
  let machineId = null;

  for (let i = 1; i < bookingData.length; i++) {
    if (String(bookingData[i][bIdIndex]) === String(booking_id)) {
      targetBookingRowIndex = i + 1; // +1 for 1-based index in Apps Script ranges
      machineId = bookingData[i][bMachineIdIndex];
      bookingsSheet.getRange(targetBookingRowIndex, bStatusIndex + 1).setValue(status);
      break;
    }
  }

  if (targetBookingRowIndex === -1) {
    throw new Error(`Booking with ID ${booking_id} not found.`);
  }

  // Update Machine Availability
  if (machineId) {
    const invData = inventorySheet.getDataRange().getValues();
    const invHeaders = invData[0];
    const mIdIndex = invHeaders.indexOf('machine_id');
    const mAvailIndex = invHeaders.indexOf('availability_status');

    if (mIdIndex !== -1 && mAvailIndex !== -1) {
      let targetMachineRowIndex = -1;
      
      for (let i = 1; i < invData.length; i++) {
        if (String(invData[i][mIdIndex]) === String(machineId)) {
          targetMachineRowIndex = i + 1;
          
          let newMachineStatus = 'hired'; // default to hired if in active workflow
          if (status === 'end_hire' || status === 'completed') {
            newMachineStatus = 'available';
          } else if (status === 'cancelled') {
            newMachineStatus = 'available';
          }

          inventorySheet.getRange(targetMachineRowIndex, mAvailIndex + 1).setValue(newMachineStatus);
          break;
        }
      }
    }
  }

  return successResponse({ booking_id, status, machine_id: machineId });
}

/**
 * Generates a Base64-encoded QR Code image for a given booking ID
 */
function generateQrCodeBase64(bookingId) {
  // Use QuickChart.io as a reliable and fast QR code generation API
  // (Google Charts API is deprecated, but still another option)
  const qrUrl = "https://quickchart.io/qr?text=" + encodeURIComponent(bookingId) + "&size=300&margin=1";
  
  const response = UrlFetchApp.fetch(qrUrl);
  const blob = response.getBlob();
  const base64Data = Utilities.base64Encode(blob.getBytes());
  
  // Create a proper data URI so the frontend can immediately use it in an <img src="..." />
  const dataUri = "data:" + blob.getContentType() + ";base64," + base64Data;
  
  return successResponse({
    booking_id: bookingId,
    qr_base64: dataUri
  });
}
