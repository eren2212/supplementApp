"use client";

import React, { useEffect } from "react";
import { Inter, Geist, Geist_Mono } from "next/font/google";
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
  InputBase,
  useMediaQuery,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Inventory,
  People,
  Settings,
  Logout,
  Search,
  Notifications,
  Mail,
  Person,
  ShoppingCart,
  Home,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Security,
  NotificationsActive,
} from "@mui/icons-material";
import "@/app/globals.css";
import { useAdminStore } from "@/app/store/adminStore";
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

const SearchBox = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#f5f5f5",
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  maxWidth: 400,
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

// Navigation items for the sidebar
const mainNavItems = [
  {
    name: "Panel",
    icon: <DashboardIcon />,
    path: "/admin",
    exact: true,
  },
  {
    name: "Takviyeler",
    icon: <Inventory />,
    path: "/admin/supplements",
    exact: false,
  },
  {
    name: "Yorumlar",
    icon: <Mail />,
    path: "/admin/comments",
    exact: false,
  },
  {
    name: "Şikayetler",
    icon: <NotificationsActive />,
    path: "/admin/reports",
    exact: false,
  },
  {
    name: "Siparişler",
    icon: <ShoppingCart />,
    path: "/admin/orders",
    exact: false,
  },
  {
    name: "Yetkilendirme",
    icon: <Security />,
    path: "/admin/auth",
    exact: false,
  },
  {
    name: "Ayarlar",
    icon: <Settings />,
    path: "/admin/settings",
    exact: false,
  },
];

const secondaryNavItems = [
  { name: "Ana Siteye Dön", icon: <Home />, path: "/" },
];

// Main Component to be wrapped with SessionProvider
function AdminLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Use our Zustand store for sidebar state
  const { sidebarOpen, setSidebarOpen, unreadCount } = useAdminStore();

  // Profile menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Notification menu state
  const [notificationAnchorEl, setNotificationAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const notificationMenuOpen = Boolean(notificationAnchorEl);

  useEffect(() => {
    // Close drawer automatically on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile, setSidebarOpen]);

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

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <ThemeProvider theme={theme}>
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
                Supplement Admin Panel
              </Typography>

              <SearchBox>
                <SearchIconWrapper>
                  <Search />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Ara..."
                  inputProps={{ "aria-label": "search" }}
                />
              </SearchBox>

              <Box sx={{ flexGrow: 1 }} />

              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* Notifications Button */}
                <Tooltip title="Bildirimler">
                  <IconButton
                    size="large"
                    color="inherit"
                    onClick={handleNotificationClick}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Messages Button */}
                <Tooltip title="Mesajlar">
                  <IconButton size="large" color="inherit">
                    <Badge badgeContent={4} color="error">
                      <Mail />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* User Profile Button */}
                <Tooltip title="Profil">
                  <IconButton
                    size="large"
                    edge="end"
                    color="inherit"
                    onClick={handleProfileClick}
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.primary.main,
                        fontSize: 14,
                      }}
                    >
                      {session?.user?.name?.charAt(0) || <Person />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBarStyled>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            id="notification-menu"
            open={notificationMenuOpen}
            onClose={handleNotificationClose}
            onClick={handleNotificationClose}
            PaperProps={{
              elevation: 2,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.08))",
                mt: 1.5,
                width: 320,
                borderRadius: 2,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1.5,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Typography sx={{ px: 2, py: 1.5, fontWeight: 600 }}>
              Bildirimler
            </Typography>
            <Divider />
            <MenuItem>
              <ListItemIcon>
                <Badge color="success" variant="dot">
                  <ShoppingCart fontSize="small" />
                </Badge>
              </ListItemIcon>
              <Box>
                <Typography variant="body2">Yeni sipariş alındı</Typography>
                <Typography variant="caption" color="text.secondary">
                  5 dakika önce
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <Badge color="success" variant="dot">
                  <People fontSize="small" />
                </Badge>
              </ListItemIcon>
              <Box>
                <Typography variant="body2">
                  Yeni bir kullanıcı kaydoldu
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1 saat önce
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem sx={{ justifyContent: "center" }}>
              <Typography color="primary">Tüm Bildirimleri Gör</Typography>
            </MenuItem>
          </Menu>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleProfileClose}
            onClick={handleProfileClose}
            PaperProps={{
              elevation: 2,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.08))",
                mt: 1.5,
                borderRadius: 2,
                minWidth: 180,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1, mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {session?.user?.name || "Admin User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session?.user?.email || "admin@example.com"}
              </Typography>
            </Box>
            <Divider />
            <MenuItem>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profilim
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Ayarlar
            </MenuItem>
            <Divider />
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
                Admin Panel
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

            <List sx={{ px: 2, mt: "auto" }}>
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
            <DrawerHeader />{" "}
            {/* This creates space at the top for the AppBar */}
            {children}
          </Main>
        </Box>

        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </ThemeProvider>
  );
}

// Wrap the main component with the SessionProvider
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </SessionProvider>
      </body>
    </html>
  );
}
