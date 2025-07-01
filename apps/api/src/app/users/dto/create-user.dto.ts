import { z } from "zod";

export const CreateUserSchema = z.object({
  configType: z.literal("CREATE_USER"),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(["admin", "user", "guest"]).default("user"),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  configType: z.literal("UPDATE_USER"),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(["admin", "user", "guest"]).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
