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
  color: "#4b5563",
  fontSize: 16,
  fontWeight: 600,
} as const;

export const asteriskStyle = { color: "#CA222D", fontWeight: 600 } as const;

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
  height: "48px",
  fontSize: "18px",
  backgroundColor: "#fff !important",
  color: "#23272E",
  "& .MuiInputBase-root": {
    height: "48px",
    fontSize: "18px",
    color: "#23272E",
  },
  "& .MuiPickersOutlinedInput-root": {
    height: "48px",
    fontSize: "18px",
    color: "#23272E",
  },
  "& .MuiPickersInputBase-sectionsContainer, & .MuiPickersOutlinedInput-input":
    {
      alignItems: "center",
      height: "48px",
      padding: 0,
    },
  "& .MuiPickersInputBase-sectionsContainer": {
    color: "#8991A1",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#C4C8D0",
  },
  "& .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "#C4C8D0",
  },
  "&:not(.Mui-disabled):not(.Mui-error):hover .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#7F7ECD",
    },
  "& .MuiPickersOutlinedInput-root:not(.MuiPickersInputBase-disabled):not(.MuiPickersInputBase-error):hover .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "#7F7ECD",
    },
  "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
    borderColor: "#5957BF",
    borderWidth: 2,
  },
  "& .MuiPickersOutlinedInput-root.MuiPickersInputBase-focused:not(.MuiPickersInputBase-error) .MuiPickersOutlinedInput-notchedOutline":
    {
      borderColor: "#5957BF",
      borderWidth: 2,
    },
  "& .MuiOutlinedInput-root:not(.Mui-disabled):not(.Mui-error):hover .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#7F7ECD",
    },
  "& .MuiOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#5957BF",
      borderWidth: 2,
    },
} as const;

export const datepickerStyle = {
  height: "48px",
  fontSize: "18px",
  color: "#23272E",
  "& .MuiInputBase-root": {
    height: "48px",
    fontSize: "18px",
    color: "#23272E",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#D1D5DB",
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
  },
} as const;

export const textFieldPlaceholderStyle = {
  "& input::placeholder": {
    color: "#8991A1",
    fontStyle: "normal",
    opacity: 1,
  },
} as const;
