export const wrapSx = {
  fontSize: 16,
  color: "text.primary",
  maxWidth: 960,
  margin: "0 auto",
  padding: 2,
};

export const tabsSx = {
  display: "flex",
  borderBottom: "2px solid",
  borderColor: "secondary.main",
  marginBottom: 2,
};

export const tabSx = (active: boolean) => ({
  padding: "9px 22px",
  cursor: "pointer",
  fontWeight: 700,
  backgroundColor: active ? "secondary.main" : "action.hover",
  color: active ? "secondary.contrastText" : "text.secondary",
  borderTop: "1px solid",
  borderLeft: "1px solid",
  borderRight: "1px solid",
  borderColor: active ? "secondary.main" : "divider",
  borderBottom: "none",
  borderRadius: "4px 4px 0 0",
  marginRight: "4px",
});

export const infoBannerSx = {
  backgroundColor: "warning.light",
  border: "1px solid",
  borderColor: "warning.light",
  borderLeft: "4px solid",
  borderLeftColor: "warning.main",
  padding: "11px 14px",
  borderRadius: "2px",
  marginBottom: 2,
  lineHeight: 1.7,
};

export const errorBannerSx = {
  backgroundColor: "error.light",
  border: "1px solid",
  borderColor: "error.light",
  borderLeft: "4px solid",
  borderLeftColor: "error.main",
  padding: "10px 14px",
  borderRadius: "2px",
  marginBottom: 2,
  color: "error.dark",
};

export const buttonSx = {
  backgroundColor: "primary.main",
  color: "primary.contrastText",
  borderRadius: "8px",
  padding: "10px 48px",
  fontWeight: 700,
  cursor: "pointer",
  marginRight: "10px",
  textTransform: "none",
  "&:hover": { backgroundColor: "primary.dark" },
  "&.Mui-disabled": { opacity: 0.55 },
};
