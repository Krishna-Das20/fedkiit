import { AccessTypes } from "@prisma/client";

import { prisma } from "@/lib/db";
import { body, expressError, handle, json } from "@/lib/api/express";
import { getCurrentUser, isAdmin } from "@/lib/auth/access";
import { uploadImage } from "@/lib/services/upload";

/**
 * POST /api/user/addMember
 * Port of controllers/userController/member/addMember.js — admin only.
 *
 * Creates the account if the email is new, otherwise promotes the existing
 * user to the given access level (the original `createOrUpdateUser` behaviour).
 * Supports both multipart/form-data (with file upload) and application/json.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const admin = await getCurrentUser();
    if (!admin) return expressError(401, "Token is required");
    if (!isAdmin(admin)) return expressError(403, "Unauthorized");

    let email = "";
    let name = "";
    let access = "";
    let year: string | undefined;
    let rollNumber: string | undefined;
    let school: string | undefined;
    let college: string | undefined;
    let contactNo: string | undefined;
    let imgUrl: string | undefined;
    let imageFile: File | null = null;
    let rawExtra: unknown = null;
    const extraObj: Record<string, string> = {};

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      email = String(formData.get("email") || "");
      name = String(formData.get("name") || "");
      access = String(formData.get("access") || "");
      year = (formData.get("year") as string) || undefined;
      rollNumber = (formData.get("rollNumber") as string) || undefined;
      school = (formData.get("school") as string) || undefined;
      college = (formData.get("college") as string) || undefined;
      contactNo = (formData.get("contactNo") as string) || undefined;
      imgUrl = (formData.get("img") as string) || undefined;
      rawExtra = formData.get("extra");

      const file = formData.get("image");
      if (file instanceof File && file.size > 0) {
        imageFile = file;
      }

      for (const field of ["github", "linkedin", "designation", "know", "title"]) {
        const val = formData.get(field);
        if (typeof val === "string" && val.trim()) {
          extraObj[field] = val.trim();
        }
      }
    } else {
      const jsonBody = await body<Record<string, any>>(request);
      email = String(jsonBody.email || "");
      name = String(jsonBody.name || "");
      access = String(jsonBody.access || "");
      year = jsonBody.year || undefined;
      rollNumber = jsonBody.rollNumber || undefined;
      school = jsonBody.school || undefined;
      college = jsonBody.college || undefined;
      contactNo = jsonBody.contactNo || undefined;
      imgUrl = jsonBody.img || undefined;
      rawExtra = jsonBody.extra;

      for (const field of ["github", "linkedin", "designation", "know", "title"]) {
        const val = jsonBody[field];
        if (typeof val === "string" && val.trim()) {
          extraObj[field] = val.trim();
        }
      }
    }

    if (rawExtra) {
      if (typeof rawExtra === "string") {
        try {
          const parsed = JSON.parse(rawExtra);
          if (parsed && typeof parsed === "object") {
            Object.assign(extraObj, parsed);
          }
        } catch {
          // ignore invalid JSON string
        }
      } else if (typeof rawExtra === "object") {
        Object.assign(extraObj, rawExtra);
      }
    }

    const address = email.trim().toLowerCase();
    if (!address || !access.trim()) {
      return expressError(400, "Email and access are required");
    }

    const normalizedAccess = access.trim().toUpperCase().replace(/\s+/g, "_") as AccessTypes;
    if (!Object.values(AccessTypes).includes(normalizedAccess)) {
      return expressError(400, `Invalid access type: ${access}`);
    }

    if (imageFile) {
      const uploadResult = await uploadImage(imageFile, "ProfileImages");
      if (uploadResult?.secure_url) {
        imgUrl = uploadResult.secure_url;
      }
    }

    const extra = {
      github: extraObj.github ?? "",
      linkedin: extraObj.linkedin ?? "",
      designation: extraObj.designation ?? "",
      know: extraObj.know ?? "",
      title: extraObj.title ?? "",
    };

    const existing = await prisma.user.findUnique({
      where: { email: address },
      select: { id: true, extra: true, name: true },
    });

    const trimmedName = name.trim();

    if (existing) {
      const existingExtra =
        existing.extra && typeof existing.extra === "object"
          ? (existing.extra as Record<string, unknown>)
          : {};
      const mergedExtra = {
        ...existingExtra,
        ...extra,
      };

      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          ...(trimmedName ? { name: trimmedName } : {}),
          access: normalizedAccess,
          ...(year ? { year } : {}),
          ...(imgUrl ? { img: imgUrl } : {}),
          ...(rollNumber ? { rollNumber } : {}),
          ...(school ? { school } : {}),
          ...(college ? { college } : {}),
          ...(contactNo ? { contactNo } : {}),
          extra: mergedExtra,
        },
        select: { id: true, email: true, name: true, access: true },
      });

      return json({
        success: true,
        message: "Member updated successfully",
        user: updated,
      });
    }

    // A member added by an admin has no password yet. Store an unusable
    // placeholder rather than an empty string, so bcrypt.compare can never
    // succeed against it — they must use "forgot password" to set one.
    const created = await prisma.user.create({
      data: {
        email: address,
        name: trimmedName || null,
        access: normalizedAccess,
        password: `admin-created:${crypto.randomUUID()}`,
        year: year || null,
        img: imgUrl || null,
        rollNumber: rollNumber || null,
        school: school || null,
        college: college || null,
        contactNo: contactNo || null,
        extra,
        editProfileCount: 5,
        regForm: [],
      },
      select: { id: true, email: true, name: true, access: true },
    });

    return json(
      { success: true, message: "Member added successfully", user: created },
      201,
    );
  });
}
