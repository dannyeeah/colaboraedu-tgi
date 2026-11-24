import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

export const ac = createAccessControl({
  ...defaultStatements,
});

// Estudante
export const student = ac.newRole({
  ...userAc.statements,
});

// Professor
export const teacher = ac.newRole({
  ...userAc.statements,
});

// Superadministrador
export const superadmin = ac.newRole({
  ...adminAc.statements,
});