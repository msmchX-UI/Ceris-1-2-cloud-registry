/* ─────────────────────────────────────────────────────────────────
   Ceris-1-2 Cloud Registry – Apps Script Backend
   Actions: ping, login, whoami, listUsers, upsertUser, removeUser

   Setup (Script Properties required):
     PASSWORD_SALT  – a random secret string used when hashing passwords.
                      Generate once and never change (or all passwords must be reset).

   Google Sheet tabs required:
     admins  – columns: username, password_hash, role
     users   – columns: email, role
   ──────────────────────────────────────────────────────────────── */

var SESSION_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

/* ── HTTP entry points ─────────────────────────────────────────── */

function doPost(e) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  try {
    var body = JSON.parse(e.postData.contents);
    out.setContent(JSON.stringify(dispatch(body)));
  } catch (err) {
    out.setContent(JSON.stringify({ ok: false, error: err.message }));
  }
  return out;
}

function doGet(e) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  out.setContent(JSON.stringify({ ok: true, service: 'Ceris-1-2 Registry API' }));
  return out;
}

/* ── Dispatcher ────────────────────────────────────────────────── */

function dispatch(body) {
  var action = String(body.action || '').trim();

  if (action === 'ping')  return { ok: true, pong: true };
  if (action === 'login') return handleLogin(body);

  // All other actions require a valid session token
  var session = requireSession(body.token);

  if (action === 'whoami') {
    return { ok: true, username: session.username, isAdmin: session.role === 'admin' };
  }

  // Admin-only actions
  if (session.role !== 'admin') throw new Error('Forbidden: admin access required.');

  if (action === 'listUsers')  return handleListUsers();
  if (action === 'upsertUser') return handleUpsertUser(body);
  if (action === 'removeUser') return handleRemoveUser(body);

  throw new Error('Unknown action: ' + action);
}

/* ── Session management ────────────────────────────────────────── */

function requireSession(token) {
  if (!token) throw new Error('Authentication required: no token provided.');
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty('SESSION_' + token);
  if (!raw) throw new Error('Invalid or expired session. Please log in again.');
  var session;
  try { session = JSON.parse(raw); } catch (e) {
    props.deleteProperty('SESSION_' + token);
    throw new Error('Corrupted session. Please log in again.');
  }
  if (Date.now() > session.expiry) {
    props.deleteProperty('SESSION_' + token);
    throw new Error('Session expired. Please log in again.');
  }
  return session;
}

function createSession(username, role) {
  var token = Utilities.getUuid() + '-' + Utilities.getUuid();
  var session = {
    username: username,
    role: role,
    expiry: Date.now() + SESSION_EXPIRY_MS
  };
  PropertiesService.getScriptProperties()
    .setProperty('SESSION_' + token, JSON.stringify(session));
  return token;
}

/* ── Login ─────────────────────────────────────────────────────── */

function handleLogin(body) {
  var username = String(body.username || '').trim();
  var password = String(body.password || '');
  if (!username || !password) throw new Error('Username and password are required.');

  var salt = PropertiesService.getScriptProperties().getProperty('PASSWORD_SALT');
  if (!salt) throw new Error(
    'Server misconfiguration: PASSWORD_SALT is not set in Script Properties. ' +
    'Please add it under Project Settings → Script Properties.'
  );

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('admins');
  if (!sheet) throw new Error('Server misconfiguration: "admins" sheet not found.');

  var data    = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var colUser = headers.indexOf('username');
  var colHash = headers.indexOf('password_hash');
  var colRole = headers.indexOf('role');

  if (colUser < 0 || colHash < 0 || colRole < 0) throw new Error(
    'Server misconfiguration: "admins" sheet must have columns: username, password_hash, role.'
  );

  for (var i = 1; i < data.length; i++) {
    var rowUser = String(data[i][colUser] || '').trim();
    if (rowUser.toLowerCase() !== username.toLowerCase()) continue;

    var stored = String(data[i][colHash] || '').trim();
    var role   = String(data[i][colRole]  || '').trim();

    // A sha256 hex digest is exactly 64 lowercase hex characters.
    // If stored value matches that pattern it is already hashed;
    // otherwise treat it as plaintext and migrate on successful login.
    var isHashed  = /^[0-9a-f]{64}$/.test(stored.toLowerCase());
    var inputHash = sha256Hex(password + salt);
    var valid     = false;

    if (isHashed) {
      valid = (inputHash === stored.toLowerCase());
    } else {
      // Plaintext stored — compare sha256(password+salt) against sha256(storedPlaintext+salt).
      // The two hashes match iff password === storedPlaintext, avoiding a direct string compare
      // and mitigating basic timing attacks.  On success, replace the plaintext with the hash.
      valid = (inputHash === sha256Hex(stored + salt));
      if (valid) {
        try {
          sheet.getRange(i + 1, colHash + 1).setValue(inputHash);
          SpreadsheetApp.flush();
        } catch (migrateErr) {
          // Migration failed — login still succeeds; hash upgrade will be retried next login.
          Logger.log('Password hash migration failed for user "' + username + '": ' + migrateErr.message);
        }
      }
    }

    if (!valid) throw new Error('Invalid username or password.');

    var token = createSession(username, role);
    return { ok: true, token: token, username: username, role: role };
  }

  // User not found – return same error to avoid username enumeration
  throw new Error('Invalid username or password.');
}

/* ── SHA-256 helper ────────────────────────────────────────────── */

function sha256Hex(input) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    input,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/* ── listUsers ─────────────────────────────────────────────────── */

function handleListUsers() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('users');
  if (!sheet) return { ok: true, users: [] };

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return { ok: true, users: [] };

  var headers  = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var colEmail = headers.indexOf('email');
  var colRole  = headers.indexOf('role');
  if (colEmail < 0 || colRole < 0) return { ok: true, users: [] };

  var users = [];
  for (var i = 1; i < data.length; i++) {
    var email = String(data[i][colEmail] || '').trim();
    var role  = String(data[i][colRole]  || '').trim();
    if (email) users.push({ email: email, role: role });
  }
  return { ok: true, users: users };
}

/* ── upsertUser ────────────────────────────────────────────────── */

function handleUpsertUser(body) {
  var email = String(body.email || '').trim().toLowerCase();
  var role  = String(body.role  || 'user').trim().toLowerCase();
  if (!email) throw new Error('email is required.');
  if (role !== 'user' && role !== 'admin') throw new Error('role must be "user" or "admin".');

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('users');
  if (!sheet) {
    sheet = ss.insertSheet('users');
    sheet.appendRow(['email', 'role']);
  }

  var data     = sheet.getDataRange().getValues();
  var headers  = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var colEmail = headers.indexOf('email');
  var colRole  = headers.indexOf('role');
  if (colEmail < 0) { colEmail = 0; sheet.getRange(1, 1).setValue('email'); }
  if (colRole  < 0) { colRole  = 1; sheet.getRange(1, 2).setValue('role');  }

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colEmail] || '').trim().toLowerCase() === email) {
      sheet.getRange(i + 1, colRole + 1).setValue(role);
      SpreadsheetApp.flush();
      return { ok: true };
    }
  }

  // Append new user — use a properly ordered array, filling gaps with ''
  var newRow = new Array(Math.max(colEmail, colRole) + 1).fill('');
  newRow[colEmail] = email;
  newRow[colRole]  = role;
  sheet.appendRow(newRow);
  SpreadsheetApp.flush();
  return { ok: true };
}

/* ── removeUser ────────────────────────────────────────────────── */

function handleRemoveUser(body) {
  var email = String(body.email || '').trim().toLowerCase();
  if (!email) throw new Error('email is required.');

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('users');
  if (!sheet) return { ok: true };

  var data     = sheet.getDataRange().getValues();
  var headers  = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var colEmail = headers.indexOf('email');
  if (colEmail < 0) return { ok: true };

  // Iterate in reverse to safely delete rows
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][colEmail] || '').trim().toLowerCase() === email) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { ok: true };
    }
  }
  return { ok: true };
}
