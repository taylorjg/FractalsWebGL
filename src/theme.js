import { createTheme } from "@mui/material/styles";

export const fractalsTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6ec6ff",
    },
    secondary: {
      main: "#b388ff",
    },
    background: {
      default: "#000000",
      paper: "rgba(24, 24, 32, 0.94)",
    },
    text: {
      primary: "rgba(255, 255, 255, 0.92)",
      secondary: "rgba(255, 255, 255, 0.65)",
    },
    divider: "rgba(255, 255, 255, 0.1)",
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.65)",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0, 0, 0, 0.55)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255, 255, 255, 0.08)",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#6ec6ff",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: "0 2px 8px rgba(110, 198, 255, 0.25)",
        },
      },
    },
  },
});

export const thumbnailStyle = {
  display: "block",
  borderRadius: 8,
  boxShadow: "1px 1px 10px rgba(0, 0, 0, 0.8)",
  cursor: "pointer",
};
