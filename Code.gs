function doGet(e) {
  // Get the sheet name from the query parameter
  const requestedSheet = e.parameter.sheet;
  
  // Log the request details
  Logger.log("Request parameters: " + JSON.stringify(e.parameter));
  
  if (!requestedSheet) {
    return ContentService.createTextOutput(JSON.stringify({
      error: "No sheet name provided",
      message: "Please provide a sheet name parameter"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("Spreadsheet found: " + spreadsheet.getName());
    
    // List all available sheets for debugging
    const sheets = spreadsheet.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    Logger.log("Available sheets: " + sheetNames.join(", "));
    
    // Get the requested sheet
    const sheet = spreadsheet.getSheetByName(requestedSheet);
    Logger.log("Sheet found: " + (sheet ? "Yes" : "No") + " for " + requestedSheet);
    
    if (!sheet) {
      // If the requested sheet isn't found, DO NOT default to All Time
      return ContentService.createTextOutput(JSON.stringify({
        error: "Sheet not found",
        message: `The sheet "${requestedSheet}" was not found in the spreadsheet`,
        requestedSheet: requestedSheet,
        availableSheets: sheetNames
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get only the used range
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const dataRange = sheet.getRange(1, 1, lastRow, lastCol);
    const values = dataRange.getValues();
    
    // Get the headers from the first row
    const headers = values[0];
    
    // Convert the data to an array of objects, skipping completely empty rows
    const data = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      
      // Check if the row has any non-empty values
      const hasData = row.some(cell => {
        // Convert to string and trim to properly check for empty cells
        const str = String(cell).trim();
        return str !== "" && str !== "null" && str !== "undefined";
      });
      
      if (hasData) {
        const rowData = {};
        for (let j = 0; j < headers.length; j++) {
          // Clean up the data
          const value = row[j];
          rowData[headers[j]] = value === "" ? null : value;
        }
        data.push(rowData);
      }
    }
    
    // Log the data count for debugging
    Logger.log(`Found ${data.length} rows with data in sheet "${requestedSheet}"`);
    
    // Return the data with metadata
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      sheetName: requestedSheet,
      rowCount: data.length,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error and return it as JSON
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: "Script error",
      message: error.toString(),
      stack: error.stack,
      requestedSheet: requestedSheet
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Add a test function to list all available sheets
function testListSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  const sheetNames = sheets.map(sheet => sheet.getName());
  Logger.log("Available sheets: " + sheetNames.join(", "));
  return sheetNames;
} 