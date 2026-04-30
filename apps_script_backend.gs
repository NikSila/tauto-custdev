/**
 * TCar Concierge — CustDev backend
 * --------------------------------
 * Google Apps Script bound to a Google Sheet. Receives JSON payloads from
 * custdev_form.html and appends them as rows. Auto-creates and extends headers.
 *
 * SETUP (5 minutes):
 *   1. Create a new Google Sheet → name it "TCar Concierge — CustDev Responses"
 *   2. Extensions → Apps Script
 *   3. Replace the default Code.gs content with this entire file
 *   4. Save (💾) — name the project "TCar CustDev"
 *   5. Deploy → New deployment → Type: "Web app"
 *        - Description: "TCar CustDev endpoint"
 *        - Execute as: "Me"
 *        - Who has access: "Anyone"
 *      → Click Deploy → authorize the script when asked
 *   6. Copy the Web app URL (ends in .../exec)
 *   7. Open custdev_form.html → ⚙ Settings → paste URL → Save
 *
 * The first respondent's submission will create the "Responses" sheet and
 * the first set of headers. Each subsequent submission appends a new row,
 * adding any new column it sees. Open the sheet → File → Download → .xlsx
 */

// Sheet tabs are routed by meta.formType — qualitative goes to one tab,
// quantitative to another. Add more if you create more forms.
const SHEET_MAP = {
  main:         "Опрос",
  qualitative:  "Qualitative",
  quantitative: "Quantitative",
  _default:     "Responses"
};

/**
 * GET handler — used by the form's "Test" button to verify the endpoint.
 */
function doGet(e) {
  return ContentService
    .createTextOutput("TCar Concierge endpoint OK · " + new Date().toISOString())
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * POST handler — receives a CustDev submission and writes it to the right tab.
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const formType = (payload.meta && payload.meta.formType) || "_default";
    const sheetName = SHEET_MAP[formType] || SHEET_MAP._default;
    const flat = flattenAnswers(payload);
    appendRow_(flat, sheetName);
    return jsonOut_({ ok: true, tab: sheetName });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message || err) });
  }
}

/* ============================================================ */

function flattenAnswers(payload) {
  const out = {};
  out["timestamp_iso"]   = new Date().toISOString();
  out["timestamp_local"] = new Date().toLocaleString("ru-RU");

  const meta = payload.meta || {};
  out["meta.lang"]         = meta.lang || "";
  out["meta.mode"]         = meta.mode || "";
  out["meta.surveyVersion"] = meta.surveyVersion || "";
  out["meta.startedAt"]    = meta.startedAt || "";
  out["meta.submittedAt"]  = meta.submittedAt || "";

  const a = payload.answers || {};
  Object.keys(a).forEach(function (key) {
    const v = a[key];
    if (Array.isArray(v)) {
      out[key] = v.join("; ");
    } else if (v && typeof v === "object") {
      // money_matrix or similar — flatten to key.subkey
      Object.keys(v).forEach(function (sub) {
        out[key + "." + sub] = stringify_(v[sub]);
      });
    } else {
      out[key] = stringify_(v);
    }
  });

  return out;
}

function stringify_(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v);
}

function appendRow_(flat, sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Read existing headers (if any).
  let headers = [];
  if (sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(function (h) { return String(h); })
      .filter(function (h) { return h.length > 0; });
  }

  // Add any new keys to headers (preserve existing column order).
  const incomingKeys = Object.keys(flat);
  let headersChanged = false;
  incomingKeys.forEach(function (k) {
    if (headers.indexOf(k) === -1) {
      headers.push(k);
      headersChanged = true;
    }
  });

  // Write headers row if changed (or first time).
  if (headersChanged || sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#0B1437")
      .setFontColor("#FFFFFF")
      .setHorizontalAlignment("left");
    sheet.setFrozenRows(1);
  }

  // Build the row according to header order.
  const row = headers.map(function (h) {
    return Object.prototype.hasOwnProperty.call(flat, h) ? flat[h] : "";
  });

  // Append.
  const targetRow = Math.max(2, sheet.getLastRow() + 1);
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);

  // Light styling: alternate row tint.
  if (targetRow % 2 === 0) {
    sheet.getRange(targetRow, 1, 1, row.length).setBackground("#F7F8FC");
  }

  // Auto-resize a few key columns occasionally.
  if (targetRow <= 5) {
    sheet.autoResizeColumns(1, Math.min(headers.length, 20));
  }
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
 * Optional: convenience function to seed a test row.
 * Run this from the Apps Script editor to verify the sheet writes correctly.
 * ============================================================ */
function _testInsertQuantitative() {
  const fakePayload = {
    meta: {
      formType: "quantitative",
      lang: "ru", mode: "interview", surveyVersion: "1.0",
      startedAt: new Date().toISOString(), submittedAt: new Date().toISOString()
    },
    answers: {
      "profile.name": "Тестовая Анна",
      "profile.age": "25-34",
      "profile.gender": "f",
      "profile.city": "Москва",
      "incidents.events_12m": ["flat_tire", "drunk_drive"],
      "wtp.wtp_per_service": { "tire": "2000", "drunk": "3000", "tow": "5000" }
    }
  };
  doPost({ postData: { contents: JSON.stringify(fakePayload) } });
  Logger.log("Quantitative test row inserted.");
}

function _testInsertQualitative() {
  const fakePayload = {
    meta: {
      formType: "qualitative",
      lang: "ru", surveyVersion: "1.0",
      startedAt: new Date().toISOString(), submittedAt: new Date().toISOString()
    },
    answers: {
      "q1_context": "Toyota Camry 2019, езжу 3 года, каждый день на работу.",
      "q2_recent_pain": "На прошлой неделе спустило колесо в субботу — провозился 4 часа, никто не отвечал из эвакуаторов.",
      "q3_current_solution": "Свой проверенный мастер 5 лет, расходники беру у него же.",
      "q4_main_pain": "Бесит ждать, когда вообще не понимаешь сколько ждать.",
      "q5_real_question": "Где дешевле страхование на следующий год?",
      "q11_which_one": "Идея A — потому что я уже плачу банку и было бы удобно всё в одном месте."
    }
  };
  doPost({ postData: { contents: JSON.stringify(fakePayload) } });
  Logger.log("Qualitative test row inserted.");
}
