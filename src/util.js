import * as config from "./config";

export function sortBy(key) {
  return (a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0);
}

export function isAdmin(auth) {
  return config.admins.includes(auth.email);
}
