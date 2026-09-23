// Response shapes of the Fastify API (see the backend's /docs).

export type Visibility = "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface Me {
  id: string;
  username: string;
  email: string;
  fullName: string;
  profileImage: string | null;
  coverImage: string | null;
  isPrivate: boolean;
  isProfileComplete: boolean;
  emailVerified: boolean;
  bio: string | null;
  website: string | null;
  location: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  createdAt: string;
  _count: { followers: number; following: number; Post: number };
}

export interface Profile {
  id: string;
  username: string;
  fullName: string;
  profileImage: string | null;
  coverImage: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowedByCurrentUser: boolean;
  isFollowingCurrentUser: boolean;
  createdAt: string;
}

export interface Author {
  id: string;
  username: string;
  fullName: string | null;
  profileImage: string | null;
}

export interface Post {
  id: string;
  author: Author & { isPrivate: boolean };
  title: string | null;
  content: string | null;
  image: string | null;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked: boolean;
}

export interface PersonSummary extends Author {
  bio: string | null;
  isPrivate?: boolean;
  followersCount?: number;
  mutualFollowersCount?: number;
  isFollowedByCurrentUser?: boolean;
}

export interface FollowRequest {
  id: string;
  sentAt: string;
  sender: Author & { bio: string | null };
}

export type NotificationType =
  | "like_post"
  | "comment"
  | "comment_liked"
  | "follow"
  | "follow_request"
  | "follow_accepted";

export interface AppNotification {
  id: string;
  type: NotificationType | string;
  messageText: string | null;
  link: string | null;
  postId: string | null;
  isRead: boolean;
  createdAt: string;
  actor: Author | null;
}

export type FollowStatus = "following" | "requested" | "none";

export interface PagePagination {
  page: number;
  pages: number;
}
