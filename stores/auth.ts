import { type AuthContext } from "~/server/middleware/auth";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        context: null as AuthContext,
    }),
    getters: {
        isAuthenticated: (state) => !!state.context,
    },
    actions: {
        setAuthContext(context: AuthContext) {
            this.context = context;
        },
    },
});
