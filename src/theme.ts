import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#3b3a99",
      light: "#7f7ecd",
      dark: "#292879",
      contrastText: "#fff",
    },
    secondary: {
      main: "#606fbb",
      contrastText: "#fff",
    },
    success: {
      main: "#2e7d32",
      light: "#e8f5e9",
      dark: "#1b5e20",
      contrastText: "#fff",
    },
    error: {
      main: "#c62828",
      light: "#ffebee",
      dark: "#b71c1c",
      contrastText: "#fff",
    },
    info: {
      main: "#1565c0",
      light: "#e3f2fd",
      dark: "#0d47a1",
      contrastText: "#fff",
    },
    warning: {
      main: "#f9a825",
      light: "#fff8e1",
      dark: "#f57f17",
      contrastText: "#222",
    },
    text: {
      primary: "#23272e",
      secondary: "#546174",
    },
    divider: "#d9dde5",
    background: {
      default: "#fff",
      paper: "#fff",
    },
  },
  typography: {
    fontFamily: '"Noto Sans", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFamily: '"Noto Sans", sans-serif' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: "none" },
      },
    },
  },
});
