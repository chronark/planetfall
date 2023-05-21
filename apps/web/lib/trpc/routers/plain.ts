import { auth, t } from "../trpc";
import highstorm from "@highstorm/client";
import { db } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PlainClient, type UpsertCustomTimelineEntryInput } from '@team-plain/typescript-sdk';
import { Clerk } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs"
import { UpsertCustomerInput } from "@team-plain/typescript-sdk";
import { ComponentSpacerSize } from "@team-plain/typescript-sdk";
import { ComponentTextSize } from "@team-plain/typescript-sdk";
import { ComponentTextColor } from "@team-plain/typescript-sdk";

const issueType = z.enum(["bug", "feature", "security", "question"])
const severity = z.enum(["p0", "p1", "p2", "p3"])
export const plainRouter = t.router({
  createIssue: t.procedure
    .use(auth)
    .input(
      z.object({
        issueType,
        severity,
        message: z.string(),
        path: z.string().nullable(),

      }),
    )
    .mutation(async ({ input, ctx }) => {
      const apiKey = process.env.PLAIN_API_KEY;

      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "PLAIN_API_KEY is not set",
        })
      }

      const client = new PlainClient({
        apiKey,
      });

      const user = await clerkClient.users.getUser(ctx.user.id)
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        })
      }

      const plainUser = await client.upsertCustomer({
        identifier: {
          externalId: user.id
        },
        onCreate: {
          email: {
            email: user.emailAddresses.at(0)?.emailAddress ?? "",
            isVerified: user.emailAddresses.at(0)?.verification?.status === "verified",
          },
          fullName: user.username ?? "",
        },
        onUpdate: {}

      })
      if (plainUser.error) {
        console.error(plainUser.error.message)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: plainUser.error.message,
        })
      }


      const upsertTimelineEntryRes = await client.upsertCustomTimelineEntry({
        customerId: plainUser.data.id,
        ...(input.issueType === "bug" ? customTimelineEntryForBug(input.message, input.path) : input.issueType === "feature" ? customTimelineEntryForFeatureRequest(input.message) : input.issueType === "security" ? customTimelineEntryForSecurityReport(input.message) : customTimelineEntryForQuestion(input.message)),
        changeCustomerStatusToActive: true,
        sendCustomTimelineEntryCreatedNotification: true,
      });

      if (upsertTimelineEntryRes.error) {
        console.error(upsertTimelineEntryRes.error.message)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: upsertTimelineEntryRes.error.message,
        })
      }






      const createIssueRes = await client.createIssue({
        customerId: plainUser.data.id,
        issueTypeId: issueToId[input.issueType],
        priorityValue: severityToNumber[input.severity],
      });
      if (createIssueRes.error) {
        console.error(createIssueRes.error.message)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: createIssueRes.error.message,
        })
      }


      await highstorm("issues.created", {
        event: `${user.username} created an issue`,
        metadata: {
          userId: user.id,
        },
      });
      return
    }),
});



const issueToId: Record<z.infer<typeof issueType>, string> = {
  bug: "it_01GTMAY1P2791A17CF7NCXKMVD",
  feature: "it_01GTMAY6M2V93JFFFXXGB159PD",
  question: "it_01GTMAY3FXWK55A39KBDZEA47P",
  security: "it_01H0ZT4STEQEQEQWHB1PPF56B7"
}

const severityToNumber: Record<z.infer<typeof severity>, number> = {
  p0: 0,
  p1: 1,
  p2: 2,
  p3: 3,

}

export function customTimelineEntryForBug(text: string, path: string | null) {

  return {
    title: 'Bug report',
    components: [
      {
        componentText: {
          text,
        },
      },
      {
        componentSpacer: {
          spacerSize: ComponentSpacerSize.S,
        },
      },
      {
        componentText: {
          text: `Reported on ${path}`,
          textSize: ComponentTextSize.S,
          textColor: ComponentTextColor.Muted,
        },
      },
    ],
  };
}

function customTimelineEntryForFeatureRequest(text: string) {
  return {
    title: 'Feature request',
    components: [
      {
        componentText: {
          text,
        },
      },
    ],
  };
}

function customTimelineEntryForQuestion(text: string) {
  return {
    title: 'General question',
    components: [
      {
        componentText: {
          text,
        },
      },
    ],
  };
}

function customTimelineEntryForSecurityReport(text: string) {
  return {
    title: 'Security report',
    components: [
      {
        componentText: {
          text,
        },
      },
    ],
  };
}