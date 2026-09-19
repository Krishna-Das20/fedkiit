import { prisma } from "@/lib/db";
import { handle, json } from "@/lib/api/express";
import { canManageBlogs, getCurrentUser } from "@/lib/auth/access";

/**
 * GET /api/blog/getBlog
 *
 * Serves public blog listings. Unauthenticated or non-admin callers receive
 * only approved, public blog posts. Editors and admins receive all posts to manage drafts.
 */
export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser();
    const canManage = user ? canManageBlogs(user) : false;

    const blogs = canManage
      ? await prisma.blog.findMany()
      : await prisma.blog.findMany({
          where: {
            NOT: { visibility: "private" },
            approval: { not: false },
          },
        });

    return json({
      success: true,
      message: "All blogs fetched successfully",
      blogs,
    });
  });
}
