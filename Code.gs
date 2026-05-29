/**
 * IRA SPARKS E.M. SCHOOL - Enterprise-Grade Google Sheets Backend Script
 * =======================================================================
 * Version: 4.0.0
 * 
 * DESIGN FEATURES:
 * - Centralized table schemas mapping directly with the UI TypeScript interfaces.
 * - Auto-Healing Mechanism: Automatically creates missing sheets & appends missing columns.
 * - Dynamic CRUD routes for Students, Staff, Parents, Visitors, Transport, Expenses, and Timetables.
 * - Secure Token Authentication (Cache-based) + PIN verification safety checks.
 * - Unified responsive error reporting.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Open your target Google Sheet.
 * 2. Go to Extensions -> Apps Script.
 * 3. Delete any default code and replace it with this entire script.
 * 4. Save and click "Deploy" -> "New deployment".
 * 5. Set Type to "Web App".
 * 6. Set Description: "IRA Sparks School Backend v4"
 * 7. Set Execute as: "Me" (your Google account).
 * 8. Set Who has access: "Anyone". (CRITICAL: Do NOT select "Anyone with Google Account" or "Only myself").
 * 9. Click "Deploy". Authorize permissions if prompted.
 * 10. Copy the Web App URL and paste it in your App Settings override panel.
 */

// --- GLOBAL CONFIGURATION ---
const CONFIG = {
  ADMIN_USERNAME: 'irasparks',
  ADMIN_PASSWORD: 'irasparks@2025',
  ADMIN_PIN: '1983',
  SESSION_TIMEOUT_SECONDS: 3600 // 1 hour session validity
};

// --- CENTRALIZED SCHEMA DEFINITIONS (Aligned with /types.ts) ---
const SCHEMAS = {
  'Students': [
    'id', 'name', 'class', 'section', 'admissionNumber', 'fatherName', 
    'phoneNumber', 'address', 'admissionFee', 'tuitionFee', 'cautionDeposit', 
    'transportFee', 'activityFee', 'terminalFee', 'totalFees',
    'gender', 'dob', 'bloodGroup', 'nationality', 'religion', 'motherTongue',
    'motherName', 'motherPhone', 'fatherOccupation', 'parentEmail',
    'street', 'city', 'state', 'pinCode',
    'transportMode', 'busRoute', 'pickupPoint',
    'allergies', 'medicalConditions', 'emergencyContactName', 'emergencyContactPhone',
    'prevSchool', 'prevClass', 'prevYear', 'academicRemarks'
  ],
  'Staff': [
    'id', 'name', 'role', 'dept', 'phoneNumber', 'salary'
  ],
  'Parents': [
    'id', 'fatherName', 'studentName', 'phoneNumber', 'address'
  ],
  'Visitors': [
    'id', 'name', 'reason', 'checkIn', 'checkOut'
  ],
  'Transport': [
    'id', 'route', 'driver', 'studentsCount'
  ],
  'Expenses': [
    'id', 'category', 'amount', 'date', 'description'
  ],
  'Timetable': [
    'id', 'class', 'section', 'day', 'period1', 'period2', 'period3', 
    'period4', 'period5', 'period6', 'period7', 'period8', 'period9'
  ]
};

/**
 * Handle GET requests (Health diagnostics check)
 */
function doGet(e) {
  return createJsonResponse('success', {
    status: 'online',
    service: 'IRA Sparks School Apps Script Engine',
    version: '4.0.0',
    timestamp: new Date().toISOString(),
    supportedModules: Object.keys(SCHEMAS)
  });
}

/**
 * Handle POST requests (Central Proxy Transaction Routing Engine)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Bad Request: Please supply a non-empty request payload.");
    }

    const request = JSON.parse(e.postData.contents);
    const { action, token, pin, data, id } = request;

    // 1. Authenticate / Login handles separately (no session token needed)
    if (action === 'login') {
      return handleLogin(request);
    }

    // 2. Validate Session Token for all secure endpoints
    verifySessionToken(token);

    // 3. Routing Map for modular and clean execution
    const actionRegistry = {
      // --- Students Module ---
      'read': { sheet: 'Students', handler: readRecord },
      'create': { sheet: 'Students', handler: createRecord, requiresPin: false },
      'update': { sheet: 'Students', handler: updateRecord, requiresPin: true },
      'delete': { sheet: 'Students', handler: deleteRecord, requiresPin: true },

      // --- Staff Module ---
      'readStaff': { sheet: 'Staff', handler: readRecord },
      'createStaff': { sheet: 'Staff', handler: createRecord, requiresPin: false },
      'updateStaff': { sheet: 'Staff', handler: updateRecord, requiresPin: true },
      'deleteStaff': { sheet: 'Staff', handler: deleteRecord, requiresPin: true },

      // --- Parents Module ---
      'readParents': { sheet: 'Parents', handler: readRecord },
      'createParent': { sheet: 'Parents', handler: createRecord, requiresPin: false },
      'updateParent': { sheet: 'Parents', handler: updateRecord, requiresPin: true },
      'deleteParent': { sheet: 'Parents', handler: deleteRecord, requiresPin: true },

      // --- Visitors Module ---
      'readVisitors': { sheet: 'Visitors', handler: readRecord },
      'createVisitor': { sheet: 'Visitors', handler: createRecord, requiresPin: false },
      'updateVisitor': { sheet: 'Visitors', handler: updateRecord, requiresPin: true },
      'deleteVisitor': { sheet: 'Visitors', handler: deleteRecord, requiresPin: true },

      // --- Transport Module ---
      'readTransport': { sheet: 'Transport', handler: readRecord },
      'createTransport': { sheet: 'Transport', handler: createRecord, requiresPin: false },
      'updateTransport': { sheet: 'Transport', handler: updateRecord, requiresPin: true },
      'deleteTransport': { sheet: 'Transport', handler: deleteRecord, requiresPin: true },

      // --- Expenses Module ---
      'readExpenses': { sheet: 'Expenses', handler: readRecord },
      'createExpense': { sheet: 'Expenses', handler: createRecord, requiresPin: false },
      'updateExpense': { sheet: 'Expenses', handler: updateRecord, requiresPin: true },
      'deleteExpense': { sheet: 'Expenses', handler: deleteRecord, requiresPin: true },

      // --- Timetable Module ---
      'readTimetable': { sheet: 'Timetable', handler: readRecord },
      'createTimetable': { sheet: 'Timetable', handler: createRecord, requiresPin: false },
      'updateTimetable': { sheet: 'Timetable', handler: updateRecord, requiresPin: true },
      'deleteTimetable': { sheet: 'Timetable', handler: deleteRecord, requiresPin: true }
    };

    const actionConfig = actionRegistry[action];
    if (!actionConfig) {
      throw new Error(`Execution Blocked: Action '${action}' is not supported by the core backend engine.`);
    }

    // 4. Verify admin PIN for critical write/delete actions
    if (actionConfig.requiresPin) {
      validateAdminPin(pin);
    }

    // 5. Execute action handler with contextual sheet configurations
    const result = actionConfig.handler(actionConfig.sheet, { id, data });
    return createJsonResponse('success', result);

  } catch (error) {
    console.error('Core Execution Failure: ' + error.toString());
    return createJsonResponse('error', error.toString());
  }
}

/**
 * --- DATABASE CRUD PROCEDURES ---
 */

/**
 * Read all records from the sheet, mapping columns automatically based on actual row headers.
 */
function readRecord(sheetName) {
  const sheet = getSafeSheetInstance(sheetName);
  const totalRows = sheet.getLastRow();
  if (totalRows <= 1) {
    return []; // Return clean empty dataset
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim());

  return values.slice(1).map(row => {
    const record = {};
    headers.forEach((header, index) => {
      if (header.length > 0) {
        record[header] = row[index];
      }
    });
    return record;
  });
}

/**
 * Appends a new JSON object into the respective sheet, carrying out field-level business rules.
 */
function createRecord(sheetName, params) {
  const data = params.data;
  if (!data || typeof data !== 'object') {
    throw new Error(`Data format error: Payload must be a robust JSON object.`);
  }

  // Self-heal and generate fresh identifier
  data.id = data.id || Utilities.getUuid();

  // Run sheet-specific calculations / validation business logic
  runEntityBusinessRules(sheetName, data);

  const sheet = getSafeSheetInstance(sheetName);
  const headers = SCHEMAS[sheetName];
  
  // Cleanly map the JSON payload attributes directly matching the official spreadsheet headers
  const newRow = headers.map(header => {
    const val = data[header];
    return val !== undefined && val !== null ? val : "";
  });

  sheet.appendRow(newRow);
  return data;
}

/**
 * Updates an existing row matched by ID.
 */
function updateRecord(sheetName, params) {
  const data = params.data;
  if (!data || !data.id) {
    throw new Error(`Update operations require a valid primary id.`);
  }

  // Run calculations/validations on modification payload
  runEntityBusinessRules(sheetName, data);

  const sheet = getSafeSheetInstance(sheetName);
  const allRows = sheet.getDataRange().getValues();
  const headers = allRows[0].map(h => String(h).trim());
  const idColIndex = headers.indexOf('id');

  if (idColIndex === -1) {
    throw new Error(`Missing database key "id" header on worksheet: ${sheetName}.`);
  }

  // Iteratively scan sheet rows to find the matching dataset
  for (let rowIndex = 1; rowIndex < allRows.length; rowIndex++) {
    const rowId = allRows[rowIndex][idColIndex];
    if (rowId == data.id) {
      // Map updated headers, falling back on existing columns if undefined
      const updatedRowValues = headers.map(header => {
        const colIdx = headers.indexOf(header);
        const currentFieldVal = allRows[rowIndex][colIdx];
        const inputFieldVal = data[header];
        return inputFieldVal !== undefined && inputFieldVal !== null ? inputFieldVal : currentFieldVal;
      });

      // Commit changes using Google Sheets row index (1-based, accounts for header row)
      const targetRange = sheet.getRange(rowIndex + 1, 1, 1, headers.length);
      targetRange.setValues([updatedRowValues]);
      return data;
    }
  }

  throw new Error(`Not Found: No active item matches ID "${data.id}" inside sheet "${sheetName}".`);
}

/**
 * Remove matching row securely from the database.
 */
function deleteRecord(sheetName, params) {
  const recordId = params.id;
  if (!recordId) {
    throw new Error(`Delete operations require a valid primary id.`);
  }

  const sheet = getSafeSheetInstance(sheetName);
  const allRows = sheet.getDataRange().getValues();
  const headers = allRows[0].map(h => String(h).trim());
  const idColIndex = headers.indexOf('id');

  if (idColIndex === -1) {
    throw new Error(`Missing database key "id" header on worksheet: ${sheetName}.`);
  }

  for (let rowIndex = 1; rowIndex < allRows.length; rowIndex++) {
    const rowId = allRows[rowIndex][idColIndex];
    if (rowId == recordId) {
      sheet.deleteRow(rowIndex + 1);
      return { id: recordId, status: 'deleted', sheet: sheetName };
    }
  }

  throw new Error(`Not Found: Could not find database row to delete for ID: "${recordId}".`);
}

/**
 * --- BUSINESS RULES, CALCULATIONS & SANITIZATION ---
 */
function runEntityBusinessRules(sheetName, item) {
  // Common visual rules
  if (item.name !== undefined && String(item.name).trim() === "") {
    throw new Error(`Validation Error: Record "name" cannot be blank.`);
  }

  switch (sheetName) {
    case 'Students':
      // Calculate totalFees dynamically
      const admission = Number(item.admissionFee) || 0;
      const tuition = Number(item.tuitionFee) || 0;
      const caution = Number(item.cautionDeposit) || 0;
      const transport = Number(item.transportFee) || 0;
      const activity = Number(item.activityFee) || 0;
      const terminal = Number(item.terminalFee) || 0;
      item.totalFees = admission + tuition + caution + transport + activity + terminal;
      
      // Phone check
      if (item.phoneNumber && String(item.phoneNumber).replace(/\D/g, '').length < 10) {
        throw new Error(`Validation Error: Student phone number must contain at least 10 digits.`);
      }
      break;

    case 'Staff':
      const salaryNum = Number(item.salary) || 0;
      item.salary = salaryNum;
      if (item.salary < 0) {
        throw new Error(`Validation Error: Staff salary cannot be a negative value.`);
      }
      break;

    case 'Expenses':
      if (item.amount !== undefined) {
         const amountNum = Number(item.amount) || 0;
         if (amountNum <= 0) {
           throw new Error(`Validation Error: Expense "amount" must be greater than zero.`);
         }
         item.amount = amountNum;
      }
      break;

    default:
      break;
  }
}

/**
 * --- UTILITY SECURITY & CACHE LOGS ---
 */

function handleLogin(request) {
  const { username, password } = request;
  
  if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
    const token = Utilities.getUuid();
    // Persist session token inside Google Apps Script fast cache service
    CacheService.getScriptCache().put(token, 'active', CONFIG.SESSION_TIMEOUT_SECONDS);
    return createJsonResponse('success', { token, expiresAt: Date.now() + (CONFIG.SESSION_TIMEOUT_SECONDS * 1000) });
  }
  
  throw new Error("Authentication Error: Invalid credentials. Incorrect username or password.");
}

function verifySessionToken(token) {
  if (!token) {
    throw new Error("Unauthorized: Session token is completely missing.");
  }
  
  const cachedStatus = CacheService.getScriptCache().get(token);
  if (!cachedStatus || cachedStatus !== 'active') {
    throw new Error("Unauthorized: Session expired or invalid. Please log in again.");
  }
}

function validateAdminPin(pin) {
  if (!pin || String(pin) !== CONFIG.ADMIN_PIN) {
    throw new Error("Security Check Failed: Action requires administrative approval pin code.");
  }
}

/**
 * Fetch or automatically generate database sheet on the host Google spreadsheet.
 * Dynamic migration: Adds missing columns automatically to accommodate older spreadsheets!
 */
function getSafeSheetInstance(name) {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = activeSpreadsheet.getSheetByName(name);
  const headers = SCHEMAS[name];
  
  if (!headers) {
    throw new Error(`Schema Configuration Error: Worksheet table "${name}" lacks a registered schema.`);
  }

  if (!sheet) {
    // Create new sheet tab if not present
    sheet = activeSpreadsheet.insertSheet(name);
    sheet.appendRow(headers);
  } else {
    // Auto-migrate: Read first row column headers
    const lastCol = Math.max(1, sheet.getLastColumn());
    const firstRowRange = sheet.getRange(1, 1, 1, lastCol);
    const existingHeaders = firstRowRange.getValues()[0].map(h => String(h).trim());
    
    // Find missing columns based on our centralized schemas
    const missingHeaders = headers.filter(h => !existingHeaders.includes(h));
    
    if (missingHeaders.length > 0) {
      const cleanExisting = existingHeaders.filter(h => h.length > 0);
      const newHeaderList = [...cleanExisting, ...missingHeaders];
      
      // Make sure there are enough columns
      if (sheet.getMaxColumns() < newHeaderList.length) {
        sheet.insertColumnsAfter(sheet.getMaxColumns(), newHeaderList.length - sheet.getMaxColumns());
      }
      
      // Re-write the migration header
      sheet.getRange(1, 1, 1, newHeaderList.length).setValues([newHeaderList]);
      SCHEMAS[name] = newHeaderList;
    } else {
      SCHEMAS[name] = existingHeaders.filter(h => h.length > 0);
    }
  }
  
  return sheet;
}

/**
 * Standard CORS compliance output generator for doGet/doPost responses
 */
function createJsonResponse(status, dataOrMessage) {
  const res = { status: status };
  if (status === 'success') {
    res.data = dataOrMessage;
  } else {
    res.message = dataOrMessage;
  }
  
  return ContentService.createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON);
}
