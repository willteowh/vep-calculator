import { link } from "fs";

export const themeColor = "#606fbb";
export const resultColor = "rgb(185, 185, 203)";

export const baseStyles = {
  wrap: {
    fontFamily: "Lato, sans-serif",
    fontSize: 16,
    color: "#222",
    maxWidth: 840,
    margin: "0 auto",
    padding: 16,
  } as const,
  tabs: {
    display: "flex" as const,
    borderBottom: `2px solid ${themeColor}`,
    marginBottom: 24,
  } as const,
  tab: (active: boolean) => ({
    padding: "9px 22px",
    cursor: "pointer" as const,
    fontWeight: 700,
    background: active ? themeColor : "#f0f0f0",
    color: active ? "#fff" : "#555",
    borderTop: `1px solid ${active ? themeColor : "#ddd"}`,
    borderLeft: `1px solid ${active ? themeColor : "#ddd"}`,
    borderRight: `1px solid ${active ? themeColor : "#ddd"}`,
    borderBottom: "none",
    borderRadius: "4px 4px 0 0",
    marginRight: 4,
  }),
  card: {
    border: "1px solid #ddd",
    borderRadius: 4,
    padding: "24px 28px",
    background: "#fafafa",
  } as const,
  link: {
    color: "#5c6bb3",
    textDecoration: "underline",
  } as const,
};

export const formStyles = {
  formGrid: {
    display: "grid" as const,
    gridTemplateColumns: "1fr",
    gap: "16px",
    marginBottom: "20px",
  } as const,
  row: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "6px",
  } as const,
  lbl: {
    width: "100%",
    fontSize: 16,
    fontWeight: 700,
    color: "#666666",
    lineHeight: 1.4,
  } as const,
  ctrl: {
    width: "100%",
  } as const,
  sel: (hasError: boolean) => ({
    width: "100%",
    padding: "10px 35px 10px 12px",
    border: `1px solid ${hasError ? themeColor : "rgb(221, 221, 221)"}`,
    borderRadius: 4,
    fontSize: 16,
    fontStyle: "italic" as const,
    color: "rgb(102, 102, 102)",
    backgroundColor: "rgb(233, 237, 245)",
    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(102, 102, 102)" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
    backgroundPosition: "right 10px center",
    backgroundSize: "20px",
    backgroundRepeat: "no-repeat" as const,
    outline: "none" as const,
    cursor: "pointer" as const,
    appearance: "none" as const,
  }),
  inp: (hasError: boolean) => ({
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${hasError ? themeColor : "rgb(221, 221, 221)"}`,
    borderRadius: 4,
    fontSize: 16,
    color: "rgb(102, 102, 102)",
    background: "rgb(233, 237, 245)",
    outline: "none" as const,
    boxSizing: "border-box" as const,
  }),
  err: {
    color: themeColor,
    marginTop: 3,
  } as const,
};

export const infoStyles = {
  info: {
    background: "#fff8e1",
    border: "1px solid #ffe082",
    borderLeft: `4px solid #f9a825`,
    padding: "11px 14px",
    borderRadius: 2,
    marginBottom: 16,
    lineHeight: 1.7,
  } as const,
  warn2027: {
    background: "#e8f4fd",
    border: "1px solid #90caf9",
    borderLeft: "4px solid #1976d2",
    padding: "11px 14px",
    borderRadius: 2,
    marginBottom: 16,
    lineHeight: 1.7,
  } as const,
  errBanner: {
    background: "#ffeaea",
    border: "1px solid #f5c6c6",
    borderLeft: `4px solid ${themeColor}`,
    padding: "10px 14px",
    borderRadius: 2,
    marginBottom: 16,
    color: themeColor,
  } as const,
  pageHeader: {
    fontSize: 30,
    fontFamily: "Francois One, sans-serif",
    fontWeight: 400,
    lineHeight: 1.2,
  },
  infoBox: {} as const,
};

export const buttonStyles = {
  btnGroup: {
    display: "flex" as const,
    flexWrap: "wrap" as const,
    gap: "12px",
    marginTop: "20px",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  } as const,
  btn: {
    background: "#606fbb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 48px",
    fontWeight: 700,
    cursor: "pointer" as const,
    marginRight: 10,
  } as const,
};

export const resultStyles = {
  rWrap: {
    marginTop: 28,
    fontFamily: "Lato, sans-serif",
    lineHeight: "24px",
  } as const,
  rTitle: {
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 12,
    borderBottom: `2px solid ${themeColor}`,
    paddingBottom: 6,
  } as const,
  tbl: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 16,
  } as const,
  th: {
    background: resultColor,
    padding: "15px 10px",
    textAlign: "left" as const,
    fontWeight: 700,
    borderBottom: "1px solid #eee",
  } as const,
  tdL: {
    background: resultColor,
    padding: "15px 10px",
    borderBottom: "1px solid #eee",
    fontWeight: 600,
    color: "#333",
    verticalAlign: "middle" as const,
  } as const,
  tdV: {
    padding: "15px 10px",
    borderBottom: "1px solid #eee",
    borderRight: "1px solid rgb(221, 221, 221)",
    verticalAlign: "top" as const,
  } as const,
  footNote: {
    fontSize: 13,
    color: "#555",
    fontWeight: 700,
  },
  gTr: {} as const,
  gTd: {
    background: resultColor,
    padding: "10px 12px",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
  } as const,
  infoTr: {
    border: "1px solid rgb(221, 221, 221)",
  },
  pill: (variant: "pre" | "post" | "default") => ({
    display: "inline-block" as const,
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    background:
      variant === "pre" ? "#e8f5e9" : variant === "post" ? "#e3f2fd" : "#eee",
    color:
      variant === "pre" ? "#2e7d32" : variant === "post" ? "#1565c0" : "#555",
    marginLeft: 6,
  }),
  infoFooter: {
    marginTop: 10,
    padding: "10px 14px",
  },
};

export const testCaseStyles = {
  tcCard: {
    border: "1px solid #ddd",
    borderRadius: 4,
    padding: "16px 20px",
    marginBottom: 12,
    background: "#fafafa",
  } as const,
  tcT: { fontWeight: 700, fontSize: 13, marginBottom: 4 } as const,
  tcD: { fontSize: 12, color: "#555", marginBottom: 8 } as const,
  tcN: {
    fontSize: 12,
    color: "#336",
    background: "#eef2ff",
    padding: "6px 10px",
    borderRadius: 3,
    marginBottom: 8,
  } as const,
  tcB: {
    background: "#0056a6",
    color: "#fff",
    border: "none",
    borderRadius: 3,
    padding: "6px 16px",
    fontSize: 12,
    cursor: "pointer" as const,
  } as const,
  tcR: (ok: boolean) => ({
    marginTop: 10,
    fontSize: 12,
    padding: "10px 12px",
    borderRadius: 3,
    background: ok ? "#f0faf0" : "#fff3f3",
    border: `1px solid ${ok ? "#b2dfb2" : "#f5c6c6"}`,
  }),
};

export const utilityStyles = {
  emptyFlex: {
    flexBasis: "100%",
  } as const,
};
