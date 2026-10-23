/**
 * X Architecture — registration + statistics backend (Google Apps Script).
 *
 * Bound to a Google Sheet. Creates two tabs automatically:
 *   Users   one row per registered person (upserted by email)
 *   Events  activity of registered users (program views, Telegram / Instagram / contact clicks)
 *
 * Public endpoint (web app, "Anyone"): receives registrations and events.
 * A registration is only accepted for an e-mail address that has been confirmed: the script mails a
 * 6-digit code (action 'vs'), checks it (action 'vc') and hands back a signed token that 'reg' requires.
 * Statistics and the user list are returned ONLY when the request carries the
 * secret ADMIN_KEY stored in Project Settings > Script properties.
 *
 * See backend/SETUP.md for the 5-minute setup.
 */

var USERS = 'Users', EVENTS = 'Events', TZ = 'Asia/Baghdad';
var UCOLS = ['uid', 'created', 'updated', 'name', 'email', 'country', 'countryName', 'kind', 'stage',
             'spec', 'gradYear', 'uni', 'contact', 'interests', 'lang', 'visits', 'last_seen', 'verified'];
var ECOLS = ['time', 'uid', 'type', 'detail'];
var KINDS = ['student', 'grad', 'other'];
var STAGES = ['1', '2', '3', '4', '5', 'pg', 'pre'];
var INTERESTS = ['courses', 'design', 'viz', 'critique', 'super'];
var ETYPES = ['visit', 'prog', 'tg', 'ig', 'contact'];

var VERSION = 2;                    // the site asks for this to know the script can confirm e-mail addresses
var VERIFY_REQUIRED = true;         // false = accept registrations without a confirmed address (not recommended)
var VCODE_TTL = 600;                // a code is valid for 10 minutes
var VTRIES = 5;                     // wrong guesses allowed per code
var VPERHOUR = 3;                   // codes per address per hour
var VDAILY = 90;                   // codes per day when mailing through Resend (its free plan allows 100 a day)
var VKEEP = 400 * 864e5;            // a token stays valid for about 13 months

// Leave empty when the script is bound to the sheet (Extensions > Apps Script).
// For a standalone script project, put the sheet id (the long part of its URL) here.
var SHEET_ID = '';

function sheet_(name, cols) {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(name);
  if (sh && sh.getLastColumn() > 0 && sh.getLastColumn() < cols.length) {   // an older sheet: add the new columns at the end
    var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    for (var i = hdr.length; i < cols.length; i++) {
      sh.getRange(1, i + 1).setValue(cols[i]).setFontWeight('bold');
      sh.getRange(1, i + 1, sh.getMaxRows(), 1).setNumberFormat('@');
    }
  }
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@'); // plain text: no formula injection
    sh.appendRow(cols);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold');
  }
  return sh;
}

function clean_(v, n) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 200);
}
function pick_(v, list) { v = clean_(v, 20); return list.indexOf(v) >= 0 ? v : ''; }
function now_() { return new Date().toISOString(); }
function col_(name) { return UCOLS.indexOf(name) + 1; }

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() { return out_({ ok: true, service: 'xarch', v: VERSION }); }

function doPost(e) {
  var res;
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var lock = LockService.getScriptLock();
    lock.waitLock(25000);
    try {
      if (d.a === 'reg') res = reg_(d);
      else if (d.a === 'vs') res = vs_(d);
      else if (d.a === 'vc') res = vc_(d);
      else if (d.a === 'vt') res = { ok: true, valid: tokOk_(clean_(d.email, 120).toLowerCase(), String(d.tok || '')) };
      else if (d.a === 'ev') res = ev_(d);
      else if (d.a === 'stats') res = stats_(d);
      else res = { ok: false, err: 'bad request' };
    } finally { lock.releaseLock(); }
  } catch (err) { res = { ok: false, err: String(err) }; }
  return out_(res);
}

/* ---------- e-mail: strict format, then a code mailed to the address ---------- */
var TYPOS = { 'gmial.com': 1, 'gmai.com': 1, 'gmail.co': 1, 'gmail.con': 1, 'gamil.com': 1, 'gnail.com': 1, 'gmal.com': 1,
  'gmail.cm': 1, 'gmil.com': 1, 'gmaill.com': 1, 'hotmial.com': 1, 'hotmal.com': 1, 'hotmail.con': 1, 'hotmail.co': 1,
  'yaho.com': 1, 'yahooo.com': 1, 'yahoo.con': 1, 'yhoo.com': 1, 'outlok.com': 1, 'outlook.con': 1, 'icloud.con': 1, 'iclould.com': 1 };
var DISPOSABLE = { 'mailinator.com': 1, 'guerrillamail.com': 1, '10minutemail.com': 1, 'tempmail.com': 1, 'temp-mail.org': 1,
  'yopmail.com': 1, 'trashmail.com': 1, 'getnada.com': 1, 'sharklasers.com': 1, 'dispostable.com': 1, 'maildrop.cc': 1,
  'throwawaymail.com': 1, 'fakeinbox.com': 1, 'mohmal.com': 1, 'emailondeck.com': 1, 'tempmailo.com': 1, 'mintemail.com': 1 };

// '' when the address looks real, otherwise 'email' (bad format), 'typo' or 'disposable'
function emailWhy_(email) {
  var i = email.lastIndexOf('@');
  if (i < 1 || email.length > 254) return 'email';
  var lo = email.slice(0, i), dm = email.slice(i + 1);
  if (!/^[a-z0-9._%+\-]+$/.test(lo) || lo.length > 64 || lo.charAt(0) === '.' || lo.slice(-1) === '.' || lo.indexOf('..') >= 0) return 'email';
  if (!/^(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(dm)) return 'email';
  if (TYPOS[dm]) return 'typo';
  if (DISPOSABLE[dm]) return 'disposable';
  if (dm === 'gmail.com' || dm === 'googlemail.com') {          // Gmail: 6-30 letters or digits, dots and +tags ignored
    var g = lo.split('+')[0].replace(/\./g, '');
    if (g.length < 6 || g.length > 30 || !/^[a-z0-9]+$/.test(g)) return 'email';
  }
  return '';
}

function vkey_() {
  var p = PropertiesService.getScriptProperties(), k = p.getProperty('TOKEN_KEY');
  if (!k) { k = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('TOKEN_KEY', k); }
  return k;
}
function b64_(bytes) { return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, ''); }
function hmac_(s) { return b64_(Utilities.computeHmacSha256Signature(s, vkey_())); }
function sha_(s) { return b64_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)); }
function tok_(email) { var exp = Date.now() + VKEEP; return exp + '.' + hmac_(email + '|' + exp); }
function tokOk_(email, tok) {
  var m = /^(\d{13})\.([A-Za-z0-9_-]{20,})$/.exec(String(tok || ''));
  return !!m && +m[1] > Date.now() && m[2] === hmac_(email + '|' + m[1]);
}

/* ---------- sender ----------
   There are three ways to send the code, checked in this order:
   1. Resend (Script properties RESEND_API_KEY + MAIL_FROM): the code goes out from the site's own address through Resend.
   2. A Gmail "Send mail as" address (Script property MAIL_ALIAS, for example info@xarch.site): the script mails through its
      Gmail, but the message is sent from that address (Gmail relays it through the mailbox's own SMTP server), so the owner's
      personal address never shows. The address must first be added in Gmail > Settings > Accounts and Import.
   3. Nothing set: MailApp, i.e. from the Google account that owns this script.
   With 1 or 2 configured, if the send fails nothing is sent from the owner's personal address. */
function mailVia_() {
  var p = PropertiesService.getScriptProperties(), k = p.getProperty('RESEND_API_KEY'), f = String(p.getProperty('MAIL_FROM') || '').trim();
  return k && /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(f) ? { key: k, from: f } : null;
}
function aliasOf_() {
  var a = String(PropertiesService.getScriptProperties().getProperty('MAIL_ALIAS') || '').trim();
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(a) ? a : '';
}
function sendMail_(to, subject, text, html) {
  var m = mailVia_();
  if (!m) {
    var al = aliasOf_();
    if (!al) { MailApp.sendEmail({ to: to, name: 'X Architecture', noReply: true, subject: subject, body: text, htmlBody: html }); return; }
    if (GmailApp.getAliases().indexOf(al) < 0) { Logger.log('MAIL_ALIAS ' + al + ' is not a verified "Send mail as" address of this Gmail account'); throw new Error('alias'); }
    GmailApp.sendEmail(to, subject, text, { from: al, name: 'X Architecture', htmlBody: html });
    return;
  }
  var r = UrlFetchApp.fetch('https://api.resend.com/emails', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + m.key },
    payload: JSON.stringify({ from: 'X Architecture <' + m.from + '>', to: [to], subject: subject, text: text, html: html })
  });
  var c = r.getResponseCode();
  if (c < 200 || c > 299) { Logger.log('Resend ' + c + ' ' + String(r.getContentText()).slice(0, 300)); throw new Error('resend ' + c); }
}

// step 1: mail a 6-digit code to the address
function vs_(d) {
  if (d.hp) return { ok: true };                                // honeypot
  var email = clean_(d.email, 120).toLowerCase(), why = emailWhy_(email);
  if (why) return { ok: false, err: why };
  var cache = CacheService.getScriptCache(), h = sha_(email), kc = 'vc:' + h, ks = 'vs:' + h, kl = 'vl:' + h;
  var sent = parseInt(cache.get(ks) || '0', 10), last = parseInt(cache.get(kl) || '0', 10);
  if (sent >= VPERHOUR || (last && Date.now() - last < 25000)) return { ok: false, err: 'wait' };
  var api = !!mailVia_(), kd = 'vd:' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd'), today = parseInt(cache.get(kd) || '0', 10);
  if (api ? today >= VDAILY : MailApp.getRemainingDailyQuota() < 5) return { ok: false, err: 'quota' };
  var code = String(100000 + (parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 8), 16) % 900000));
  try {
    sendMail_(email,
      'رمز التأكيد ' + code + ' — X Architecture',
      'رمز التأكيد الخاص بك: ' + code + '\nصالح لمدة 10 دقائق. إذا لم تطلبه فتجاهل هذه الرسالة.\n\n' +
      'Your confirmation code: ' + code + '\nValid for 10 minutes. If you did not ask for it, ignore this message.\n\nX Architecture',
      '<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;text-align:center">' +
        '<p style="direction:rtl;font-size:15px;color:#333">رمز التأكيد الخاص بك</p>' +
        '<p style="font-size:34px;letter-spacing:8px;font-weight:bold;color:#8a7240;margin:6px 0 14px">' + code + '</p>' +
        '<p style="direction:rtl;font-size:13px;color:#666">صالح لمدة 10 دقائق. إذا لم تطلبه فتجاهل هذه الرسالة.</p>' +
        '<p style="font-size:13px;color:#666">Your confirmation code. Valid for 10 minutes. If you did not ask for it, ignore this message.</p>' +
        '<p style="font-size:12px;color:#999;margin-top:18px">X Architecture</p></div>');
  } catch (err) { return { ok: false, err: 'send' }; }
  cache.put(kc, JSON.stringify({ h: sha_(code + '|' + email), n: 0 }), VCODE_TTL);
  cache.put(ks, String(sent + 1), 3600);
  if (api) cache.put(kd, String(today + 1), 90000);
  cache.put(kl, String(Date.now()), 120);
  return { ok: true };
}

// step 2: check the code and hand back a signed token for that address
function vc_(d) {
  var email = clean_(d.email, 120).toLowerCase(), code = String(d.code || '').replace(/\D/g, '');
  if (emailWhy_(email) || code.length !== 6) return { ok: false, err: 'bad' };
  var cache = CacheService.getScriptCache(), kc = 'vc:' + sha_(email), raw = cache.get(kc);
  if (!raw) return { ok: false, err: 'expired' };
  var o = JSON.parse(raw);
  if (sha_(code + '|' + email) !== o.h) {
    o.n++;
    if (o.n >= VTRIES) { cache.remove(kc); return { ok: false, err: 'tries' }; }
    cache.put(kc, JSON.stringify(o), VCODE_TTL);
    return { ok: false, err: 'bad' };
  }
  cache.remove(kc);
  return { ok: true, tok: tok_(email) };
}

/* Run this once from the editor (Run > authorizeMail) so Google asks you to allow the script to send mail
   (Gmail access if MAIL_ALIAS is used, and Resend if you use that). Run it again after every change of the sender settings: it only reports them. */
function authorizeMail() {
  var m = mailVia_(), al = aliasOf_();
  if (m) Logger.log('sender: ' + m.from + ' (through Resend)');
  else if (al) Logger.log('sender: ' + al + ' (Gmail Send-as). Verified Send-as addresses of this account: ' + GmailApp.getAliases().join(', ') + '. Mails left today: ' + MailApp.getRemainingDailyQuota());
  else Logger.log('sender: the Google account that owns this script (MailApp), mails left today: ' + MailApp.getRemainingDailyQuota());
}
/* Sends one test message to the owner of this script, through whatever sender is configured (Run > testMail). */
function testMail() {
  var to = Session.getEffectiveUser().getEmail();
  sendMail_(to, 'X Architecture — test / تجربة', 'If you can read this, the sender works.\nإذا وصلتك هذه الرسالة فالإرسال يعمل.', '<p>If you can read this, the sender works.</p><p style="direction:rtl">إذا وصلتك هذه الرسالة فالإرسال يعمل.</p>');
  Logger.log('test message sent to ' + to + (mailVia_() ? ' through Resend' : aliasOf_() ? ' from ' + aliasOf_() + ' (Gmail Send-as)' : ' through MailApp'));
}

/* ---------- registration (upsert by email) ---------- */
function reg_(d) {
  if (d.hp) return { ok: true };                         // honeypot: bots fill hidden fields
  var email = clean_(d.email, 120).toLowerCase();
  var name = clean_(d.name, 80);
  if (!name || emailWhy_(email)) return { ok: false, err: 'invalid' };
  var verified = tokOk_(email, d.tok);
  if (VERIFY_REQUIRED && !verified) return { ok: false, err: 'unverified' };
  var kind = pick_(d.kind, KINDS) || 'student';
  var ints = (Array.isArray(d.interests) ? d.interests : []).filter(function (x) { return INTERESTS.indexOf(x) >= 0; });
  var row = {
    uid: clean_(d.uid, 60), name: name, email: email,
    country: clean_(d.country, 2).toUpperCase(), countryName: clean_(d.countryName, 60),
    kind: kind, stage: kind === 'student' ? pick_(d.stage, STAGES) : '',
    spec: clean_(d.spec, 80), gradYear: kind === 'grad' ? clean_(d.gradYear, 4) : '',
    uni: kind === 'other' ? '' : clean_(d.uni, 100), contact: clean_(d.contact, 60),
    interests: ints.join(','), lang: pick_(d.lang, ['ar', 'en', 'tr', 'fr', 'ku'])
  };
  if (verified) row.verified = now_();
  var sh = sheet_(USERS, UCOLS), last = sh.getLastRow(), at = 0;
  if (last > 1) {
    var f = sh.getRange(2, col_('email'), last - 1, 1).createTextFinder(email).matchEntireCell(true).matchCase(false).findNext();
    if (f) at = f.getRow();
  }
  var t = now_();
  if (at) {                                              // existing person: update
    UCOLS.forEach(function (c) {
      if (c === 'uid' && !row.uid) return;
      if (row[c] !== undefined) sh.getRange(at, col_(c)).setValue(row[c]);
    });
    sh.getRange(at, col_('updated')).setValue(t);
  } else {
    var vals = UCOLS.map(function (c) {
      if (c === 'created' || c === 'updated' || c === 'last_seen') return t;
      if (c === 'visits') return '1';
      return row[c] === undefined ? '' : row[c];
    });
    sh.appendRow(vals);
  }
  return { ok: true };
}

/* ---------- activity events ---------- */
function ev_(d) {
  var type = pick_(d.t, ETYPES), uid = clean_(d.uid, 60);
  if (!type || !uid) return { ok: false, err: 'invalid' };
  sheet_(EVENTS, ECOLS).appendRow([now_(), uid, type, clean_(d.d, 60)]);
  if (type === 'visit') {
    var sh = sheet_(USERS, UCOLS), last = sh.getLastRow();
    if (last > 1) {
      var f = sh.getRange(2, 1, last - 1, 1).createTextFinder(uid).matchEntireCell(true).findNext();
      if (f) {
        var r = f.getRow();
        sh.getRange(r, col_('visits')).setValue(String((parseInt(sh.getRange(r, col_('visits')).getValue(), 10) || 0) + 1));
        sh.getRange(r, col_('last_seen')).setValue(now_());
      }
    }
  }
  return { ok: true };
}

/* ---------- statistics (admin key required) ---------- */
function count_(map, key) { if (key === '' || key == null) return; map[key] = (map[key] || 0) + 1; }
function top_(map, n) {
  return Object.keys(map).map(function (k) { return [k, map[k]]; })
    .sort(function (a, b) { return b[1] - a[1]; }).slice(0, n || 15);
}
function day_(iso) { return Utilities.formatDate(new Date(iso), TZ, 'yyyy-MM-dd'); }

function stats_(d) {
  var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key) return { ok: false, err: 'ADMIN_KEY is not set in Script properties' };
  if (String(d.key || '') !== key) { Utilities.sleep(800); return { ok: false, err: 'wrong key' }; }

  var us = sheet_(USERS, UCOLS), ev = sheet_(EVENTS, ECOLS);
  var u = us.getLastRow() > 1 ? us.getRange(2, 1, us.getLastRow() - 1, UCOLS.length).getValues() : [];
  var e = ev.getLastRow() > 1 ? ev.getRange(2, 1, ev.getLastRow() - 1, ECOLS.length).getValues() : [];

  var today = day_(now_()), t7 = Date.now() - 7 * 864e5, t30 = Date.now() - 30 * 864e5;
  var s = { total: u.length, today: 0, last7: 0, last30: 0, country: {}, countryName: {}, kind: {}, stage: {},
            uni: {}, spec: {}, interests: {}, lang: {}, byDay: {} };
  var users = u.map(function (r) {
    var o = {}; UCOLS.forEach(function (c, i) { o[c] = String(r[i]); }); return o;
  });
  users.forEach(function (o) {
    var ts = new Date(o.created).getTime();
    if (day_(o.created) === today) s.today++;
    if (ts >= t7) s.last7++;
    if (ts >= t30) s.last30++;
    count_(s.country, o.country); if (o.country) s.countryName[o.country] = o.countryName;
    count_(s.kind, o.kind); count_(s.stage, o.stage);
    count_(s.uni, o.uni.toLowerCase()); count_(s.spec, o.spec.toLowerCase());
    o.interests.split(',').forEach(function (i) { count_(s.interests, i); });
    count_(s.lang, o.lang);
    count_(s.byDay, day_(o.created));
  });

  var ev2 = { prog: {}, tg: 0, ig: 0, contact: 0, visits: 0, active7: {}, active30: {} };
  e.forEach(function (r) {
    var ts = new Date(r[0]).getTime(), type = r[2], uid = r[1];
    if (type === 'prog') count_(ev2.prog, r[3]);
    else if (type === 'tg') ev2.tg++;
    else if (type === 'ig') ev2.ig++;
    else if (type === 'contact') ev2.contact++;
    else if (type === 'visit') ev2.visits++;
    if (ts >= t7) ev2.active7[uid] = 1;
    if (ts >= t30) ev2.active30[uid] = 1;
  });

  users.sort(function (a, b) { return a.created < b.created ? 1 : -1; });
  return {
    ok: true, generated: now_(),
    total: s.total, today: s.today, last7: s.last7, last30: s.last30,
    active7: Object.keys(ev2.active7).length, active30: Object.keys(ev2.active30).length,
    country: top_(s.country, 60).map(function (x) { return [x[0], s.countryName[x[0]] || '', x[1]]; }),
    kind: s.kind, stage: s.stage, interests: s.interests, lang: s.lang,
    uni: top_(s.uni, 20), spec: top_(s.spec, 20), byDay: s.byDay,
    events: { prog: top_(ev2.prog, 25), tg: ev2.tg, ig: ev2.ig, contact: ev2.contact, visits: ev2.visits },
    users: users.slice(0, 3000)
  };
}

/* Optional: run once from the editor to create a random admin key (shown in the log). */
function makeAdminKey() {
  var chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', k = '';
  for (var i = 0; i < 28; i++) k += chars.charAt(Math.floor(Math.random() * chars.length));
  PropertiesService.getScriptProperties().setProperty('ADMIN_KEY', k);
  Logger.log('ADMIN_KEY = ' + k);
}
