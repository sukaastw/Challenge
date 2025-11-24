// =================== KONFIGURASI KRITIS ===================
const SPREADSHEET_ID = ""; //sesuaikan dengan id spreadsheet Anda 
const FOLDER_DRIVE_ID = ""; //sesuaikan dengan id folder drive Anda

// =================== JSON RESPONSE ===================
function sendJSON(data) {
  return ContentService
         .createTextOutput(JSON.stringify(data))
         .setMimeType(ContentService.MimeType.JSON);
}

// =================== DO OPTIONS (CORS PREFLIGHT) ===================
function doOptions() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// =================== SHEET UTILITIES ===================
function getSheet(sheetName, headers) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID); 
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) sheet.appendRow(headers);
  }
  return sheet;
}

function getProductSheet() {
  return getSheet("Sheet1", ["id", "name", "category", "price", "stock", "description", "fileId"]);
}

function getCategorySheet() {
  return getSheet("Categories", ["id", "name"]);
}

function getAllData(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { headers: [], rows: [] };
  const headers = values[0].map(h => String(h).trim());
  const rows = values.slice(1);
  return { headers, rows };
}

function getMaxId(rows) {
  const ids = rows.map(r => Number(r[0])).filter(v => !isNaN(v));
  return ids.length ? Math.max(...ids) : 0;
}

// =================== GET DATA ===================
function getCategoryData() {
  const { rows } = getAllData(getCategorySheet());
  return rows.filter(r => r[0] && r[1])
             .map(r => ({ id: String(r[0]), name: String(r[1]) }));
}

function getProductData() {
  const { headers, rows } = getAllData(getProductSheet());
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h === "price" || h === "stock") obj[h] = Number(row[i]) || 0;
      else obj[h] = row[i];
    });
    return obj;
  });
}

// =================== DO GET ===================
function doGet(e) {
  try {
    const action = e?.parameter?.action;
    if (action === "categories") return sendJSON(getCategoryData());
    return sendJSON({ products: getProductData(), categories: getCategoryData() });
  } catch (err) {
    Logger.log("GET Error: " + err.message);
    return sendJSON({ success:false, error: "GET Error: "+String(err.message) });
  }
}

// =================== CATEGORY CRUD ===================
function handleCategoryCrud(action, data) {
  const sheet = getCategorySheet();
  const { rows } = getAllData(sheet);

  if (action === "create") {
    if (!data?.name) return { success:false, message:"name required" };
    const newId = getMaxId(rows)+1;
    sheet.appendRow([newId, data.name]);
    return { success:true, id:newId, name:data.name };
  }

  const id = data?.id;
  const index = rows.findIndex(r => String(r[0]) === String(id));
  if (index === -1) return { success:false, message:"category not found" };
  const rowIndex = index + 2;

  if (action === "update") {
    if (!data?.name) return { success:false, message:"name required" };
    sheet.getRange(rowIndex,2).setValue(data.name);
    return { success:true };
  }

  if (action === "delete") {
    sheet.deleteRow(rowIndex);
    return { success:true };
  }

  return { success:false, message:"Unknown category action" };
}

// =================== PRODUCT CRUD ===================
function handleProductCrud(action, data) {
  const sheet = getProductSheet();
  const { headers, rows } = getAllData(sheet);

  // ================= CREATE =================
  if (action === "create") {
    if (!data?.name) return { success:false, message:"name required" };
    
    let fileId = "";
    if (data.imgBase64) {
      try {
        const raw = data.imgBase64.split(",")[1];
        const type = (data.imgBase64.match(/data:(.*);base64,/)||[])[1] || "image/jpeg";
        const blob = Utilities.newBlob(Utilities.base64Decode(raw), type, data.name);
        fileId = DriveApp.getFolderById(FOLDER_DRIVE_ID).createFile(blob).getId();
      } catch(err){ 
        Logger.log("Image upload error: "+err.message); 
        return { success:false, message: "Gagal mengunggah gambar ke Drive." };
      }
    }
    
    const newId = getMaxId(rows)+1;
    const newRow = headers.map(h=>{
      switch(h){
        case "id": return newId;
        case "name": return data.name;
        case "category": return data.category||"";
        case "price": return Number(data.price)||0;
        case "stock": return Number(data.stock)||0;
        case "description": return data.description||"";
        case "fileId": return fileId;
        default: return "";
      }
    });
    sheet.appendRow(newRow);
    return { success:true, id:newId, fileId };
  }

  // ================= UPDATE =================
  const id = data?.id;
  if (!id) return { success:false, message:"id required" };
  const index = rows.findIndex(r => String(r[0]) === String(id));
  if (index === -1) return { success:false, message:"Product not found" };
  const rowIndex = index + 2;

  if (action === "update") {
    let newFileId = null;

    // Hapus file lama jika ada dan upload file baru
    if (data.imgBase64) {
      try {
        const oldFileId = rows[index][6]; // kolom fileId
        if (oldFileId) {
          try { DriveApp.getFileById(oldFileId).setTrashed(true); } 
          catch(e){ Logger.log("Gagal hapus file lama: "+e.message); }
        }
        const raw = data.imgBase64.split(",")[1];
        const type = (data.imgBase64.match(/data:(.*);base64,/)||[])[1] || "image/jpeg";
        const blob = Utilities.newBlob(Utilities.base64Decode(raw), type, data.name || "update_img");
        newFileId = DriveApp.getFolderById(FOLDER_DRIVE_ID).createFile(blob).getId();
      } catch(err) {
        Logger.log("Update image upload error: " + err.message);
        return { success: false, message: "Gagal mengunggah gambar baru." };
      }
    }

    // Update semua kolom
    headers.forEach((h,i)=>{
      let val;
      if(h==="id") return; // skip
      if(h==="fileId") {
        val = newFileId || rows[index][i]; // update fileId jika ada gambar baru
      } else if(data[h]!==undefined) {
        val = (h==="price"||h==="stock")?Number(data[h])||0:data[h];
      } else {
        val = rows[index][i];
      }
      sheet.getRange(rowIndex,i+1).setValue(val);
    });

    return { success:true, fileId: newFileId || rows[index][6] };
  }

  // ================= DELETE =================
  if (action === "delete") {
    sheet.deleteRow(rowIndex);
    return { success:true };
  }

  return { success:false, message:"Unknown product action" };
}

// =================== DO POST ===================
function doPost(e){
  try {
    if (!e?.postData?.contents) return sendJSON({ success:false, message:"No POST data" });
    const body = JSON.parse(e.postData.contents);
    Logger.log("POST body: "+JSON.stringify(body));

    const action = body.action; 
    const target = body.target || "product";
    if (!action) return sendJSON({ success:false, message:"Action required" });

    let result;
    if (target==="category") result = handleCategoryCrud(action, body.data);
    else if (target==="product") result = handleProductCrud(action, body.data);
    else result = { success:false, message:"Unknown target" };

    return sendJSON(result);

  } catch(err){
    Logger.log("POST Error: "+err.message);
    return sendJSON({ success:false, error:String(err.message) });
  }
}
