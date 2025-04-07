// utils/activityService.ts
export const logActivity = async (
  userId: string,
  type: string,
  details?: string,
  referenceId?: string,
  productName?: string
) => {
  try {
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        details,
        referenceId,
        productName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to log activity");
    }
  } catch (error) {
    console.error("Activity logging failed:", error);
  }
};

// Diğer fonksiyonlar aynı şekilde kalabilir
export const logProfileUpdateActivity = async (
  userId: string,
  updatedFields: string[]
) => {
  await logActivity(
    userId,
    "profile_update",
    `Updated fields: ${updatedFields.join(", ")}`
  );
};

// ... diğer fonksiyonlar
