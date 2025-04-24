"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Fade,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Search, LocalHospital, FilterList } from "@mui/icons-material";
import AdviceCard from "@/app/components/advice/AdviceCard";
import DoctorSection from "./DoctorSection";
import { useDoctorAdviceStore } from "@/app/store/doctorAdviceStore";

const categories = [
  "all",
  "Vitamin",
  "Mineral",
  "Yağ Asitleri",
  "Antioksidan",
  "Sindirim",
];

const AdvicePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    doctors,
    advices,
    loading,
    error,
    selectedCategory,
    fetchDoctors,
    fetchAdvices,
    setSelectedCategory,
  } = useDoctorAdviceStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchDoctors();
    fetchAdvices();
  }, [fetchDoctors, fetchAdvices]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Filtreleme işlemi
  const filteredAdvices = advices.filter((advice) => {
    const matchesCategory =
      selectedCategory === "all" || advice.category === selectedCategory;
    const matchesSearch =
      advice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advice.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Doktor bilgilerini tavsiye kartları için eşleme
  const getDoctorById = (doctorId: number) => {
    return doctors.find((doctor) => doctor.id === doctorId) || doctors[0];
  };

  return (
    <Box className="min-h-screen bg-gray-50 mt-10">
      {/* Hero başlık alanı */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0288d1 0%, #26c6da 100%)",
          py: 6,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: "url(/images/pattern-dots.png)",
            zIndex: 1,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            textAlign="center"
            mb={2}
          >
            Uzman Sağlık Tavsiyeleri
          </Typography>

          <Typography
            variant="h6"
            textAlign="center"
            sx={{ maxWidth: 800, mx: "auto", opacity: 0.9 }}
          >
            Alanında uzman doktorlarımızdan gelen en güncel tavsiyeler ve sağlık
            önerileri
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Filtreler ve Arama */}
        <Box sx={{ mb: 5 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tavsiye veya konu ara..."
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    backgroundColor: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", md: "flex-end" },
                }}
              >
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category === "all" ? "Tümü" : category}
                    onClick={() => handleCategoryChange(category)}
                    color={
                      selectedCategory === category ? "primary" : "default"
                    }
                    variant={
                      selectedCategory === category ? "filled" : "outlined"
                    }
                    sx={{
                      borderRadius: "12px",
                      fontWeight: selectedCategory === category ? 600 : 500,
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Sekmeler */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px",
              },
            }}
          >
            <Tab
              icon={<FilterList />}
              label="Tavsiyeler"
              iconPosition="start"
              sx={{ fontWeight: 600 }}
            />
            <Tab
              icon={<LocalHospital />}
              label="Uzman Doktorlar"
              iconPosition="start"
              sx={{ fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* Sayfa içeriği */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 1: Tavsiyeler */}
            <Fade in={activeTab === 0} mountOnEnter unmountOnExit>
              <div>
                {filteredAdvices.length > 0 ? (
                  <Grid container spacing={3}>
                    {filteredAdvices.map((advice) => (
                      <Grid item xs={12} sm={6} md={4} key={advice.id}>
                        <AdviceCard
                          advice={advice}
                          doctor={getDoctorById(advice.doctorId)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      Aradığınız kriterlere uygun tavsiye bulunamadı.
                    </Typography>
                  </Box>
                )}
              </div>
            </Fade>

            {/* Tab 2: Doktorlar */}
            <Fade in={activeTab === 1} mountOnEnter unmountOnExit>
              <div>
                <DoctorSection doctors={doctors} />
              </div>
            </Fade>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdvicePage;
