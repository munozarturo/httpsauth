<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

interface SignOutResponse {
    message: string;
}

const signOut = async () => {
    try {
        await $fetch<SignOutResponse>("/api/auth/signout", {
            method: "POST",
        });

        router.push("/");
    } catch (error: any) {
        console.error(error);
    }
};

onMounted(() => {
    signOut();
});
</script>