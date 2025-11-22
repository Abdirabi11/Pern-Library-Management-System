import z from "zod";

export const updateRoleSchema = z.object({
    role: z.enum(["admin", "librarian", "student"])
});
  
export const createBookSchema = z.object({
    title: z.string().min(2),
    author: z.string().min(2),
    isbn: z.string().min(5),
    published_year: z.string(),
    category: z.string().min(2),
    copies: z.number().min(1),
});

export const analyticsFilterSchema = z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    category: z.string().optional(),
    userId: z.string().optional(),
});
  

// useAnalyticsQuery()
// useBookUploadImageMutation()

  