const dns = require('dns');
const { promisify } = require('util');

const resolveMx = promisify(dns.resolveMx);

// Common disposable email domains (curated list of well-known temporary email providers)
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'tempmail.net',
  'throwaway.email',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'sharklasers.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'spamgourmet.com',
  'spamfree24.org',
  'mailcatch.com',
  'maildrop.cc',
  'getairmail.com',
  'getnada.com',
  'temp-mail.org',
  'temp-mail.ru',
  'tempemail.co',
  'tempr.email',
  'emailfake.com',
  'emailnator.com',
  'mailexpire.com',
  'mailforspam.com',
  'mailmetrash.com',
  'mytemp.email',
  'sogetthis.com',
  'thankyou2010.com',
  'zippymail.info',
  'mailmoat.com',
  'spamdecoy.net',
  'deadaddress.com',
  'discard.email',
  'dispostable.com',
  'fakeinbox.com',
  'filzmail.com',
  'mail-temp.com',
  'mailline.net',
  'mailnesia.com',
  'mailsac.com',
  'mailtemp.net',
  'mintemail.com',
  'mytrashmail.com',
  'nowmymail.com',
  'oneoffemail.com',
  'pookmail.com',
  'proxymail.eu',
  'rcpt.at',
  'sneakemail.com',
  'sofort-mail.de',
  'spambob.com',
  'spambog.com',
  'spambox.us',
  'spamday.com',
  'spamex.com',
  'spamfree24.com',
  'spamgourmet.org',
  'spamhole.com',
  'spamify.com',
  'spaminator.de',
  'spamkill.info',
  'spamlot.net',
  'spamoff.xyz',
  'spamslicer.com',
  'spamstack.net',
  'spamthis.co.uk',
  'spamtrail.com',
  'spamwc.de',
  'tagyourself.com',
  'tempalias.com',
  'tempinbox.com',
  'thisisnotmyrealemail.com',
  'trash2009.com',
  'trashdevil.com',
  'trashymail.com',
  'tyldd.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'wh4f.org',
  'whyspam.me',
  'willselfdestruct.com',
  'winemaven.info',
  'wronghead.com',
  'wuzup.net',
  'xagloo.com',
  'xemaps.com',
  'xents.com',
  'xmaily.com',
  'xoxy.net',
  'yep.it',
  'yogamaven.com',
  'yuurok.com',
  'zehnminutenmail.de',
  'zippymail.org',
  'zoaxe.com',
  'zoemail.org',
]);

// Common email domains for typo detection
const COMMON_DOMAINS = {
  'gmail.com': 'gmail.com',
  'googlemail.com': 'gmail.com',
  'yahoo.com': 'yahoo.com',
  'yahoo.co.uk': 'yahoo.co.uk',
  'outlook.com': 'outlook.com',
  'hotmail.com': 'outlook.com',
  'live.com': 'outlook.com',
  'icloud.com': 'icloud.com',
  'me.com': 'icloud.com',
  'protonmail.com': 'protonmail.com',
  'proton.me': 'protonmail.com',
  'zoho.com': 'zoho.com',
  'yandex.com': 'yandex.com',
  'mail.com': 'mail.com',
  'aol.com': 'aol.com',
  'gmx.com': 'gmx.com',
  'fastmail.com': 'fastmail.com',
  'tutanota.com': 'tutanota.com',
  'rediffmail.com': 'rediffmail.com',
};

// Common typos for popular domains
const TYPOS = {
  'gmial.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.coom': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'ghmail.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gmauil.com': 'gmail.com',
  'gmaily.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmmail.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'ymail.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'yahpo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmsil.com': 'hotmail.com',
  'outloo.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'utlook.com': 'outlook.com',
  'icoud.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'iclud.com': 'icloud.com',
  'protonmial.com': 'protonmail.com',
  'protonmal.com': 'protonmail.com',
  'protonail.com': 'protonmail.com',
};

/**
 * Check if an email domain is a disposable/temporary email provider.
 */
function isDisposableEmail(domain) {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

/**
 * Check for common domain typos and suggest the correct one.
 * Returns the suggested email if a typo is detected, null otherwise.
 */
function suggestEmailCorrection(email) {
  const parts = email.split('@');
  if (parts.length !== 2) return null;
  const [, domain] = parts;
  const lowerDomain = domain.toLowerCase();

  // Check exact typo match
  if (TYPOS[lowerDomain]) {
    return email.replace(domain, TYPOS[lowerDomain]);
  }

  // Check if domain is close to a common domain (Levenshtein-like check)
  for (const [typo, correct] of Object.entries(TYPOS)) {
    if (typo.length === lowerDomain.length) {
      let diffCount = 0;
      for (let i = 0; i < typo.length; i++) {
        if (typo[i] !== lowerDomain[i]) diffCount++;
      }
      if (diffCount === 1) {
        return email.replace(domain, correct);
      }
    }
  }

  return null;
}

/**
 * Validate email format more strictly than express-validator's isEmail.
 */
function validateEmailFormat(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { valid: false, reason: 'Email is too long' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Email must contain exactly one @ symbol' };
  }

  const [localPart, domain] = parts;

  if (!localPart || localPart.length > 64) {
    return { valid: false, reason: 'Email username part is invalid or too long' };
  }

  if (!domain || domain.length < 4 || !domain.includes('.')) {
    return { valid: false, reason: 'Email domain appears to be invalid' };
  }

  // Check for consecutive dots
  if (localPart.includes('..') || domain.includes('..')) {
    return { valid: false, reason: 'Email contains consecutive dots' };
  }

  // Check for invalid characters in local part
  if (!/^[a-z0-9._%+\-']+$/i.test(localPart)) {
    return { valid: false, reason: 'Email contains invalid characters' };
  }

  // Check domain parts
  const domainParts = domain.split('.');
  if (domainParts.some((part) => part.length < 1 || part.length > 63)) {
    return { valid: false, reason: 'Email domain part has invalid length' };
  }

  // Check TLD is at least 2 characters
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { valid: false, reason: 'Email top-level domain is too short' };
  }

  // Check for numeric-only TLD (usually invalid)
  if (/^\d+$/.test(tld)) {
    return { valid: false, reason: 'Email top-level domain cannot be numeric only' };
  }

  return { valid: true, domain };
}

/**
 * Check if the email domain has MX records (can receive email).
 * Timeout after 5 seconds to avoid hanging.
 */
async function checkMxRecords(domain) {
  // Timeout after 5 seconds to avoid hanging requests
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('DNS_TIMEOUT')), 5000)
  );

  try {
    const mxRecords = await Promise.race([resolveMx(domain), timeoutPromise]);
    return {
      hasMx: mxRecords && mxRecords.length > 0,
      mxCount: mxRecords ? mxRecords.length : 0,
      error: null,
    };
  } catch (error) {
    if (error.message === 'DNS_TIMEOUT') {
      return {
        hasMx: true, // Assume valid on timeout (network issue)
        mxCount: 0,
        error: null,
        warning: 'Could not verify email domain (DNS check timed out). Email will be verified via the link click.',
      };
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || error.code === 'ESERVFAIL' || error.code === 'EREFUSED') {
      return {
        hasMx: false,
        mxCount: 0,
        error: `Domain ${domain} does not appear to have email servers configured`,
      };
    }
    // Other DNS errors - don't block, just warn
    return {
      hasMx: true, // Assume valid if we can't check (network issue)
      mxCount: 0,
      error: null,
      warning: 'Could not verify email domain (DNS check failed). Email will be verified via the link click.',
    };
  }
}

/**
 * Full email validation pipeline.
 * Returns validation result with all checks.
 */
async function validateEmail(email) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    suggestion: null,
  };

  // Step 1: Format validation
  const formatResult = validateEmailFormat(email);
  if (!formatResult.valid) {
    result.valid = false;
    result.errors.push(formatResult.reason);
    return result;
  }

  const domain = formatResult.domain;

  // Step 2: Typo detection
  const suggestion = suggestEmailCorrection(email);
  if (suggestion) {
    result.warnings.push(`Did you mean ${suggestion}?`);
    result.suggestion = suggestion;
  }

  // Step 3: Disposable email check
  if (isDisposableEmail(domain)) {
    result.valid = false;
    result.errors.push('Temporary or disposable email addresses are not allowed. Please use a permanent email address.');
    return result;
  }

  // Step 4: MX record check
  try {
    const mxResult = await checkMxRecords(domain);
    if (!mxResult.hasMx) {
      result.valid = false;
      result.errors.push(mxResult.error || `Email domain ${domain} cannot receive emails`);
      return result;
    }
    if (mxResult.warning) {
      result.warnings.push(mxResult.warning);
    }
  } catch (err) {
    // DNS check failed due to network - allow through with warning
    result.warnings.push('Could not fully verify email (network issue). Verification link will be sent.');
  }

  return result;
}

module.exports = {
  validateEmail,
  validateEmailFormat,
  isDisposableEmail,
  suggestEmailCorrection,
  checkMxRecords,
};
