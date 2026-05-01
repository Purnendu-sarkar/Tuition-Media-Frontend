export type UserRole = "TUTOR" | "GUARDIAN" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
}

export interface AuthSuccessResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
}
