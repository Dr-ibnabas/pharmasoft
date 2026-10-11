import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  jsonOk,
  handleApiError,
  parseBody,
  requireResource,
  ApiError,
} from "@/lib/api-helpers";
import { userCreateSchema } from "@/lib/validations/user";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? "10", 10);

// GET /api/users — Liste (SUPER_ADMIN ou TITULAIRE)
export async function GET() {
  try {
    await requireResource("users");
    const users = await prisma.user.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locale: true,
        avatarColor: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    return jsonOk({ items: users });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/users — Création
export async function POST(req: Request) {
  try {
    const session = await requireResource("users");
    const data = await parseBody(req, userCreateSchema);

    // Seul SUPER_ADMIN peut créer un autre SUPER_ADMIN ou TITULAIRE
    if (
      (data.role === "SUPER_ADMIN" || data.role === "TITULAIRE") &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      throw new ApiError(403, "Seul un Super Admin peut créer un compte Super Admin ou Titulaire");
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ApiError(400, "Cet email est déjà utilisé");

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const created = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        hashedPassword,
        role: data.role,
        locale: data.locale,
        avatarColor: data.avatarColor,
        isActive: true,
      },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "User",
        resourceId: created.id,
        details: { email: created.email, role: created.role },
      },
    });

    return jsonOk(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
