<template>
    <div>
        <h1 class="text-center text-2xl">Administrator Login</h1>
        <Form @submit="login()" class="flex justify-center flex-col gap-4 w-1/4 mx-auto mt-10">
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

<script lang="ts">

export default defineNuxtComponent({
    setup() {
        return {
            toast: useToast(),
            directus: useNuxtApp().$directus,
            form: ref({
                email: '',
                password: '',
            }),

        };
    },
    methods: {
        async login() {
            const token = await this.directus.login(this.form.email, this.form.password)
                .then(() => {
                    navigateTo('/MainPage')
                    this.toast.add({ severity: 'success', summary: 'Success', detail: "Logged in", life: 3000 });
                })
                .catch((e) => {
                    this.toast.add({ severity: 'error', summary: 'Error', detail: "Bad credentials", life: 3000 });
                });
        },
    }
});

</script>