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
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Pagination,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

interface Comment {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  reportCount: number;
  isHidden: boolean;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  supplement: {
    id: string;
    name: string;
  };
}

const CommentManagementPage = () => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
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
    commentId: "",
  });
  const [reportFilter, setReportFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const rowsPerPage = 10;

  // Fetch comments data
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/comments?page=${page}&limit=${rowsPerPage}`
      );

      if (!response.ok) {
        throw new Error("Yorumlar yüklenirken bir hata oluştu");
      }

      const data = await response.json();
      setComments(data);
      // Şimdilik sayfalama yok, gerçek uygulamada backend'den gelmeli
      setTotalPages(Math.ceil(data.length / rowsPerPage));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    setConfirmDeleteDialog({ open: false, commentId: "" });

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Silme işlemi başarısız oldu");
      }

      setSnackbar({
        open: true,
        message: "Yorum başarıyla silindi",
        severity: "success",
      });

      // Refresh comments list
      fetchComments();
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err instanceof Error ? err.message : "Silme işlemi başarısız oldu",
        severity: "error",
      });
    }
  };

  // Handle toggle comment visibility
  const handleToggleVisibility = async (
    commentId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHidden: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "İşlem başarısız oldu");
      }

      setSnackbar({
        open: true,
        message: !currentStatus ? "Yorum gizlendi" : "Yorum görünür yapıldı",
        severity: "success",
      });

      // Update the comments list
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, isHidden: !currentStatus }
            : comment
        )
      );
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Bir hata oluştu",
        severity: "error",
      });
    }
  };

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Get filtered and sorted comments
  const getFilteredAndSortedComments = () => {
    // First filter comments based on report count and status
    let filteredComments = [...comments];

    // Apply report filter
    if (reportFilter === "reported") {
      filteredComments = filteredComments.filter(
        (comment) => comment.reportCount > 0
      );
    } else if (reportFilter === "highReports") {
      filteredComments = filteredComments.filter(
        (comment) => comment.reportCount >= 2
      );
    } else if (reportFilter === "noReports") {
      filteredComments = filteredComments.filter(
        (comment) => comment.reportCount === 0
      );
    }

    // Apply status filter
    if (statusFilter === "visible") {
      filteredComments = filteredComments.filter(
        (comment) => !comment.isHidden
      );
    } else if (statusFilter === "hidden") {
      filteredComments = filteredComments.filter((comment) => comment.isHidden);
    }

    // Then sort the filtered comments
    if (sortBy === "reportCount") {
      filteredComments.sort((a, b) => b.reportCount - a.reportCount);
    } else if (sortBy === "date") {
      filteredComments.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "rating") {
      filteredComments.sort((a, b) => b.rating - a.rating);
    }

    return filteredComments;
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
          Yorum Yönetimi
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="report-filter-label">Şikayet Filtresi</InputLabel>
              <Select
                labelId="report-filter-label"
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                label="Şikayet Filtresi"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="reported">Şikayet Edilenler</MenuItem>
                <MenuItem value="highReports">Yüksek Şikayet (2+)</MenuItem>
                <MenuItem value="noReports">Şikayet Edilmeyenler</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Durum Filtresi</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Durum Filtresi"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="visible">Görünür</MenuItem>
                <MenuItem value="hidden">Gizli</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="sort-by-label">Sıralama</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sıralama"
              >
                <MenuItem value="date">Tarih (Yeni-Eski)</MenuItem>
                <MenuItem value="reportCount">Şikayet Sayısı</MenuItem>
                <MenuItem value="rating">Puan (Yüksek-Düşük)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => fetchComments()}
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
                    <TableCell>Kullanıcı</TableCell>
                    <TableCell>Yorum</TableCell>
                    <TableCell>Ürün</TableCell>
                    <TableCell>Puan</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Şikayet</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredAndSortedComments().length > 0 ? (
                    getFilteredAndSortedComments()
                      .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                      .map((comment) => (
                        <TableRow
                          key={comment.id}
                          sx={{
                            backgroundColor: comment.isHidden
                              ? "rgba(0, 0, 0, 0.04)"
                              : "inherit",
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                sx={{
                                  position: "relative",
                                  width: 40,
                                  height: 40,
                                  mr: 2,
                                }}
                              >
                                {comment.user?.image ? (
                                  <Image
                                    src={comment.user.image}
                                    alt={comment.user.name}
                                    fill
                                    className="rounded-full object-cover"
                                    sizes="40px"
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      bgcolor: "primary.light",
                                      color: "primary.contrastText",
                                      borderRadius: "50%",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {comment.user?.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "?"}
                                  </Box>
                                )}
                              </Box>
                              <Typography>{comment.user?.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 250 }}>
                            <Typography
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {comment.content}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 150,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {comment.supplement?.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Rating
                              name="read-only"
                              value={comment.rating}
                              readOnly
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={new Date(
                                comment.createdAt
                              ).toLocaleString()}
                            >
                              <Typography variant="body2">
                                {dayjs(comment.createdAt).fromNow()}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={
                                comment.reportCount > 0
                                  ? `Bu yorum ${
                                      comment.reportCount
                                    } kez şikayet edilmiş${
                                      comment.reportCount >= 2
                                        ? " ve otomatik olarak gizlenmiş"
                                        : ""
                                    }`
                                  : "Bu yorum hiç şikayet edilmemiş"
                              }
                            >
                              <div>
                                <Chip
                                  icon={
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={16}
                                      height={16}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke={
                                        comment.reportCount === 0
                                          ? "#D14343"
                                          : "currentColor"
                                      }
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                      />
                                    </svg>
                                  }
                                  label={`${comment.reportCount} şikayet`}
                                  color={
                                    comment.reportCount >= 2
                                      ? "error"
                                      : comment.reportCount === 1
                                      ? "warning"
                                      : "default"
                                  }
                                  size="small"
                                  sx={{
                                    "& .MuiChip-label": {
                                      color:
                                        comment.reportCount === 0
                                          ? "#D14343"
                                          : "inherit",
                                    },
                                  }}
                                />
                              </div>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={comment.isHidden ? "Gizli" : "Görünür"}
                              color={comment.isHidden ? "default" : "success"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip
                              title={comment.isHidden ? "Göster" : "Gizle"}
                            >
                              <IconButton
                                size="small"
                                color={comment.isHidden ? "primary" : "default"}
                                onClick={() =>
                                  handleToggleVisibility(
                                    comment.id,
                                    comment.isHidden
                                  )
                                }
                                aria-label={
                                  comment.isHidden ? "Göster" : "Gizle"
                                }
                              >
                                {comment.isHidden ? (
                                  <VisibilityIcon fontSize="small" />
                                ) : (
                                  <VisibilityOffIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  setConfirmDeleteDialog({
                                    open: true,
                                    commentId: comment.id,
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
                      <TableCell colSpan={8} align="center">
                        Yorum bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog.open}
        onClose={() => setConfirmDeleteDialog({ open: false, commentId: "" })}
      >
        <DialogTitle>Yorumu Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu yorumu silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDeleteDialog({ open: false, commentId: "" })
            }
          >
            İptal
          </Button>
          <Button
            onClick={() => handleDeleteComment(confirmDeleteDialog.commentId)}
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

export default CommentManagementPage;
