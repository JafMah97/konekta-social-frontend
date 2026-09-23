import { api } from "./client";
import type {
  AppNotification,
  Comment,
  FollowRequest,
  FollowStatus,
  Me,
  PagePagination,
  PersonSummary,
  Post,
  Profile,
  Visibility,
} from "./types";

type Ok<T> = { success: true; data: T };

// ── Auth ─────────────────────────────────────────────────────────────────
export const auth = {
  login: (body: { email: string; password: string }) =>
    api<{ id: string; username: string; emailVerified: boolean }>("/auth/login", { method: "POST", body }),
  register: (body: { fullName: string; username: string; email: string; password: string }) =>
    api<{ id: string; email: string; verificationEmailSent: boolean }>("/auth/register", { method: "POST", body }),
  logout: () => api("/auth/logout", { method: "POST" }),
  verifyCode: (body: { email: string; code: string }) =>
    api("/auth/verify-email-with-code", { method: "POST", body }),
  verifyLink: (token: string) => api("/auth/verify-email-with-link", { method: "POST", body: { token } }),
  resendVerification: (email: string) => api("/auth/resend-verification", { method: "POST", body: { email } }),
  forgotPassword: (email: string) => api("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (body: { token: string; newPassword: string }) =>
    api("/auth/reset-password", { method: "POST", body }),
  requestMagicLink: (email: string) => api("/auth/magic-link", { method: "POST", body: { email } }),
  verifyMagicLink: (token: string) => api("/auth/magic-link/verify", { method: "POST", body: { token } }),
};

// ── Current user & account ────────────────────────────────────────────────
export interface ProfileInput {
  fullName?: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  isPrivate?: boolean;
}

const upload = (path: string, field: string, file: File) => {
  const form = new FormData();
  form.append(field, file, file.name);
  return api<Ok<Record<string, string>>>(path, { method: "POST", body: form });
};

export const account = {
  me: () => api<Ok<Me>>("/user/me").then((r) => r.data),
  updateProfile: (body: ProfileInput) => api<Ok<Partial<Me>>>("/user/profile-update", { method: "PUT", body }),
  completeProfile: (body: { bio?: string; website?: string; location?: string }) =>
    api("/user/complete-profile", { method: "POST", body }),
  uploadAvatar: (file: File) => upload("/user/profile-picture", "profileImage", file),
  uploadCover: (file: File) => upload("/user/profile-cover", "coverImage", file),
  changePassword: (body: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api("/user/change-password", { method: "POST", body }),
  changeEmail: (body: { newEmail: string; password: string }) =>
    api<Ok<{ email: string; pendingEmail: string }>>("/user/change-email", { method: "POST", body }),
  confirmNewEmail: (body: { code?: string; token?: string }) =>
    api<Ok<{ email: string }>>("/user/verify-new-Email", { method: "POST", body }),
  deleteAccount: () => api("/user/delete-account", { method: "DELETE" }),
};

// ── People ────────────────────────────────────────────────────────────────
type PeoplePage = { people: PersonSummary[]; pagination: PagePagination };

// The deployed API passes these routes' query strings to Prisma uncoerced,
// so `limit` must be left at its default and `page` sent only when > 1
// (it survives because the API only does arithmetic with it).
const pageQuery = (page: number) => (page > 1 ? { page } : undefined);
const toPeoplePage = (people: PersonSummary[], p: PagePagination): PeoplePage => ({
  people,
  pagination: { page: Number(p.page), pages: Number(p.pages) },
});

export const people = {
  profile: (id: string) => api<Ok<Profile>>(`/user/${id}`).then((r) => r.data),
  followers: (id: string, page: number) =>
    api<Ok<{ followers: PersonSummary[]; pagination: PagePagination }>>(`/user/followers/${id}`, {
      query: pageQuery(page),
    }).then((r) => toPeoplePage(r.data.followers, r.data.pagination)),
  following: (id: string, page: number) =>
    api<Ok<{ following: PersonSummary[]; pagination: PagePagination }>>(`/user/following/${id}`, {
      query: pageQuery(page),
    }).then((r) => toPeoplePage(r.data.following, r.data.pagination)),
  /** Up to 10 people (the API's default) */
  suggestions: () =>
    api<Ok<{ suggestions: PersonSummary[] }>>("/user/suggestions").then((r) => r.data.suggestions),
  follow: (id: string) =>
    api<Ok<{ status: FollowStatus }>>(`/user/follow/${id}`, { method: "POST" }).then((r) => r.data.status),
  unfollow: (id: string) =>
    api<Ok<{ status: FollowStatus }>>(`/user/follow/${id}`, { method: "DELETE" }).then((r) => r.data.status),
  requests: () =>
    api<Ok<{ requests: FollowRequest[] }>>("/user/follow-requests", { query: { limit: 20 } }).then(
      (r) => r.data.requests,
    ),
  respond: (requestId: string, action: "accept" | "reject") =>
    api(`/user/follow-requests/${requestId}/${action}`, { method: "POST" }),
};

// ── Posts ─────────────────────────────────────────────────────────────────
type PostsPage = { posts: Post[]; pagination: { page: number; pages: number } };

export interface PostInput {
  content: string;
  visibility: Visibility;
  image?: File | null;
}

function postForm(input: PostInput) {
  const form = new FormData();
  // The API rejects an empty string, so photo-only posts omit the field
  if (input.content) form.append("content", input.content);
  form.append("visibility", input.visibility);
  form.append("format", input.image ? "IMAGE" : "TEXT");
  if (input.image) form.append("image", input.image, input.image.name);
  return form;
}

export const posts = {
  list: (page: number, authorId?: string) =>
    api<Ok<PostsPage>>("/posts/list", { query: { page, limit: 10, authorId } }).then((r) => r.data),
  saved: (page: number) =>
    api<Ok<{ savedPosts: { post: Post }[]; pagination: { page: number; pages: number } }>>("/posts/saved", {
      query: { page, limit: 10 },
    }).then((r) => ({ posts: r.data.savedPosts.map((s) => s.post), pagination: r.data.pagination })),
  get: (id: string) => api<Ok<{ post: Post }>>(`/posts/get/${id}`).then((r) => r.data.post),
  create: (input: PostInput) =>
    api<Ok<{ post: Post }>>("/posts/create", { method: "POST", body: postForm(input) }).then((r) => r.data.post),
  update: (id: string, body: { content: string; visibility: Visibility }) =>
    api<Ok<{ post: Post }>>(`/posts/update/${id}`, { method: "PUT", body }).then((r) => r.data.post),
  remove: (id: string) => api(`/posts/delete/${id}`, { method: "DELETE" }),
  like: (id: string) => api<Ok<{ post: Post }>>(`/posts/like/${id}`, { method: "POST" }).then((r) => r.data.post),
  unlike: (id: string) => api<Ok<{ post: Post }>>(`/posts/unlike/${id}`, { method: "POST" }).then((r) => r.data.post),
  save: (id: string) => api<Ok<{ post: Post }>>(`/posts/save/${id}`, { method: "POST" }).then((r) => r.data.post),
  unsave: (id: string) => api<Ok<{ post: Post }>>(`/posts/unsave/${id}`, { method: "POST" }).then((r) => r.data.post),
};

// ── Comments ──────────────────────────────────────────────────────────────
export const comments = {
  list: (postId: string, page: number) =>
    api<Ok<{ comments: Comment[]; pagination: { currentPage: number; totalPages: number } }>>(
      `/comments/post/${postId}`,
      { query: { page, limit: 10 } },
    ).then((r) => ({ comments: r.data.comments, pagination: { page: r.data.pagination.currentPage, pages: r.data.pagination.totalPages } })),
  create: (postId: string, content: string) =>
    api<Ok<{ comment: Comment }>>("/comments/create", { method: "POST", body: { postId, content } }).then(
      (r) => r.data.comment,
    ),
  update: (postId: string, commentId: string, content: string) =>
    api<Ok<{ comment: Comment }>>(`/comments/edit/${postId}/${commentId}`, {
      method: "PUT",
      body: { commentId, content },
    }).then((r) => r.data.comment),
  remove: (commentId: string) => api(`/comments/delete/${commentId}`, { method: "DELETE" }),
  like: (commentId: string) =>
    api<Ok<{ comment: Comment }>>("/comments/like", { method: "POST", body: { commentId } }).then((r) => r.data.comment),
  unlike: (commentId: string) =>
    api<Ok<{ comment: Comment }>>("/comments/unlike", { method: "POST", body: { commentId } }).then(
      (r) => r.data.comment,
    ),
};

// ── Notifications ─────────────────────────────────────────────────────────
export const notifications = {
  list: (page: number, unreadOnly: boolean) =>
    api<Ok<{ notifications: AppNotification[]; unreadCount: number; pagination: PagePagination }>>(
      "/notifications/",
      { query: { page, limit: 20, unreadOnly: unreadOnly || undefined } },
    ).then((r) => r.data),
  unreadCount: () =>
    api<Ok<{ unreadCount: number }>>("/notifications/unread-count").then((r) => r.data.unreadCount),
  markRead: (id: string) => api(`/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () => api("/notifications/read-all", { method: "POST" }),
  remove: (id: string) => api(`/notifications/${id}`, { method: "DELETE" }),
};
