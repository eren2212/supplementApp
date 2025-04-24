"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { Toaster } from "react-hot-toast";
import { CssBaseline } from "@mui/material";

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#6342D8",
      light: "#8B5CF6",
      dark: "#4C1D95",
    },
    secondary: {
      main: "#14B8A6",
    },
    background: {
      default: "#f5f7fb",
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

const LoginContainer = styled("div")({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(135deg, #6342D8 0%, #8B5CF6 100%)",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999, // Make sure this is above admin layout
});

// Page layout for login that hides parent layout
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoginContainer>
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Toaster position="bottom-center" />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </LoginContainer>
  );
}
