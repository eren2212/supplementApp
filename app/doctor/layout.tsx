"use client";

import React, { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { Toaster } from "react-hot-toast";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  useMediaQuery,
  Menu,
  MenuItem,
  Tooltip,
  CssBaseline,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  MedicalServices,
  Settings,
  Logout,
  Person,
  Home,
  Healing,
  Notifications,
} from "@mui/icons-material";
import { useSession, signOut, SessionProvider } from "next-auth/react";

// Font setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Drawer width
const drawerWidth = 280;

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#14B8A6", // Doktor için daha sağlık temalı bir ana renk (teal)
      light: "#3BC9BB",
      dark: "#0E8A7D",
    },
    secondary: {
      main: "#6342D8", // Mor tonu
    },
    background: {
      default: "#f5f7fb",
    },
  },
  typography: {
    fontFamily: geistSans.style.fontFamily,
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

// Styled components
const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  backgroundColor: "white",
  color: "black",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

// Navigation items for the sidebar
const mainNavItems = [
  {
    name: "Dashboard",
    icon: <DashboardIcon />,
    path: "/doctor",
    exact: true,
  },

  {
    name: "Yeni Tavsiye",
    icon: <Healing />,
    path: "/doctor/advices/create",
    exact: false,
  },
];

const secondaryNavItems = [
  { name: "Ana Siteye Dön", icon: <Home />, path: "/" },
];

function DoctorLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    // Close drawer automatically on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Yükleme sırasında kontrol et ve eğer DOCTOR rolü yoksa yönlendir
  useEffect(() => {
    if (session && session.user && session.user.role !== "DOCTOR") {
      window.location.href = "/";
    }
  }, [session]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          {/* App Bar */}
          <AppBarStyled position="fixed" open={sidebarOpen}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={{ mr: 2 }}
              >
                {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>

              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Doktor Paneli
              </Typography>

              <Box sx={{ flexGrow: 1 }} />

              {/* Notifications */}
              <Tooltip title="Bildirimler">
                <IconButton color="inherit" sx={{ mr: 1 }}>
                  <Badge badgeContent={4} color="primary">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Profile Menu */}
              <Tooltip title="Hesabım">
                <IconButton
                  onClick={handleProfileClick}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <Avatar
                    alt={session?.user?.name || "Doktor"}
                    src={session?.user?.image || ""}
                    sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                  />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBarStyled>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleProfileClose}
            onClick={handleProfileClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                mt: 1.5,
                borderRadius: 2,
                minWidth: 200,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                  my: 0.5,
                  borderRadius: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Çıkış Yap
            </MenuItem>
          </Menu>

          {/* Sidebar Drawer */}
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                backgroundColor: theme.palette.primary.main,
                color: "white",
              },
            }}
            variant={isMobile ? "temporary" : "persistent"}
            anchor="left"
            open={sidebarOpen}
            onClose={handleDrawerToggle}
          >
            <DrawerHeader sx={{ justifyContent: "space-between", px: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Doktor Paneli
              </Typography>
            </DrawerHeader>

            <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

            <List sx={{ px: 2 }}>
              {mainNavItems.map((item) => (
                <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor: isActive(item.path, item.exact)
                        ? "rgba(255,255,255,0.2)"
                        : "transparent",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 2 }} />

            <List sx={{ px: 2, mt: "auto", mb: 2 }}>
              {secondaryNavItems.map((item) => (
                <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Drawer>

          {/* Main Content */}
          <Main open={sidebarOpen}>
            <DrawerHeader />
            {children}
          </Main>
        </Box>

        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </ThemeProvider>
  );
}

// Wrap with SessionProvider
export default function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <SessionProvider>
          <DoctorLayoutContent>{children}</DoctorLayoutContent>
        </SessionProvider>
      </body>
    </html>
  );
}
