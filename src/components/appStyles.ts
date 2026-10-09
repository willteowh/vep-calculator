import type { CSSProperties } from "react";

export const THEME_COLOR = "#606fbb";

export const wrapStyle: CSSProperties = {
  fontSize: 16,
  color: "#222",
  maxWidth: 960,
  margin: "0 auto",
  padding: 16,
};

export const tabsStyle: CSSProperties = {
  display: "flex",
  borderBottom: `2px solid ${THEME_COLOR}`,
  marginBottom: 24,
};

export const tabStyle = (active: boolean): CSSProperties => ({
  padding: "9px 22px",
  cursor: "pointer",
  fontWeight: 700,
  background: active ? THEME_COLOR : "#f0f0f0",
  color: active ? "#fff" : "#555",
  borderTop: `1px solid ${active ? THEME_COLOR : "#ddd"}`,
  borderLeft: `1px solid ${active ? THEME_COLOR : "#ddd"}`,
  borderRight: `1px solid ${active ? THEME_COLOR : "#ddd"}`,
  borderBottom: "none",
  borderRadius: "4px 4px 0 0",
  marginRight: 4,
});

export const infoBannerStyle: CSSProperties = {
  background: "#fff8e1",
  border: "1px solid #ffe082",
  borderLeft: "4px solid #f9a825",
  padding: "11px 14px",
  borderRadius: 2,
  marginBottom: 16,
  lineHeight: 1.7,
};

export const errorBannerStyle: CSSProperties = {
  background: "#ffeaea",
  border: "1px solid #f5c6c6",
  borderLeft: `4px solid ${THEME_COLOR}`,
  padding: "10px 14px",
  borderRadius: 2,
  marginBottom: 16,
  color: THEME_COLOR,
};

export const buttonStyle: CSSProperties = {
  background: THEME_COLOR,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 48px",
  fontWeight: 700,
  cursor: "pointer",
  marginRight: 10,
};
