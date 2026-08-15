import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  withCredentials: true,
});

export function fmtErr(e) {
  const d = e?.response?.data?.detail;
  if (!d) return e?.message || "Erreur réseau";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => (x && x.msg) || JSON.stringify(x)).join(" ");
  if (d && typeof d.message === "string") return d.message;
  return String(d);
}
