import { User } from "./User.1";

export interface Comment {
  id: number;
  user: User;
  comment: string;
  created_at: string;
  updated_at: string;
}
