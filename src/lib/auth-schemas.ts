import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters."),
    email: z.string().trim().email("Provide a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string().min(8, "Please confirm your password."),
    role: z.enum(["TUTOR", "GUARDIAN"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const signInSchema = z.object({
  email: z.string().trim().email("Provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
