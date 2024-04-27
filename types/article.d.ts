import { User } from "./User.1";
import { Comment } from "./comment";

export interface Article {
  id: number;
  user: User;
  title: string;
  slug: string;
  subtitle: string;
  img: string;
  body: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: Comment[];
}
