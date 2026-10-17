/**
 * Dating with NhiLe Team 18/10: nhận Form A, Form B từ trang khách và trả dữ liệu Bản đồ kết nối.
 * Cách dùng (làm một lần, khoảng 5 phút) nằm trong file HUONG-DAN.md cùng thư mục.
 *
 * Ba tab trong Google Sheet (tự tạo lần đầu):
 *  - FormA : mỗi khách một dòng (có SĐT/Zalo, chỉ team thấy)
 *  - FormB : phiếu cuối buổi
 *  - BanDo : chỉ gồm cột được phép hiện cho khách. KHÔNG có SĐT. Trang khách chỉ đọc tab này.
 */

var HEAD = {
  FormA: ['thoi_gian', 'ten', 'sdt', 'nghe', 'tim', 'ba', 'giup', 'hoc', 'ai', 'dong_y'],
  FormB: ['thoi_gian', 'sdt', 'mang', 'diem', 'chua', 'hoc', 'tiep'],
  BanDo: ['ten', 'nghe', 'ba', 'tim', 'giup', 'gap1', 'ly1', 'gap2', 'ly2']
};
var MAX = 1500;

function sheet_(name) {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEAD[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD[name].length).setFontWeight('bold');
  }
  return sh;
}

function setup() {
  sheet_('FormA'); sheet_('FormB'); sheet_('BanDo');
  var first = SpreadsheetApp.getActive().getSheetByName('Trang tính1');
  if (first && first.getLastRow() === 0 && SpreadsheetApp.getActive().getSheets().length > 1) {
    SpreadsheetApp.getActive().deleteSheet(first);
  }
}

// Chống chèn công thức vào ô: chữ bắt đầu bằng = + - @ thì thêm dấu nháy phía trước.
function clean_(v) {
  if (Array.isArray(v)) v = v.join('; ');
  v = String(v == null ? '' : v).replace(/\s+$/g, '').slice(0, MAX);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // 15 người bấm gửi cùng lúc vẫn xếp hàng được
    var body = JSON.parse(e.postData.contents);
    var type = body.type, d = body.data || {};
    var now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    if (type === 'A') {
      sheet_('FormA').appendRow([now, clean_(d.ten), clean_(d.sdt), clean_(d.nghe), clean_(d.tim), clean_(d.ba), clean_(d.giup), clean_(d.hoc), clean_(d.ai), clean_(d.dy)]);
    } else if (type === 'B') {
      sheet_('FormB').appendRow([now, clean_(d.sdt), clean_(d.mang), clean_(d.diem), clean_(d.chua), clean_(d.hoc), clean_(d.tiep)]);
    } else {
      return json_({ ok: false, error: 'type' });
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

// Trang khách gọi ?action=map để lấy Bản đồ kết nối (chỉ tab BanDo).
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action === 'map') {
      var sh = sheet_('BanDo');
      var n = sh.getLastRow();
      var rows = [];
      if (n > 1) {
        var vals = sh.getRange(2, 1, n - 1, HEAD.BanDo.length).getValues();
        vals.forEach(function (r) {
          if (!r[0]) return;
          var o = {};
          HEAD.BanDo.forEach(function (k, i) { o[k] = String(r[i] == null ? '' : r[i]); });
          rows.push(o);
        });
      }
      return json_({ ok: true, rows: rows });
    }
    return json_({ ok: true, hello: 'dating-18-10' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Menu trong Google Sheet: Dating > Tạo Bản đồ từ Form A
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Dating')
    .addItem('Chuẩn bị các tab (làm một lần)', 'setup')
    .addItem('Tạo Bản đồ từ Form A', 'taoBanDo')
    .addToUi();
}

/**
 * Chép từ FormA sang BanDo, chỉ những người đã chọn "Đồng ý", bỏ SĐT, bỏ cột hoc/ai.
 * Người nào đã có trong BanDo (trùng tên) thì không chép lại, nên chạy nhiều lần được.
 * Các cột gap1, ly1, gap2, ly2 để trống: dán kết quả AI vào đúng 4 cột này.
 */
function taoBanDo() {
  setup();
  var a = sheet_('FormA'), b = sheet_('BanDo');
  var na = a.getLastRow();
  if (na < 2) { SpreadsheetApp.getUi().alert('Form A chưa có ai.'); return; }
  var have = {};
  var nb = b.getLastRow();
  if (nb > 1) b.getRange(2, 1, nb - 1, 1).getValues().forEach(function (r) { have[String(r[0]).toLowerCase().trim()] = true; });
  var vals = a.getRange(2, 1, na - 1, HEAD.FormA.length).getValues();
  var add = [];
  vals.forEach(function (r) {
    var ten = String(r[1]).trim();
    if (!ten || String(r[9]).trim() !== 'Đồng ý' || have[ten.toLowerCase()]) return;
    have[ten.toLowerCase()] = true;
    add.push([r[1], r[3], r[5], r[4], r[6], '', '', '', '']); // ten, nghe, ba, tim, giup
  });
  if (add.length) b.getRange(b.getLastRow() + 1, 1, add.length, HEAD.BanDo.length).setValues(add);
  SpreadsheetApp.getUi().alert('Đã thêm ' + add.length + ' người vào BanDo.');
}
