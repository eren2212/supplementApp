import { create } from "zustand";
import axios from "axios";

export interface Supplement {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  status?: "active" | "inactive";
  featured?: boolean;
}

interface SupplementsState {
  supplements: Supplement[];
  filteredSupplements: Supplement[];
  isLoading: boolean;
  error: string | null;

  // Filter states
  searchQuery: string;
  categoryFilter: string;
  sortBy: keyof Supplement;
  sortDirection: "asc" | "desc";

  // Actions
  fetchSupplements: () => Promise<void>;
  createSupplement: (supplement: Omit<Supplement, "id">) => Promise<Supplement>;
  updateSupplement: (
    id: string,
    data: Partial<Supplement>
  ) => Promise<Supplement>;
  deleteSupplement: (id: string) => Promise<void>;

  // Filter actions
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setSortBy: (field: keyof Supplement, direction: "asc" | "desc") => void;
  resetFilters: () => void;
}

export const useSupplementStore = create<SupplementsState>((set, get) => ({
  supplements: [],
  filteredSupplements: [],
  isLoading: false,
  error: null,

  // Filter states
  searchQuery: "",
  categoryFilter: "",
  sortBy: "name",
  sortDirection: "asc",

  // Actions
  fetchSupplements: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get("/api/admin/supplements");
      const supplements = response.data;

      set({
        supplements,
        filteredSupplements: applyFilters(
          supplements,
          get().searchQuery,
          get().categoryFilter,
          get().sortBy,
          get().sortDirection
        ),
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch supplements:", error);
      set({
        error: "Takviye ürünleri yüklenirken bir hata oluştu.",
        isLoading: false,
      });
    }
  },

  createSupplement: async (supplementData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(
        "/api/admin/supplements",
        supplementData
      );
      const newSupplement = response.data;

      const updatedSupplements = [...get().supplements, newSupplement];

      set({
        supplements: updatedSupplements,
        filteredSupplements: applyFilters(
          updatedSupplements,
          get().searchQuery,
          get().categoryFilter,
          get().sortBy,
          get().sortDirection
        ),
        isLoading: false,
      });

      return newSupplement;
    } catch (error) {
      console.error("Failed to create supplement:", error);
      set({
        error: "Takviye ürünü oluşturulurken bir hata oluştu.",
        isLoading: false,
      });
      throw error;
    }
  },

  updateSupplement: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.put(`/api/admin/supplements/${id}`, data);
      const updatedSupplement = response.data;

      const updatedSupplements = get().supplements.map((supplement) =>
        supplement.id === id
          ? { ...supplement, ...updatedSupplement }
          : supplement
      );

      set({
        supplements: updatedSupplements,
        filteredSupplements: applyFilters(
          updatedSupplements,
          get().searchQuery,
          get().categoryFilter,
          get().sortBy,
          get().sortDirection
        ),
        isLoading: false,
      });

      return updatedSupplement;
    } catch (error) {
      console.error(`Failed to update supplement ${id}:`, error);
      set({
        error: "Takviye ürünü güncellenirken bir hata oluştu.",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSupplement: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await axios.delete(`/api/admin/supplements/${id}`);

      const updatedSupplements = get().supplements.filter(
        (supplement) => supplement.id !== id
      );

      set({
        supplements: updatedSupplements,
        filteredSupplements: applyFilters(
          updatedSupplements,
          get().searchQuery,
          get().categoryFilter,
          get().sortBy,
          get().sortDirection
        ),
        isLoading: false,
      });
    } catch (error) {
      console.error(`Failed to delete supplement ${id}:`, error);
      set({
        error: "Takviye ürünü silinirken bir hata oluştu.",
        isLoading: false,
      });
      throw error;
    }
  },

  // Filter actions
  setSearchQuery: (query) => {
    const { supplements, categoryFilter, sortBy, sortDirection } = get();
    set({
      searchQuery: query,
      filteredSupplements: applyFilters(
        supplements,
        query,
        categoryFilter,
        sortBy,
        sortDirection
      ),
    });
  },

  setCategoryFilter: (category) => {
    const { supplements, searchQuery, sortBy, sortDirection } = get();
    set({
      categoryFilter: category,
      filteredSupplements: applyFilters(
        supplements,
        searchQuery,
        category,
        sortBy,
        sortDirection
      ),
    });
  },

  setSortBy: (field, direction) => {
    const { supplements, searchQuery, categoryFilter } = get();
    set({
      sortBy: field,
      sortDirection: direction,
      filteredSupplements: applyFilters(
        supplements,
        searchQuery,
        categoryFilter,
        field,
        direction
      ),
    });
  },

  resetFilters: () => {
    const { supplements } = get();
    set({
      searchQuery: "",
      categoryFilter: "",
      sortBy: "name",
      sortDirection: "asc",
      filteredSupplements: [...supplements],
    });
  },
}));

// Helper function to apply filters
function applyFilters(
  supplements: Supplement[],
  searchQuery: string,
  categoryFilter: string,
  sortBy: keyof Supplement,
  sortDirection: "asc" | "desc"
): Supplement[] {
  // Apply search filter
  let filtered = supplements;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        false
    );
  }

  // Apply category filter
  if (categoryFilter) {
    filtered = filtered.filter((item) => item.category === categoryFilter);
  }

  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];

    if (valueA === undefined && valueB === undefined) return 0;
    if (valueA === undefined) return sortDirection === "asc" ? -1 : 1;
    if (valueB === undefined) return sortDirection === "asc" ? 1 : -1;

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
}
