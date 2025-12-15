const TOKEN_KEYS = ["auth_token", "authToken", "ownerToken", "token", "salonToken"];

const normalizeToken = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return null;
  return str;
};

export const getOwnerAuthToken = () => {
  for (const key of TOKEN_KEYS) {
    const token = normalizeToken(localStorage.getItem(key));
    if (token) return token;
  }
  return null;
};

export const clearOwnerAuthTokens = () => {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
};
