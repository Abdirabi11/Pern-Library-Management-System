import {z} from "zod"

export const loginSchema= z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
    name: z.string().min(2, { message: "Name required" }),
    email: z.string().email({ message: "Invalid email" }),
    role: z.enum(["admin", "librarian", "student"], { required_error: "Select role" }),
    password: z.string().min(6).optional(),
});
  
export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const signupSchema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be 6+ chars"),
    passwordConfirm: z.string().min(6),
}).refine(data => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
});
  
export type SignupSchema = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
