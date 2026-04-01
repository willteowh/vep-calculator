export const RED = "#c8202e";

export const baseStyles = {
  wrap: {
    fontFamily: "'Segoe UI','Noto Sans',Arial,sans-serif",
    fontSize: 14,
    color: "#222",
    maxWidth: 840,
    margin: "0 auto",
    padding: 16,
  } as const,
  tabs: {
    display: "flex" as const,
    borderBottom: `2px solid ${RED}`,
    marginBottom: 24,
  } as const,
  tab: (active: boolean) => ({
    padding: "9px 22px",
    cursor: "pointer" as const,
    fontWeight: 700,
    fontSize: 13,
    background: active ? RED : "#f0f0f0",
    color: active ? "#fff" : "#555",
    borderTop: `1px solid ${active ? RED : "#ddd"}`,
    borderLeft: `1px solid ${active ? RED : "#ddd"}`,
    borderRight: `1px solid ${active ? RED : "#ddd"}`,
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
    fontSize: 13,
    fontWeight: 700,
    color: "#333",
    lineHeight: 1.4,
  } as const,
  ctrl: {
    width: "100%",
  } as const,
  sel: (hasError: boolean) => ({
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${hasError ? RED : "#bbb"}`,
    borderRadius: 4,
    fontSize: 14,
    background: "#fff",
    outline: "none" as const,
    cursor: "pointer" as const,
    appearance: "none" as const,
  }),
  inp: (hasError: boolean) => ({
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${hasError ? RED : "#bbb"}`,
    borderRadius: 4,
    fontSize: 14,
    background: "#fff",
    outline: "none" as const,
    boxSizing: "border-box" as const,
  }),
  err: {
    color: RED,
    fontSize: 11,
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
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 1.7,
  } as const,
  warn2027: {
    background: "#e8f4fd",
    border: "1px solid #90caf9",
    borderLeft: "4px solid #1976d2",
    padding: "11px 14px",
    borderRadius: 2,
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 1.7,
  } as const,
  errBanner: {
    background: "#ffeaea",
    border: "1px solid #f5c6c6",
    borderLeft: `4px solid ${RED}`,
    padding: "10px 14px",
    borderRadius: 2,
    fontSize: 13,
    marginBottom: 16,
    color: RED,
  } as const,
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
  btnP: {
    background: RED,
    color: "#fff",
    border: "none",
    borderRadius: 3,
    padding: "10px 28px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer" as const,
    marginRight: 10,
  } as const,
  btnS: {
    background: "#fff",
    color: "#555",
    border: "1px solid #bbb",
    borderRadius: 3,
    padding: "10px 20px",
    fontSize: 14,
    cursor: "pointer" as const,
    marginRight: 10,
  } as const,
};

export const resultStyles = {
  rWrap: { marginTop: 28 } as const,
  rTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 12,
    borderBottom: `2px solid ${RED}`,
    paddingBottom: 6,
  } as const,
  tbl: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  } as const,
  th: {
    background: RED,
    color: "#fff",
    padding: "9px 12px",
    textAlign: "left" as const,
    fontWeight: 600,
  } as const,
  tdL: {
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
    fontWeight: 600,
    color: "#333",
    width: "52%",
    background: "#fafafa",
    verticalAlign: "top" as const,
  } as const,
  tdV: {
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top" as const,
  } as const,
  subTr: { background: "#fff3cd" } as const,
  gTr: { background: RED } as const,
  gTd: {
    padding: "10px 12px",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
  } as const,
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
