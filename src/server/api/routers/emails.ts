/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

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
      z.array(
        z.object({
          content: z.string(),
          from: z.string(),
          subject: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      // first delete all emails from the user
      await ctx.prisma.emailInformation.deleteMany({
        where: {
          userID: ctx.auth.userId,
        },
      });

      const { success } = await ratelimit.limit(ctx.auth.userId);

      let emailContent = "";
      input.map((inputMail) => {
        emailContent += `#\nFrom: ${inputMail.from}\n`;
        emailContent += `Subject: ${inputMail.subject}\n`;
        emailContent += `Body: ${inputMail.content}\n#\n\n`;
      });

      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate is limited to 3 request per 1 minute",
        });

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt:
          "You are a great E-Mail Task handler. You will process multiple emails at once. Between each e-mail there will be a # sign, this will show you the start and the end of the email. Your duty is to createa a summary of each e-mail. Based on the summary and reasons create a To-Do list to each e-mail, which is list of actions to do. The summary and the action list must contain every important section of the e-mail, because these e-mails are from the workplace. You don't wanna miss any critical information. The to-do list should be critical and precise for each e-mail. Create the to-do list with reason and critical thinking. The summary should be short and precise for a workplace. Start each response with: From: the e-mail address, Subject: the subject of the e-mail and then the summary and the to-do list. After you process all the e-mails, the result should come back in a prio list. Urgent and critical cases should be first, then put smaller, meaningless e-mails later in the list. The priorization should be critical. If you are ready I will send you the e-mails. The To-Do List should be a list of actions items. The result you give me should be in the same format I give you, put #### between each e-mail response you make, but don't forget about the priorization. Process and prio the emails: \n\n" +
          emailContent,
        temperature: 0.2,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const responseText = response.data.choices[0]?.text;

      if (!responseText) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "No response from ChatGPT",
        });
      }

      const responseArray = responseText.split("\n\n");

      input.map(async (inputMail, index) => {
        // openai calls here

        await ctx.prisma.emailInformation.create({
          data: {
            ...inputMail,
            response: responseArray[index] || "",
            userID: ctx.auth.userId,
          },
        });
      });
    }),
});
