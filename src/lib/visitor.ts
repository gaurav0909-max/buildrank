const COOKIE_NAME = "rb_vid";
const MAX_AGE_SECONDS = 400 * 24 * 60 * 60; // 400 days — the browser-enforced cap

export function getOrCreateVisitorId(): string {
  const existing = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];

  if (existing) return existing;

  const id = crypto.randomUUID();
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
  return id;
}
