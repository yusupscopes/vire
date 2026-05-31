import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/database";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    return await prisma.message.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 100,
    });
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Message is required" }),
      }),
    )
    .mutation(async ({ input }) => {
      const createdMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: "USER",
          type: "PROMPT",
        },
      });

      await inngest.send({
        name: "app/message.created",
        data: {
          value: input.value,
        },
      });

      return createdMessage;
    }),
});
