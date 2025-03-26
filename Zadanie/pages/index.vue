<template>
    <div>
        <Panel class="w-1/2 mx-auto mt-10">
            <login />
            <Divider />
            <div class="flex justify-center gap-5">
                <p>Vyplniť prihlášku na tender</p>
                <Button severity="secondary" label="Pokračovať" @click="navigateTo('/MainPage')" />
            </div>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import login from '../components/form/login.vue';
</script>