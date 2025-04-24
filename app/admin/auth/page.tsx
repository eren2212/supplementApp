"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Pagination,
  Popover,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

// Type for user data
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  address?: string | null;
  phone?: string | null;
  createdAt: string;
  image?: string | null;
}

const UserManagementPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
    open: false,
    userId: "",
  });
  const rowsPerPage = 10;
  const [rolePopover, setRolePopover] = useState<{
    open: boolean;
    anchorEl: HTMLElement | null;
    userId: string;
    currentRole: Role;
  }>({
    open: false,
    anchorEl: null,
    userId: "",
    currentRole: "CUSTOMER",
  });

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=${rowsPerPage}`
      );

      if (!response.ok) {
        throw new Error("Kullanıcılar yüklenirken bir hata oluştu");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / rowsPerPage));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    setConfirmDeleteDialog({ open: false, userId: "" });

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Silme işlemi başarısız oldu");
      }

      setSnackbar({
        open: true,
        message: "Kullanıcı silindi",
        severity: "success",
      });

      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err instanceof Error ? err.message : "Silme işlemi başarısız oldu",
        severity: "error",
      });
    }
  };

  // Function to get role color
  const getRoleColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "DOCTOR":
        return "info";
      case "CUSTOMER":
      default:
        return "success";
    }
  };

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Handle role click to open popover
  const handleRoleClick = (
    event: React.MouseEvent<HTMLDivElement>,
    userId: string,
    currentRole: Role
  ) => {
    setRolePopover({
      open: true,
      anchorEl: event.currentTarget,
      userId,
      currentRole,
    });
  };

  // Handle role popover close
  const handleRolePopoverClose = () => {
    setRolePopover({
      ...rolePopover,
      open: false,
      anchorEl: null,
    });
  };

  // Handle role change
  const handleRoleChange = async (newRole: Role) => {
    try {
      const response = await fetch(`/api/admin/users/${rolePopover.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Rol değiştirme işlemi başarısız oldu"
        );
      }

      // Update the users list with the new role
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === rolePopover.userId ? { ...user, role: newRole } : user
        )
      );

      setSnackbar({
        open: true,
        message: "Kullanıcı rolü güncellendi",
        severity: "success",
      });

      handleRolePopoverClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Bir hata oluştu",
        severity: "error",
      });
      handleRolePopoverClose();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
        <IconButton
          sx={{ mr: 2 }}
          onClick={() => router.push("/admin")}
          aria-label="Geri"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Kullanıcı Yönetimi
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => fetchUsers()}
          >
            Yenile
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>İsim</TableCell>
                    <TableCell>E-posta</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>Adres</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Kayıt Tarihi</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>{user.address || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={
                              getRoleColor(user.role) as
                                | "error"
                                | "info"
                                | "success"
                            }
                            size="small"
                            onClick={(e) =>
                              handleRoleClick(e, user.id, user.role)
                            }
                            sx={{ cursor: "pointer" }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                setConfirmDeleteDialog({
                                  open: true,
                                  userId: user.id,
                                })
                              }
                              aria-label="Sil"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Kullanıcı bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog.open}
        onClose={() => setConfirmDeleteDialog({ open: false, userId: "" })}
      >
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu kullanıcıyı silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDeleteDialog({ open: false, userId: "" })}
          >
            İptal
          </Button>
          <Button
            onClick={() => handleDeleteUser(confirmDeleteDialog.userId)}
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Popover */}
      <Popover
        open={rolePopover.open}
        anchorEl={rolePopover.anchorEl}
        onClose={handleRolePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ width: 200 }}>
          <MenuItem
            onClick={() => handleRoleChange("CUSTOMER")}
            sx={{
              bgcolor:
                rolePopover.currentRole === "CUSTOMER"
                  ? "action.selected"
                  : "inherit",
              py: 1.5,
            }}
          >
            <Typography>Müşteri</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => handleRoleChange("DOCTOR")}
            sx={{
              bgcolor:
                rolePopover.currentRole === "DOCTOR"
                  ? "action.selected"
                  : "inherit",
              py: 1.5,
            }}
          >
            <Typography>Doktor</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => handleRoleChange("ADMIN")}
            sx={{
              bgcolor:
                rolePopover.currentRole === "ADMIN"
                  ? "action.selected"
                  : "inherit",
              py: 1.5,
            }}
          >
            <Typography>Admin</Typography>
          </MenuItem>
        </Box>
      </Popover>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagementPage;
