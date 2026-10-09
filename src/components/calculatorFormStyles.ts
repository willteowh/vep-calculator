export const pageHeaderStyle = {
  fontSize: 30,
  fontWeight: 700,
  lineHeight: 1.2,
} as const;

export const formCardStyle = {
  backgroundColor: "#fff",
  //   border: "1px solid #e1e5eb",
  borderRadius: 4,
  padding: 3,
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
  color: "text.primary",
  borderColor: "transparent",
  backgroundColor: "transparent",
  "&:hover": {
    borderColor: "transparent",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
} as const;

export const primaryButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: "primary.main",
  "&:hover": {
    backgroundColor: "primary.light",
  },
  boxShadow: "none",
  px: "20px;",
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
  color: "text.secondary",
  fontSize: 16,
  fontWeight: 600,
} as const;

export const asteriskStyle = { color: "error.main", fontWeight: 600 } as const;

export const introParagraphStyle = {
  fontWeight: 400,
  fontSizeL: 18,
} as const;

export const linkStyle = {
  color: "primary.main",
  textDecoration: "underline",
} as const;

export const inputStyle = {
  px: 0,
  py: 0,
  height: "48px",
  fontSize: "18px",
  backgroundColor: "#fff !important",
  color: "text.primary",

  "& input": {
    backgroundColor: "#fff !important",
  },

  "& .MuiInputBase-root": {
    height: "48px",
    fontSize: "18px",
    color: "text.primary",
  },
  "& .MuiPickersOutlinedInput-root": {
    height: "48px",
    fontSize: "18px",
    color: "text.primary",
  },
  "& .MuiPickersInputBase-sectionsContainer, & .MuiPickersOutlinedInput-input":
    {
      alignItems: "center",
      height: "48px",
      padding: 0,
    },
  "& .MuiPickersInputBase-sectionsContainer": {
    color: "text.disabled",
    opacity: 1,
    fontStyle: "normal",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "divider",
  },
  "& .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "divider",
  },
  "&:not(.Mui-disabled):not(.Mui-error):hover .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "primary.light",
    },
  "& .MuiPickersOutlinedInput-root:not(.MuiPickersInputBase-disabled):not(.MuiPickersInputBase-error):hover .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "primary.light",
    },
  "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.dark",
    borderWidth: 2,
  },
  "& .MuiPickersOutlinedInput-root.MuiPickersInputBase-focused:not(.MuiPickersInputBase-error) .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "primary.dark",
      borderWidth: 2,
    },
  "& .MuiOutlinedInput-root:not(.Mui-disabled):not(.Mui-error):hover .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "primary.light",
    },
  "& .MuiOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "primary.dark",
      borderWidth: 2,
    },
} as const;

export const datepickerStyle = {
  height: "48px",
  fontSize: "18px",
  color: "text.primary",
  "& .MuiInputBase-root": {
    height: "48px",
    fontSize: "18px",
    color: "text.primary",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "divider",
  },
};

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
    opacity: 1,
  },
} as const;
