"use client";

import React, { useEffect, useState } from "react";
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
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import { useReportStore } from "@/app/store/reportStore";

dayjs.extend(relativeTime);
dayjs.locale("tr");

const CommentReportPage = () => {
  const router = useRouter();
  const { reports, loading, error, fetchReports, dismissReport, acceptReport } =
    useReportStore();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    action: null as null | (() => Promise<void>),
  });

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDismissReport = async (reportId: string) => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      action: null,
    });

    try {
      await dismissReport(reportId);
      setSnackbar({
        open: true,
        message: "Şikayet reddedildi",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Şikayet reddedilirken bir hata oluştu",
        severity: "error",
      });
    }
  };

  const handleAcceptReport = async (reportId: string) => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      action: null,
    });

    try {
      await acceptReport(reportId);
      setSnackbar({
        open: true,
        message: "Yorum gizlendi ve şikayet kabul edildi",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "İşlem sırasında bir hata oluştu",
        severity: "error",
      });
    }
  };

  const openConfirmDialog = (
    title: string,
    message: string,
    action: () => Promise<void>
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action,
    });
  };

  const handleViewComment = (commentId: string) => {
    // Yorum detayına yönlendir (ürün sayfasına)
    const report = reports.find((r) => r.comment.id === commentId);
    if (report?.comment) {
      router.push(
        `/supplement/${report.comment.supplement?.id}#comment-${commentId}`
      );
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
          Yorum Şikayetleri
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => fetchReports()}
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Şikayet Eden</TableCell>
                  <TableCell>Şikayet Edilen Yorum</TableCell>
                  <TableCell>Yorum Sahibi</TableCell>
                  <TableCell>Ürün</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Sebep</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
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
                            {report.user?.image ? (
                              <Image
                                src={report.user.image}
                                alt={report.user.name}
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
                                {report.user?.name?.charAt(0)?.toUpperCase() ||
                                  "?"}
                              </Box>
                            )}
                          </Box>
                          <Typography>{report.user?.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {report.comment.content}
                        </Typography>
                      </TableCell>
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
                            {report.comment.user?.image ? (
                              <Image
                                src={report.comment.user.image}
                                alt={report.comment.user.name}
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
                                {report.comment.user?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "?"}
                              </Box>
                            )}
                          </Box>
                          <Typography>{report.comment.user?.name}</Typography>
                        </Box>
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
                          {report.comment.supplement?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={new Date(report.createdAt).toLocaleString()}
                        >
                          <Typography variant="body2">
                            {dayjs(report.createdAt).fromNow()}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.reason || "Belirtilmemiş"}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Yorumu Gör">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleViewComment(report.comment.id)
                              }
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Şikayeti Kabul Et">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                openConfirmDialog(
                                  "Şikayeti Kabul Et",
                                  "Bu şikayeti kabul etmek, yorumu gizleyecek ve şikayeti sistemden kaldıracaktır. Devam etmek istiyor musunuz?",
                                  () => handleAcceptReport(report.id)
                                )
                              }
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Şikayeti Reddet">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                openConfirmDialog(
                                  "Şikayeti Reddet",
                                  "Bu şikayeti reddetmek, şikayeti sistemden kaldıracak ancak yorum görünür olmaya devam edecektir. Devam etmek istiyor musunuz?",
                                  () => handleDismissReport(report.id)
                                )
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Şikayet bulunamadı
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            İptal
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.action) {
                confirmDialog.action();
              }
            }}
            color="primary"
            variant="contained"
            autoFocus
          >
            Onaylıyorum
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

export default CommentReportPage;
