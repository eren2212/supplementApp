import { ActivityType } from "@/types/activitie";

export const logActivity = async (
  userId: string,
  type: ActivityType,
  description?: string,
  referenceId?: string,
  productName?: string
) => {
  try {
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        details: description,
        referenceId,
        productName,
      }),
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
  }
};

export const logPasswordChangeActivity = (userId: string) => {
  return logActivity(userId, "PASSWORD_CHANGE", "Şifre değiştirildi");
};

export const logProfileUpdateActivity = (
  userId: string,
  updatedFields: string[]
) => {
  return logActivity(
    userId,
    "PROFILE_UPDATE",
    `Güncellenen alanlar: ${updatedFields.join(", ")}`
  );
};

// Diğer aktivite fonksiyonlarını da büyük harfli enum değerleriyle güncelleyin
