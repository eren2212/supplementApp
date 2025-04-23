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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  Snackbar,
  Tooltip,
  Pagination,
  SelectChangeEvent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
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

// Initial state for a new user
const initialUserState: Partial<User> = {
  name: "",
  email: "",
  role: "CUSTOMER",
  address: "",
  phone: "",
};

const UserManagementPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
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

  // Handle dialog open for edit
  const handleEditClick = (user: User) => {
    setEditUser(user);
    setIsAddMode(false);
    setOpenDialog(true);
  };

  // Handle dialog open for add
  const handleAddClick = () => {
    setEditUser({ ...initialUserState });
    setIsAddMode(true);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
  };

  // Handle form input changes
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (name) {
      setEditUser((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  // Handle save user (create or update)
  const handleSaveUser = async () => {
    try {
      if (!editUser) return;

      const url = isAddMode
        ? "/api/admin/users"
        : `/api/admin/users/${editUser.id}`;

      const method = isAddMode ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "İşlem başarısız oldu");
      }

      setSnackbar({
        open: true,
        message: isAddMode ? "Kullanıcı eklendi" : "Kullanıcı güncellendi",
        severity: "success",
      });

      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Bir hata oluştu",
        severity: "error",
      });
    }
  };

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
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => fetchUsers()}
          >
            Yenile
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleAddClick}
          >
            Yeni Kullanıcı
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
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Düzenle">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(user)}
                              aria-label="Düzenle"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      {/* Edit/Add User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isAddMode ? "Yeni Kullanıcı Ekle" : "Kullanıcıyı Düzenle"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="İsim"
              name="name"
              value={editUser?.name || ""}
              onChange={handleInputChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="E-posta"
              name="email"
              type="email"
              value={editUser?.email || ""}
              onChange={handleInputChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={editUser?.phone || ""}
              onChange={handleInputChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Adres"
              name="address"
              value={editUser?.address || ""}
              onChange={handleInputChange}
              multiline
              rows={2}
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                name="role"
                value={editUser?.role || "CUSTOMER"}
                onChange={handleInputChange}
                label="Rol"
              >
                <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                <MenuItem value="DOCTOR">Doktor</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            {isAddMode && (
              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                onChange={handleInputChange}
                variant="outlined"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            İptal
          </Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

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
