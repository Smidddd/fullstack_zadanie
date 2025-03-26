<template>
    <div>
        <h1 class="text-center text-2xl">Administrator Login</h1>
        <Form :initialValues="initialValues" @submit="login()"
            class="flex justify-center flex-col gap-4 w-1/4 mx-auto mt-10">
            <div class="flex flex-col gap-1 min-w-1/4">
                <InputText v-model="form.email" name="email" type="text" placeholder="Email" />
            </div>
            <div class="flex flex-col gap-1">
                <InputText v-model="form.password" name="password" type="password" placeholder="Password" />
            </div>
            <Button type="submit" severity="secondary" label="Login" />
        </Form>
    </div>
</template>

<script setup lang="ts">
const { $directus } = useNuxtApp();

const toast = useToast();

const initialValues = {
    email: '',
    password: '',
};

let form = reactive({
    email: '',
    password: '',
});

async function login() {
    const token = await $directus.login(form.email, form.password)
        .then(() => {

            navigateTo('/MainPage')
            toast.add({ severity: 'success', summary: 'Success', detail: "Logged in", life: 3000 });
        }
        )
        .catch((e) => {
            toast.add({ severity: 'error', summary: 'Error', detail: "Bad credentials", life: 3000 });
        });
}




</script>