import { type AuthContext } from "~/server/middleware/auth";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        context: null as AuthContext,
    }),
    actions: {
        setAuthContext(context: AuthContext) {
            this.context = context;
        },
    },
});
