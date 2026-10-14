/**
 * NE Craft order inbox
 * Saves every order in a Google Sheet tab called "Orders" and emails you.
 * Setup steps are in README.txt.
 */
const ADMIN_KEY = 'CHANGE-THIS-TO-A-LONG-SECRET';   // type the same secret in Admin > Settings > Admin key
const NOTIFY_EMAIL = 'necraft.in@gmail.com';

const HEAD = ['Order ID', 'Placed', 'Status', 'Customer', 'Phone', 'Email', 'Address', 'City', 'State', 'PIN',
  'Map link', 'Items', 'Total (Rs)', 'Payment', 'UPI transaction ID', 'Paid', 'Courier', 'Updated', 'JSON'];
const JSON_COL = HEAD.length;

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Orders');
  if (!sh) { sh = ss.insertSheet('Orders'); sh.appendRow(HEAD); sh.setFrozenRows(1); }
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function findRow_(sh, id) {
  const n = sh.getLastRow() - 1; if (n < 1) return 0;
  const v = sh.getRange(2, 1, n, 1).getValues();
  for (let i = 0; i < v.length; i++) if (String(v[i][0]) === String(id)) return i + 2;
  return 0;
}
function clean_(v, max) { return String(v == null ? '' : v).slice(0, max || 300); }

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents), sh = sheet_();

    if (d.action === 'order') {
      const o = d.order;
      if (!o || !o.id || !o.addr || !o.items || !o.totals || !o.pay) return out_({ ok: false, error: 'bad order' });
      if (!/^NEC-[A-Z0-9-]{4,20}$/.test(String(o.id))) return out_({ ok: false, error: 'bad id' });
      if (!findRow_(sh, o.id)) {
        const a = o.addr;
        const address = [a.line, a.area].filter(String).join(', ');
        const map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([a.line, a.area, a.city, a.state, a.pin].join(', '));
        const items = o.items.map(function (i) { return clean_(i.name, 80) + ' x' + Number(i.qty); }).join('; ');
        sh.appendRow([o.id, new Date(o.createdAt), 'Placed', clean_(a.name, 80), "'" + clean_(a.phone, 12), clean_(o.email, 100),
          clean_(address, 250), clean_(a.city, 60), clean_(a.state, 60), "'" + clean_(a.pin, 8), map, clean_(items, 500), Number(o.totals.total),
          o.pay.method === 'UPI' ? 'UPI' : 'Cash on delivery', clean_(o.pay.utr, 20), 'No', '', new Date(), JSON.stringify(o)]);
        const body = 'New order ' + o.id + '\n\nCustomer: ' + a.name + '\nPhone: ' + a.phone + '\nEmail: ' + (o.email || '-') +
          '\n\nDeliver to:\n' + address + '\n' + a.city + ', ' + a.state + ' ' + a.pin + '\nMap: ' + map +
          '\n\nItems: ' + items + '\nTotal: Rs ' + o.totals.total +
          '\nPayment: ' + (o.pay.method === 'UPI' ? 'UPI, transaction ID ' + o.pay.utr + ' (check your UPI app, then mark as received in Admin)' : 'Cash on delivery, collect Rs ' + o.totals.total);
        MailApp.sendEmail(NOTIFY_EMAIL, 'New order ' + o.id + ' - Rs ' + o.totals.total, body);
      }
      return out_({ ok: true });
    }

    if (d.key !== ADMIN_KEY) return out_({ ok: false, error: 'key' });

    if (d.action === 'list') {
      const n = sh.getLastRow() - 1;
      const rows = n > 0 ? sh.getRange(2, JSON_COL, n, 1).getValues().map(function (r) { return JSON.parse(r[0]); }) : [];
      return out_({ ok: true, orders: rows });
    }

    if (d.action === 'status') {
      const r = findRow_(sh, d.id); if (!r) return out_({ ok: false, error: 'not found' });
      const o = JSON.parse(sh.getRange(r, JSON_COL).getValue());
      o.status = clean_(d.status, 30); o.courier = clean_(d.courier, 100); if (d.paid) o.pay.paid = true;
      if (Array.isArray(d.history)) o.history = d.history; o.updated = Date.now();
      sh.getRange(r, 3).setValue(o.status);
      sh.getRange(r, 16).setValue(o.pay.paid ? 'Yes' : 'No');
      sh.getRange(r, 17).setValue(o.courier);
      sh.getRange(r, 18).setValue(new Date());
      sh.getRange(r, JSON_COL).setValue(JSON.stringify(o));
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function doGet(e) {
  const p = e.parameter || {};
  if (p.action === 'track') {
    const sh = sheet_(), r = findRow_(sh, p.id); if (!r) return out_({ ok: false });
    const o = JSON.parse(sh.getRange(r, JSON_COL).getValue());
    if (String(o.addr.phone) !== String(p.phone)) return out_({ ok: false });
    return out_({ ok: true, order: { id: o.id, status: o.status, history: o.history, courier: o.courier || '', paid: !!o.pay.paid,
      method: o.pay.method, total: o.totals.total, items: o.items.map(function (i) { return i.name + ' x' + i.qty; }) } });
  }
  return out_({ ok: true, name: 'NE Craft order inbox' });
}
