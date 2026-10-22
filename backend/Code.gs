/**
 * X Architecture — registration + statistics backend (Google Apps Script).
 *
 * Bound to a Google Sheet. Creates two tabs automatically:
 *   Users   one row per registered person (upserted by email)
 *   Events  activity of registered users (program views, Telegram / Instagram / contact clicks)
 *
 * Public endpoint (web app, "Anyone"): receives registrations and events.
 * Statistics and the user list are returned ONLY when the request carries the
 * secret ADMIN_KEY stored in Project Settings > Script properties.
 *
 * See backend/SETUP.md for the 5-minute setup.
 */

var USERS = 'Users', EVENTS = 'Events', TZ = 'Asia/Baghdad';
var UCOLS = ['uid', 'created', 'updated', 'name', 'email', 'country', 'countryName', 'kind', 'stage',
             'spec', 'gradYear', 'uni', 'contact', 'interests', 'lang', 'visits', 'last_seen'];
var ECOLS = ['time', 'uid', 'type', 'detail'];
var KINDS = ['student', 'grad', 'other'];
var STAGES = ['1', '2', '3', '4', '5', 'pg', 'pre'];
var INTERESTS = ['courses', 'design', 'viz', 'critique', 'super'];
var ETYPES = ['visit', 'prog', 'tg', 'ig', 'contact'];

function sheet_(name, cols) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(name);
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

function doGet() { return out_({ ok: true, service: 'xarch' }); }

function doPost(e) {
  var res;
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var lock = LockService.getScriptLock();
    lock.waitLock(25000);
    try {
      if (d.a === 'reg') res = reg_(d);
      else if (d.a === 'ev') res = ev_(d);
      else if (d.a === 'stats') res = stats_(d);
      else res = { ok: false, err: 'bad request' };
    } finally { lock.releaseLock(); }
  } catch (err) { res = { ok: false, err: String(err) }; }
  return out_(res);
}

/* ---------- registration (upsert by email) ---------- */
function reg_(d) {
  if (d.hp) return { ok: true };                         // honeypot: bots fill hidden fields
  var email = clean_(d.email, 120).toLowerCase();
  var name = clean_(d.name, 80);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, err: 'invalid' };
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
