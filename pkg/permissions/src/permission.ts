import { z } from "zod"


const action = z.enum(["read", "write"])
export type Action = z.infer<typeof action>
const resource = z.enum(["checks", "endpoints", "teams"])
export type Resource = z.infer<typeof resource>

const statement = z.object({
    actions: z.array(action),
    resource
})
export type Statement = z.infer<typeof statement>

export type PermissionRequest = {
    resource: Resource
    action: Action
}


export class Permission {
    public readonly statements: Statement[]


    constructor(statements: Statement[]) {
        this.statements = statements
    }


    public verify(req: PermissionRequest): boolean {
        for (const s of this.statements) {
            if (s.resource === req.resource && s.actions.includes(req.action)) {
                return true
            }
        }

        return false
    }

    static from(statements: unknown): Permission {
        const r = z.array(statement).safeParse(statements)
        if (!r.success) {
            throw new Error(`unable to parse statements: ${r.error}`)
        }
        return new Permission(r.data)
    }



}
