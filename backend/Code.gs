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
var COMMUNITY = 1;                  // 1 = this script also runs the Community section (see the bottom of the file)
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

function raw_(str) { return ContentService.createTextOutput(str).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  var a = e && e.parameter && e.parameter.a;
  try {
    if (a === 'cfeed') return raw_(cfeed_());
    if (a === 'cget') return raw_(cget1_(clean_(e.parameter.id, 30)));
  } catch (err) { return out_({ ok: false, err: String(err) }); }
  return out_({ ok: true, service: 'xarch', v: VERSION, c: COMMUNITY });
}

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
      else if (d.a === 'cpost') res = cpost_(d);
      else if (d.a === 'cimg') res = cimg_(d);
      else if (d.a === 'clike') res = clike_(d);
      else if (d.a === 'cdel') res = cdel_(d);
      else if (d.a === 'crep') res = crep_(d);
      else if (d.a === 'cmine') res = cmine_(d);
      else if (d.a === 'cbsave') res = cbsave_(d);
      else if (d.a === 'cadm') res = cadm_(d);
      else if (d.a === 'cmod') res = cmod_(d);
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

/* =====================================================================================================
   COMMUNITY: posts (projects and published boards), hearts, reports, every member's private board.
   Tabs created automatically: Posts, Likes, Images, Boards, Reports.
   Pictures are kept in a Drive folder named CFOLDER (created on the first upload), shared "anyone with the link".
   Run authorizeCommunity once from the editor, then publish a NEW VERSION of the web app (see backend/SETUP.md, part 8).
   ===================================================================================================== */
var POSTS = 'Posts', BOARDS = 'Boards', LIKES = 'Likes', IMGS = 'Images', REPORTS = 'Reports';
var PCOLS = ['id', 'created', 'updated', 'status', 'kind', 'ak', 'email', 'name', 'uni', 'title', 'text', 'tags', 'sw', 'imgs', 'board', 'likes', 'reports'];
var BCOLS = ['ak', 'email', 'updated', 'json'];
var LCOLS = ['k', 'pid', 'ak', 't'];
var ICOLS = ['id', 'created', 'ak', 'kind', 'bytes'];
var RCOLS = ['time', 'pid', 'ak', 'why'];
var CMOD = 'pre';                    // 'pre': a new post shows only after you approve it (admin page). 'post': it shows at once, and is hidden when 3 people report it
var CFOLDER = 'XArch Community';
var CFEED = 150;                     // newest posts sent to the site
var CIMG_MAX = 1400000;              // biggest picture accepted (base64 characters, about 1 MB)
var CBOARD_MAX = 45000;              // biggest board (characters of JSON; a sheet cell holds 50000)
var SWL = ['Revit', 'AutoCAD', 'Rhino', 'SketchUp', '3ds Max', 'Blender', 'Lumion', 'Enscape', 'D5 Render', 'Twinmotion', 'V-Ray', 'Corona', 'Grasshopper', 'Photoshop', 'Illustrator', 'InDesign', 'ArchiCAD', 'Hand'];

function ak_(email) { return hmac_('ak|' + email).slice(0, 12); }
function rid_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 10); }
function text_(v, n) {               // like clean_ but keeps line breaks
  return String(v == null ? '' : v).replace(/\r/g, '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, n || 1500);
}
function nof_(v) { return String(v).replace(/^[=+\-@\s]+/, ''); }       // a cell must never start like a formula
function rows_(sh, cols) {
  var last = sh.getLastRow();
  return last > 1 ? sh.getRange(2, 1, last - 1, cols.length).getValues() : [];
}
function obj_(r, cols) { var o = {}; cols.forEach(function (c, i) { o[c] = r[i]; }); return o; }
function ci_(cols, name) { return cols.indexOf(name) + 1; }
function jarr_(v) { try { var a = JSON.parse(v || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }

/* cache helpers for strings above the 100 KB limit of one cache entry */
function cput_(key, str, ttl) {
  var cache = CacheService.getScriptCache(), n = Math.ceil(str.length / 90000) || 1, o = {};
  for (var i = 0; i < n; i++) o[key + '#' + i] = str.slice(i * 90000, (i + 1) * 90000);
  o[key + '#n'] = String(n);
  cache.putAll(o, ttl);
}
function cget_(key) {
  var cache = CacheService.getScriptCache(), n = parseInt(cache.get(key + '#n') || '0', 10);
  if (!n) return '';
  var ks = [], i;
  for (i = 0; i < n; i++) ks.push(key + '#' + i);
  var got = cache.getAll(ks), s = '';
  for (i = 0; i < n; i++) { if (got[ks[i]] == null) return ''; s += got[ks[i]]; }
  return s;
}
function cdrop_(key) {
  var cache = CacheService.getScriptCache(), n = parseInt(cache.get(key + '#n') || '0', 10), ks = [key + '#n'];
  for (var i = 0; i < n; i++) ks.push(key + '#' + i);
  cache.removeAll(ks);
}
function lim_(key, max, ttl) {        // true while the counter is under max
  var cache = CacheService.getScriptCache(), n = parseInt(cache.get(key) || '0', 10);
  if (n >= max) return false;
  cache.put(key, String(n + 1), ttl);
  return true;
}

/* who is asking: a signed token for an address that is registered */
function who_(d) {
  var email = clean_(d.email, 120).toLowerCase();
  if (emailWhy_(email) || !tokOk_(email, String(d.tok || ''))) return null;
  var cache = CacheService.getScriptCache(), ck = 'cu:' + sha_(email), c = cache.get(ck), u = null;
  if (c) { try { u = JSON.parse(c); } catch (e) { u = null; } }
  if (!u) {
    var sh = sheet_(USERS, UCOLS), last = sh.getLastRow();
    if (last < 2) return null;
    var em = sh.getRange(2, col_('email'), last - 1, 1).getValues();
    for (var i = 0; i < em.length; i++) {
      if (String(em[i][0]).toLowerCase() === email) {
        var r = sh.getRange(i + 2, 1, 1, UCOLS.length).getValues()[0];
        u = { n: String(r[UCOLS.indexOf('name')]), u: String(r[UCOLS.indexOf('uni')]), s: String(r[UCOLS.indexOf('stage')]) };
        break;
      }
    }
    if (!u) return null;
    cache.put(ck, JSON.stringify(u), 3600);
  }
  return { email: email, ak: ak_(email), name: u.n, uni: u.u, stage: u.s };
}

function folder_() {
  var it = DriveApp.getFoldersByName(CFOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CFOLDER);
}
/* Run once from the editor: Google asks you to allow Drive access for the pictures. */
function authorizeCommunity() {
  var f = folder_();
  Logger.log('Drive folder ready: ' + f.getName() + ' (' + f.getUrl() + '). Now publish a NEW VERSION of the web app.');
}

var IDRE = /^[A-Za-z0-9_-]{8,64}$/;
// pictures and links that cards may point to outside Drive: only these free, public sources
var EXTRE = /^https:\/\/(upload\.wikimedia\.org\/|commons\.wikimedia\.org\/|[a-z]{2,3}\.wikipedia\.org\/|www\.artic\.edu\/(iiif|artworks)\/|images\.metmuseum\.org\/)[^\s"'<>]{1,400}$/;
function num_(v, a, b, d) { v = +v; if (!isFinite(v)) return d; return Math.max(a, Math.min(b, Math.round(v))); }
// a board arrives from the browser: keep only known card kinds and known fields, clamp the numbers, check every address
function cleanBoard_(b) {
  var cards = [], ids = {};
  (b && Array.isArray(b.cards) ? b.cards : []).slice(0, 80).forEach(function (c) {
    if (!c || typeof c !== 'object') return;
    var t = (c.t === 'i' || c.t === 'n' || c.t === 'p' || c.t === 'a') ? c.t : '';
    var id = String(c.id || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 16);
    if (!t || !id || ids[id]) return;
    var o = { id: id, t: t, x: num_(c.x, -20000, 20000, 0), y: num_(c.y, -20000, 20000, 0), w: num_(c.w, 40, 1200, 200), h: num_(c.h, 40, 1200, 150), z: num_(c.z, 0, 9999, 1) };
    if (t === 'i') {
      var src = String(c.src || '');
      if (!IDRE.test(src) && !EXTRE.test(src)) return;
      o.src = src;
      if (c.cp) o.cp = clean_(c.cp, 80);
      if (c.cr) o.cr = clean_(c.cr, 160);
      if (c.lk && EXTRE.test(String(c.lk))) o.lk = String(c.lk);
    } else if (t === 'n') {
      o.tx = text_(c.tx, 600); o.c = num_(c.c, 0, 3, 0);
    } else if (t === 'p') {
      var pid = String(c.pid || '');
      if (!IDRE.test(pid)) return;
      o.pid = pid; o.ti = clean_(c.ti, 90); o.n = clean_(c.n, 60);
      if (c.im && IDRE.test(String(c.im))) o.im = String(c.im);
    } else {
      o.ti = clean_(c.ti, 120); o.tx = clean_(c.tx, 260);
      if (c.im && EXTRE.test(String(c.im))) o.im = String(c.im);
      if (c.lk && EXTRE.test(String(c.lk))) o.lk = String(c.lk);
    }
    ids[id] = 1; cards.push(o);
  });
  var links = [], seen = {};
  (b && Array.isArray(b.links) ? b.links : []).slice(0, 120).forEach(function (l) {
    if (!l || typeof l !== 'object') return;
    var a = String(l.a || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 16), z = String(l.b || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 16);
    var id = String(l.id || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 16);
    if (!id || !ids[a] || !ids[z] || a === z || seen[a + '|' + z] || seen[z + '|' + a]) return;
    seen[a + '|' + z] = 1;
    links.push({ id: id, a: a, b: z, tx: clean_(l.tx, 40) });
  });
  return { cards: cards, links: links };
}

// a picture sent by a member (a JPEG already shrunk by the browser)
function cimg_(d) {
  var u = who_(d); if (!u) return { ok: false, err: 'auth' };
  if (!lim_('im:' + u.ak, 60, 86400)) return { ok: false, err: 'limit' };
  var b64 = String(d.data || '').replace(/^data:image\/jpeg;base64,/, '');
  if (!b64 || b64.length > CIMG_MAX || !/^[A-Za-z0-9+\/=]+$/.test(b64)) return { ok: false, err: 'big' };
  var bytes = Utilities.base64Decode(b64);
  if (bytes.length < 200 || bytes[0] !== -1 || bytes[1] !== -40) return { ok: false, err: 'type' };    // not a JPEG
  var kind = d.k === 'b' ? 'board' : 'post';
  var f = folder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', rid_() + '.jpg'));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var id = f.getId();
  sheet_(IMGS, ICOLS).appendRow([id, now_(), u.ak, kind, String(bytes.length)]);
  return { ok: true, id: id };
}

function mineImgs_(ak) {
  var m = {}; rows_(sheet_(IMGS, ICOLS), ICOLS).forEach(function (r) { if (r[2] === ak) m[String(r[0])] = 1; });
  return m;
}

function pub_(p) {
  var o = {
    id: p.id, t: Date.parse(p.created) || 0, k: p.kind, a: p.ak, n: p.name, u: p.uni, ti: p.title, tx: p.text,
    tg: jarr_(p.tags), sw: jarr_(p.sw), im: jarr_(p.imgs), lk: parseInt(p.likes, 10) || 0
  };
  if (p.kind === 'b') {                       // the list carries only a small preview of a published board
    var b = {}; try { b = JSON.parse(p.board || '{}'); } catch (e) { b = {}; }
    var cs = Array.isArray(b.cards) ? b.cards : [];
    o.nc = cs.length;
    o.im = cs.filter(function (c) { return c && c.t === 'i' && (IDRE.test(String(c.src || '')) || EXTRE.test(String(c.src || ''))); }).slice(0, 4).map(function (c) { return c.src; });
  }
  return o;
}

function cfeed_() {
  var c = cget_('cfeed'); if (c) return c;
  var rows = rows_(sheet_(POSTS, PCOLS), PCOLS), out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < CFEED; i--) {
    var p = obj_(rows[i], PCOLS);
    if (p.status === 'live') out.push(pub_(p));
  }
  var s = JSON.stringify({ ok: true, posts: out, t: Date.now() });
  cput_('cfeed', s, 90);
  return s;
}

// one post in full (a board comes with all its cards)
function cget1_(id) {
  if (!IDRE.test(id)) return JSON.stringify({ ok: false, err: 'bad' });
  var rows = rows_(sheet_(POSTS, PCOLS), PCOLS);
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][0]) === id) {
      var p = obj_(rows[i], PCOLS);
      if (p.status !== 'live') return JSON.stringify({ ok: false, err: 'gone' });
      var o = pub_(p);
      if (p.kind === 'b') { try { o.bd = JSON.parse(p.board); } catch (e) { o.bd = { cards: [] }; } }
      return JSON.stringify({ ok: true, post: o });
    }
  }
  return JSON.stringify({ ok: false, err: 'gone' });
}

function postRow_(id) {                        // { row, p } of a post, or null
  var sh = sheet_(POSTS, PCOLS), last = sh.getLastRow();
  if (last < 2) return null;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) {
    return { sh: sh, row: i + 2, p: obj_(sh.getRange(i + 2, 1, 1, PCOLS.length).getValues()[0], PCOLS) };
  }
  return null;
}
function setCell_(pr, col, v) { pr.sh.getRange(pr.row, ci_(PCOLS, col)).setValue(v); pr.p[col] = v; }

var LINKRE = /https?:\/\/|www\./gi;

function cpost_(d) {
  var u = who_(d); if (!u) return { ok: false, err: 'auth' };
  var kind = d.k === 'b' ? 'b' : 'p', title = nof_(clean_(d.ti, 90)), text = nof_(text_(d.tx, 1500));
  if (!title) return { ok: false, err: 'title' };
  if ((text.match(LINKRE) || []).length > 3 || (title.match(LINKRE) || []).length) return { ok: false, err: 'links' };
  if (!d.ok) return { ok: false, err: 'consent' };
  var tags = (Array.isArray(d.tg) ? d.tg : []).map(function (x) { return clean_(x, 24); }).filter(Boolean).slice(0, 6);
  var sw = (Array.isArray(d.sw) ? d.sw : []).filter(function (x) { return SWL.indexOf(x) >= 0; }).slice(0, 8);
  var imgs = [], board = '';
  if (kind === 'p') {
    var mine = mineImgs_(u.ak);
    imgs = (Array.isArray(d.im) ? d.im : []).filter(function (x) { return mine[x]; }).slice(0, 6);
    if (!imgs.length) return { ok: false, err: 'noimg' };
  } else {
    var b = d.bd && typeof d.bd === 'object' ? d.bd : null;
    if (!b || !Array.isArray(b.cards) || !b.cards.length) return { ok: false, err: 'empty' };
    var cb = cleanBoard_(b);
    if (!cb.cards.length) return { ok: false, err: 'empty' };
    board = JSON.stringify({ cards: cb.cards, links: cb.links });
    if (board.length > CBOARD_MAX) return { ok: false, err: 'bigboard' };
    imgs = [];
  }
  if (!lim_('pl:' + u.ak, 1, 40)) return { ok: false, err: 'wait' };
  if (!lim_('pd:' + u.ak, 6, 86400)) return { ok: false, err: 'limit' };
  var id = rid_(), t = now_(), status = CMOD === 'pre' ? 'pending' : 'live';
  var name = nof_(clean_(d.nm, 60)) || u.name;
  sheet_(POSTS, PCOLS).appendRow([id, t, t, status, kind, u.ak, u.email, name, u.uni, title, text, JSON.stringify(tags), JSON.stringify(sw), JSON.stringify(imgs), board, '0', '0']);
  cdrop_('cfeed');
  if (status === 'pending') notify_();
  return { ok: true, id: id, status: status };
}

function notify_() {                           // at most one e-mail every 30 minutes
  try {
    if (!lim_('nt', 1, 1800)) return;
    var to = Session.getEffectiveUser().getEmail(), n = 0;
    rows_(sheet_(POSTS, PCOLS), PCOLS).forEach(function (r) { if (r[3] === 'pending') n++; });
    sendMail_(to, 'منشورات بانتظار الموافقة — X Architecture', 'عدد المنشورات التي تنتظر موافقتك: ' + n + '\nافتح admin.html ثم تبويب المجتمع.', '<p style="direction:rtl">عدد المنشورات التي تنتظر موافقتك: <b>' + n + '</b></p><p style="direction:rtl">افتح admin.html ثم تبويب المجتمع.</p>');
  } catch (e) { Logger.log('notify ' + e); }
}

function clike_(d) {
  var u = who_(d); if (!u) return { ok: false, err: 'auth' };
  var id = clean_(d.id, 30), pr = IDRE.test(id) ? postRow_(id) : null;
  if (!pr || pr.p.status !== 'live') return { ok: false, err: 'gone' };
  if (!lim_('lk:' + u.ak, 120, 3600)) return { ok: false, err: 'limit' };
  var sh = sheet_(LIKES, LCOLS), key = id + '|' + u.ak, last = sh.getLastRow(), at = 0;
  if (last > 1) {
    var ks = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ks.length; i++) if (String(ks[i][0]) === key) { at = i + 2; break; }
  }
  var n = parseInt(pr.p.likes, 10) || 0, on;
  if (at) { sh.deleteRow(at); n = Math.max(0, n - 1); on = false; }
  else { sh.appendRow([key, id, u.ak, now_()]); n++; on = true; }
  setCell_(pr, 'likes', String(n));
  return { ok: true, on: on, n: n };
}

function cdel_(d) {
  var u = who_(d); if (!u) return { ok: false, err: 'auth' };
  var pr = postRow_(clean_(d.id, 30));
  if (!pr || pr.p.ak !== u.ak) return { ok: false, err: 'gone' };
  setCell_(pr, 'status', 'deleted'); setCell_(pr, 'updated', now_());
  cdrop_('cfeed');
  return { ok: true };
}

function crep_(d) {
  var u = who_(d); if (!u) return { ok: false, err: 'auth' };
  var pr = postRow_(clean_(d.id, 30));
  if (!pr || pr.p.status === 'deleted') return { ok: false, err: 'gone' };
  if (!lim_('rp:' + u.ak, 10, 86400)) return { ok: false, err: 'limit' };
  var sh = sheet_(REPORTS, RCOLS);
  var dup = rows_(sh, RCOLS).some(function (r) { return r[1] === pr.p.id && r[2] === u.ak; });
  if (!dup) {
    sh.appendRow([now_(), pr.p.id, u.ak, clean_(d.why, 120)]);
    var n = (parseInt(pr.p.reports, 10) || 0) + 1;
    setCell_(pr, 'reports', String(n));
    if (n >= 3 && pr.p.status === 'live') { setCell_(pr, 'status', 'hidden'); cdrop_('cfeed'); }
  }
  return { ok: true };
}

// my posts (every state), the posts I hearted, my board
function cmine_(d) {
  var u = who_(d); if (!u) return { ok: false, err: 'auth' };
  var posts = [];
  rows_(sheet_(POSTS, PCOLS), PCOLS).forEach(function (r) {
    var p = obj_(r, PCOLS);
    if (p.ak === u.ak && p.status !== 'deleted') { var o = pub_(p); o.s = p.status; posts.push(o); }
  });
  posts.reverse();
  var liked = [];
  rows_(sheet_(LIKES, LCOLS), LCOLS).forEach(function (r) { if (r[2] === u.ak) liked.push(String(r[1])); });
  var board = null;
  rows_(sheet_(BOARDS, BCOLS), BCOLS).forEach(function (r) {
    if (r[0] === u.ak) { try { board = { u: parseInt(r[2], 10) || 0, b: JSON.parse(r[3]) }; } catch (e) { board = null; } }
  });
  return { ok: true, ak: u.ak, name: u.name, posts: posts, liked: liked, board: board };
}

function cbsave_(d) {
  var u = who_(d); if (!u) return { ok: false, err: 'auth' };
  var b = d.b;
  if (!b || typeof b !== 'object' || !Array.isArray(b.cards)) return { ok: false, err: 'bad' };
  if (!lim_('bs:' + u.ak, 240, 3600)) return { ok: false, err: 'limit' };
  var cb = cleanBoard_(b), json = JSON.stringify({ v: 1, cards: cb.cards, links: cb.links });
  if (json.length > CBOARD_MAX) return { ok: false, err: 'bigboard' };
  var sh = sheet_(BOARDS, BCOLS), rows = rows_(sh, BCOLS), at = 0, ts = String(Date.now());
  for (var i = 0; i < rows.length; i++) if (rows[i][0] === u.ak) { at = i + 2; break; }
  if (at) { sh.getRange(at, 3, 1, 2).setValues([[ts, json]]); }
  else sh.appendRow([u.ak, u.email, ts, json]);
  return { ok: true, u: +ts };
}

/* ---------- moderation (admin key required) ---------- */
function admOk_(d) {
  var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key) return { ok: false, err: 'ADMIN_KEY is not set in Script properties' };
  if (String(d.key || '') !== key) { Utilities.sleep(800); return { ok: false, err: 'wrong key' }; }
  return null;
}
function cadm_(d) {
  var bad = admOk_(d); if (bad) return bad;
  var out = [], counts = { pending: 0, live: 0, hidden: 0, deleted: 0 };
  var rows = rows_(sheet_(POSTS, PCOLS), PCOLS);
  rows.forEach(function (r) { var p = obj_(r, PCOLS); if (counts[p.status] != null) counts[p.status]++; });
  for (var i = rows.length - 1; i >= 0 && out.length < 200; i--) {
    var p = obj_(rows[i], PCOLS);
    if (p.status === 'pending' || p.status === 'hidden' || (p.status === 'live' && (parseInt(p.reports, 10) || 0) > 0)) {
      var o = pub_(p); o.s = p.status; o.em = p.email; o.rp = parseInt(p.reports, 10) || 0; o.cr = p.created;
      if (p.kind === 'b') { try { o.bd = JSON.parse(p.board); } catch (e) { o.bd = { cards: [] }; } }
      out.push(o);
    }
  }
  return { ok: true, counts: counts, posts: out };
}
function cmod_(d) {
  var bad = admOk_(d); if (bad) return bad;
  var st = ['live', 'hidden', 'deleted'].indexOf(d.s) >= 0 ? d.s : '', pr = IDRE.test(String(d.id)) ? postRow_(String(d.id)) : null;
  if (!st || !pr) return { ok: false, err: 'bad' };
  setCell_(pr, 'status', st); setCell_(pr, 'updated', now_());
  if (st === 'live') setCell_(pr, 'reports', '0');
  cdrop_('cfeed');
  return { ok: true };
}
