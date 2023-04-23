/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const emailRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const emails = await ctx.prisma.emailInformation.findMany({
      where: {
        userID: ctx.auth.userId,
      },
    });

    return emails;
  }),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        from: z.string(),
        subject: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt:
          "Summarize this for a second-grade student:\n\nJupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. It is named after the Roman god Jupiter.[19] When viewed from Earth, Jupiter can be bright enough for its reflected light to cast visible shadows,[20] and is on average the third-brightest natural object in the night sky after the Moon and Venus.",
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const responseText = response.data.choices[0]?.text;

      if (!responseText) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "No response from CahtGPT",
        });
      }

      await ctx.prisma.emailInformation.create({
        data: {
          ...input,
          response: responseText,
          userID: ctx.auth.userId,
        },
      });
    }),
});
