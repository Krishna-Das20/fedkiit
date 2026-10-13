/** Who wrote a post. Older rows say `dept` where newer ones say `department`. */
export type BlogAuthor = {
  name: string;
  department: string;
  dept?: string;
};

/**
 * A blog post as the blogs API returns it. Posts from the old admin form use
 * blog-prefixed names (blogTitle, blogImage…), and `author` may arrive as JSON
 * text, a plain name or an object, so every field is optional.
 */
export type BlogPost = {
  id?: string;
  _id?: string;
  title?: string;
  blogTitle?: string;
  desc?: string;
  blogContent?: string;
  blogSubtitle?: string;
  subtitle?: string;
  tags?: string[];
  isFeatured?: boolean;
  isCommentEnabled?: boolean;
  image?: string;
  blogImage?: string;
  date?: string;
  blogDate?: string;
  author?: string | Partial<BlogAuthor> | null;
  blogAuthor?: string | Partial<BlogAuthor> | null;
  authorDepartment?: string;
  authorDetails?: string | { department?: string; dept?: string } | null;
  summary?: string;
  metaDescription?: string;
  blogLink?: string;
  mediumLink?: string;
  visibility?: string;
  approval?: boolean | string;
  readTime?: string | number;
  likes?: number;
  comments?: unknown[] | number;
  blurhash?: string;
};

/** A post as the blog pages normalise it after fetching. */
export type ListedBlog = BlogPost & {
  title: string;
  desc: string;
  image: string;
  date: string;
  author: string | Partial<BlogAuthor>;
  blogLink: string;
  visibility: "public" | "private";
  approval: boolean;
  summary: string;
  likes: number;
  comments: unknown[] | number;
  readTime: string | number;
};
