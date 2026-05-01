import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

if (!parsedPublicEnv.success) {
  console.error("Invalid frontend public environment variables", parsedPublicEnv.error.flatten().fieldErrors);
  throw new Error("Invalid frontend public environment variables.");
}

export const publicEnv = parsedPublicEnv.data;
