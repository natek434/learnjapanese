"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const progressSchema = z.object({
  kanaId: z.string(),
  box: z.number().int().min(1).max(5),
  dueAt: z.coerce.date(),
  lastScore: z.number().int().min(0).max(3),
  seenCount: z.number().int().min(1)
});

export async function upsertProgress(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = progressSchema.parse(input);

  await prisma.progress.upsert({
    where: {
      userId_kanaId: {
        userId: session.user.id,
        kanaId: data.kanaId
      }
    },
    update: {
      box: data.box,
      dueAt: data.dueAt,
      lastScore: data.lastScore,
      seenCount: data.seenCount
    },
    create: {
      userId: session.user.id,
      kanaId: data.kanaId,
      box: data.box,
      dueAt: data.dueAt,
      lastScore: data.lastScore,
      seenCount: data.seenCount
    }
  });

  revalidatePath("/progress");
  revalidatePath("/quiz");
}
