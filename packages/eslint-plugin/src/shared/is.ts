import type { Program, Type } from "typescript"
import { typeMatchesSpecifier } from "@typescript-eslint/type-utils"
import { PACKAGE_NAME } from "@/shared/constants"

const isType = {
  scope: (type: Type, program: Program) =>
    typeMatchesSpecifier(type, { from: "package", package: PACKAGE_NAME.CORE, name: "Scope" }, program),
}

export { isType }
