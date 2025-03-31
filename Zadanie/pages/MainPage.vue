<template>
    <div class="card">
        <Menubar v-if="loggedIn" :model="logout" />
        <Menubar v-if="!loggedIn" :model="back" />
    </div>
    <DataTable id="tenders" :value="tenders" v-model:selection="currentTenderId" dataKey="id"
        v-on:row-click="(event) => handleRowClick(event.data)">
        <Column field="nazov" header="Názov"></Column>
        <Column field="datum_trvania_od" header="Dátum trvania od"></Column>
        <Column field="datum_trvania_do" header="Dátum trvania do"></Column>
        <Column field="max_cas_vypracovania" header="Maximálny čas na vypracovanie"></Column>
        <Column field="max_cena" header="Maximálna cena"></Column>
        <Column field="stav" header="Stav"></Column>
        <Column v-if="loggedIn" class="w-24 !text-end" header="Admin">
            <template #body="{ data }">
                <Button icon="pi pi-fw pi-pencil"
                    @click="editVisible = true; currentTenderId = data.id; loadCurrentTender()" />
                <Button icon="pi pi-fw pi-trash" severity="danger"
                    @click="currentTenderId = data.id; confirmDelete()" />
            </template>
        </Column>
        <Column v-if="!loggedIn" header="" class="w-24 !text-end">
            <template #body="{ data }">
                <Button icon="pi pi-fw pi-pencil" label="Pridať"
                    @click="addVisible = true; currentTenderId = data.id" />
            </template>
        </Column>
    </DataTable>
    <Dialog v-model:visible="editVisible" modal header="Edit Tender" :style="{ width: '50vw' }">
        <span class="text-surface-500 dark:text-surface-400 block mb-8">Update data.</span>
        <div class="flex items-center gap-4 mb-4">
            <label for="nazov" class="font-semibold w-24">Názov</label>
            <InputText v-model="tender.nazov" id="nazov" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="datum_trvania_od" class="font-semibold w-24">Dátum trvania od</label>
            <DatePicker v-model="tender.datOd" id="datum_trvania_od" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="datum_trvania_do" class="font-semibold w-24">Dátum trvania do</label>
            <DatePicker v-model="tender.datDo" id="datum_trvania_od" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="max_cas_vypracovania" class="font-semibold w-24">Maximálny čas na vypracovanie</label>
            <InputText v-model="tender.maxCas" id="max_cas_vypracovania" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="max_cena" class="font-semibold w-24">Maximálna cena</label>
            <InputText v-model="tender.maxCena" id="max_cena" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="stav" class="font-semibold w-24">Email</label>
            <InputText v-model="tender.stav" id="stav" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="editVisible = false"></Button>
            <Button type="button" label="Save" @click="editVisible = false; editTender()"></Button>
        </div>
    </Dialog>
    <Dialog v-model:visible="addVisible" modal header="Fill out application" :style="{ width: '50vw' }">
        <span class="text-surface-500 dark:text-surface-400 block mb-8">Make sure your data is correct.</span>
        <div class="flex items-center gap-4 mb-4">
            <label for="nazov_dodavatela" class="font-semibold w-24">Názov dodávateľa</label>
            <InputText v-model="form.nazovDod" id="nazov_dodavatela" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="ico" class="font-semibold w-24">IČO</label>
            <InputText v-model="form.ico" id="ico" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="cas_vypracovania" class="font-semibold w-24">Čas vypracovania (dni)</label>
            <InputText v-model="form.casVypr" id="cas_vypracovania" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="cena_vypracovania" class="font-semibold w-24">Cena vypracovania (EUR)</label>
            <InputText v-model="form.cenaVypr" id="cena_vypracovania" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary"
                @click="addVisible = false; currentTenderId = null"></Button>
            <Button type="button" label="Save" @click="addVisible = false; createForm()"></Button>
        </div>
    </Dialog>
    <Dialog v-model:visible="detailVisible" modal header="Tender details" :style="{ width: '50vw' }">
        <div class="flex items-center gap-4 mb-4">
            <label for="nazov">Názov dodávateľa: </label>
            <p>{{ currentTender!.nazov }}</p>
        </div>
        <div class="flex items-center gap-4 mb-4">
            <label for="nazov">Dátum trvania od: </label>
            <p>{{ currentTender!.datum_trvania_od }}</p>
        </div>
        <div class="flex items-center gap-4 mb-4">
            <label for="nazov">Dátum trvania do: </label>
            <p>{{ currentTender!.datum_trvania_do }}</p>
        </div>
        <div class="flex items-center gap-4 mb-4">
            <label for="nazov">Maximálny čas vypracovania (dni): </label>
            <p>{{ currentTender!.max_cas_vypracovania }}</p>
        </div>
        <div class="flex items-center gap-4 mb-4">
            <label for="nazov">Maximálna cena: </label>
            <p>{{ currentTender!.max_cena }}</p>
        </div>
        <label for="forms">Prihlášky: </label>
        <DataTable id="forms" :value="forms">
            <Column field="nazov_dodavatela" header="Názov dodávateľa"></Column>
            <Column field="ico" header="IČO"></Column>
            <Column field="cas_vypracovania" header="Čas vypracovania (dni)"></Column>
            <Column field="cena_vypracovania" header="Cena vypracovania (EUR)"></Column>
        </DataTable>

    </Dialog>
</template>


<script lang="ts">

import type { Tender } from '../types/Tender'
import type { Form } from '../types/Form'
import { createItem, deleteItem, readItems, updateItem } from '@directus/sdk'

export default defineNuxtComponent({
    setup() {
        const loggedIn = ref(false)
        const directus = useNuxtApp().$directus
        return {
            directus,
            toast: useToast(),
            confirm: useConfirm(),
            loggedIn,
            editVisible: ref(false),
            addVisible: ref(false),
            detailVisible: ref(false),
            tenders: ref<Tender[]>([]),
            forms: ref<Form[]>([]),

            currentTenderId: ref<number | null>(null),
            currentTender: ref<Tender | null>(null),
            form: ref({
                nazovDod: '',
                ico: '',
                casVypr: '',
                cenaVypr: '',
                tenderId: ''
            }),
            tender: ref({
                nazov: '',
                datOd: new Date(),
                datDo: new Date(),
                maxCas: '',
                maxCena: '',
                stav: ''
            }),
            logout: ref([
                {
                    label: 'Log out',
                    icon: 'pi pi-fw pi-power-off',
                    command: () => {
                        directus.logout()
                        loggedIn.value = false
                        navigateTo('/')
                    },
                }
            ]),
            back: ref([
                {
                    label: 'Leave',
                    icon: 'pi pi-fw pi-arrow-left',
                    command: () => {
                        navigateTo('/')
                    },
                }
            ]),

        }
    },
    mounted() {
        this.checkLogin()
        this.loadTenders()
    },
    methods: {
        async checkLogin() {
            const token = await this.directus.getToken()
            if (token) {
                this.loggedIn = true
            } else {
                this.loggedIn = false
            }
        },
        async confirmDelete() {
            this.confirm.require({
                message: 'Are you sure you want to delete this tender?',
                header: 'Delete tender ?',
                icon: 'pi pi-exclamation-triangle',
                rejectProps: {
                    label: 'Cancel',
                    severity: 'secondary',
                    outlined: true
                },
                acceptProps: {
                    label: 'Yes',
                    severity: 'danger'
                },
                accept: () => {
                    this.deleteTender()
                    this.toast.add({ severity: 'success', summary: 'Success', detail: 'Tender deleted', life: 3000 })
                },
                reject: () => {
                    this.toast.add({ severity: 'info', summary: 'Info', detail: 'Deletion cancelled', life: 3000 })
                }
            })
        },
        async handleRowClick(rowData: Tender) {
            this.currentTenderId = rowData.id
            await this.loadCurrentTender();
            await this.loadForms();
            this.detailVisible = true;
        },
        async loadForms() {
            const data = await this.directus.request<Form[]>(
                readItems("forms", {
                    fields: ['*'],
                    filter: {
                        tender: {
                            _eq: this.currentTenderId,
                        },
                    },
                })
            )
            this.forms = data
        },
        async loadTenders() {
            try {
                const data = await this.directus.request<Tender[]>(
                    readItems('tenders', {
                        fields: ['*'],
                    })
                )
                this.tenders = data
            } catch (e) {
                this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenders', life: 3000 })
                return []
            }
        },
        async createForm() {
            await this.directus.request(createItem('forms', {
                nazov_dodavatela: this.form.nazovDod,
                ico: this.form.ico,
                cas_vypracovania: this.form.casVypr,
                cena_vypracovania: this.form.cenaVypr,
                tender: this.currentTenderId
            }))

            this.toast.add({ severity: 'success', summary: 'Success', detail: 'Form created', life: 3000 })
            this.addVisible = false
            this.currentTenderId = null

            await this.loadTenders()
        },
        async editTender() {
            await this.directus.request(updateItem('tenders', String(this.currentTenderId), {
                nazov: this.tender.nazov,
                datum_trvania_od: this.tender.datOd,
                datum_trvania_do: this.tender.datDo,
                max_cas_vypracovania: this.tender.maxCas,
                max_cena: this.tender.maxCena,
                stav: this.tender.stav
            }))

            this.toast.add({ severity: 'success', summary: 'Success', detail: 'Tender updated', life: 3000 })
            this.editVisible = false
            this.currentTenderId = null
            this.currentTender = null

            await this.loadTenders()
        },
        async loadCurrentTender() {
            const result = await this.directus.request<Tender[]>(
                readItems("tenders", {
                    fields: ['*'],
                    filter: {
                        id: {
                            _eq: this.currentTenderId,
                        },
                    },
                })
            )
            this.currentTender = {
                id: result[0].id,
                nazov: result[0].nazov,
                datum_trvania_od: result[0].datum_trvania_od,
                datum_trvania_do: result[0].datum_trvania_do,
                max_cas_vypracovania: result[0].max_cas_vypracovania,
                max_cena: result[0].max_cena,
                stav: result[0].stav,
            }

            this.tender.nazov = this.currentTender.nazov
            this.tender.datDo = new Date(this.currentTender.datum_trvania_do)
            this.tender.datOd = new Date(this.currentTender.datum_trvania_od)
            this.tender.maxCas = this.currentTender.max_cas_vypracovania
            this.tender.maxCena = this.currentTender.max_cena
            this.tender.stav = this.currentTender.stav
        },
        async deleteTender() {
            await this.directus.request(deleteItem('tenders', String(this.currentTenderId)))

            this.toast.add({ severity: 'success', summary: 'Success', detail: 'Tender deleted', life: 3000 })
            this.currentTenderId = null
            this.currentTender = null

            await this.loadTenders()
        }
    }
})
</script>