// app/actions/activity.ts
"use server";

import prisma from "@/libs/prismadb";

export async function logActivity(
  userId: string,
  type: string,
  details?: string
) {
  await prisma.activity.create({
    data: {
      userId,
      type,
      description: details || "",
      date: new Date(),
    },
  });
}
