export const pageHeaderStyle = {
  fontSize: 30,
  fontWeight: 700,
  lineHeight: 1.2,
} as const;

export const formCardStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e1e5eb",
  borderRadius: 4,
  padding: { xs: 2, md: 3 },
  mt: 2,
  mb: 2,
  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.16)",
} as const;

export const baseButtonStyle = {
  fontSize: 18,
  fontWeight: 700,
  textTransform: "none",
  borderRadius: 999,
  px: 3,
  py: 1,
} as const;

export const tertiaryButtonStyle = {
  ...baseButtonStyle,
  color: "#2c2f36",
  borderColor: "transparent",
  backgroundColor: "transparent",
  "&:hover": {
    borderColor: "transparent",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
} as const;

export const primaryButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: "#3B3A99",
  "&:hover": {
    backgroundColor: "#3d3f97",
  },
} as const;

export const quickFillButtonStyle = {
  minWidth: 40,
  width: 40,
  height: 40,
  borderRadius: 999,
  p: 0,
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1,
} as const;

export const labelStyle = {
  display: "block",
  mb: 0.75,
  color: "#4b5563",
  fontSize: 16,
  fontWeight: 600,
} as const;

export const introParagraphStyle = {
  fontWeight: 400,
  fontSizeL: 18,
} as const;

export const linkStyle = {
  color: "#3B3A99",
  textDecoration: "underline",
} as const;

export const inputStyle = {
  px: 0,
  py: 0,
} as const;

export const selectPlaceholderStyle = {
  color: "#000",
  fontStyle: "normal",
  "& .MuiSelect-select": {
    color: "#000",
    fontStyle: "normal",
  },
  "& .MuiSelect-select.MuiSelect-select": {
    color: "#000",
  },
  "& .MuiSelect-select .MuiTypography-root": {
    color: "#000",
  },
  "& .MuiSelect-select:has(em)": {
    color: "#8991A1",
  },
  "& .MuiSelect-select em": {
    color: "#8991A1",
    fontStyle: "normal",
  },
} as const;

export const textFieldPlaceholderStyle = {
  "&::placeholder": {
    color: "#8991A1",
    fontStyle: "normal",
    opacity: 1,
  },
} as const;
