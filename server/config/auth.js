function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || ['fallback_secret_key', 'super_secret_jwt_key_weekly_report_generator_2026', 'replace-with-a-random-secret-at-least-32-characters'].includes(secret)) {
    throw new Error('Set JWT_SECRET to a unique random secret of at least 32 characters');
  }
  return secret;
}
module.exports = { getJwtSecret };
