<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const signOut = async () => {
    try {
        await $fetch("/api/auth/signout", {
            method: "POST",
        });

        router.push("/");
    } catch (error: any) {
        console.error(error);

        router.push("/");
    }
};

onMounted(() => {
    signOut();
});
</script>