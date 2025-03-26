<template>
    <div class="card">
        <Menubar v-if="loggedIn" :model="logout" />
        <Menubar v-if="!loggedIn" :model="back" />
    </div>
    <DataTable id="tenders" :value="tenders" v-model:selection="currentTender"
        v-on:row-click="detailVisible = true; loadCurrentTender()">
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
        <label for="nazov">Názov dodávateľa</label>

    </Dialog>
</template>


<script setup lang="ts">
const { $directus, $readItems, $createItem, $updateItem, $deleteItem } = useNuxtApp()
const toast = useToast()
const confirm = useConfirm()

const editVisible = ref(false)
const addVisible = ref(false)
const detailVisible = ref(false)

let tenders: Ref<Tender[]> = ref([])
await loadTenders()
let loggedIn = false
let currentTenderId: number | null = null

let currentTender: Tender | null = null


interface Tender {
    id: number
    nazov: string
    datOd: Date
    datDo: Date
    maxCas: string
    maxCena: string
    stav: string
}

interface Form {
    nazovDod: string
    ico: number
    casVypr: number
    cenaVypr: number
    tenderId: number
}

const form = ref({
    nazovDod: '',
    ico: '',
    casVypr: '',
    cenaVypr: '',
    tenderId: '',
})

let tender = ref({
    nazov: '',
    datOd: new Date(),
    datDo: new Date(),
    maxCas: '',
    maxCena: '',
    stav: '',
})



const logout = ref([
    {
        label: 'Log out',
        icon: 'pi pi-fw pi-power-off',
        command: () => {
            $directus.logout()
            loggedIn = false
            navigateTo('/')
        },
    }
])

const back = ref([
    {
        label: 'Leave',
        icon: 'pi pi-fw pi-arrow-left',
        command: () => {
            navigateTo('/')
        },
    }
])

const confirmDelete = () => {
    confirm.require({
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
            deleteTender()
            toast.add({ severity: 'success', summary: 'Success', detail: 'Tender deleted', life: 3000 })
        },
        reject: () => {
            toast.add({ severity: 'info', summary: 'Info', detail: 'Deletion cancelled', life: 3000 })
        }
    })

}


try {
    const token = await $directus.getToken()
    if (token != null) {
        loggedIn = true
    } else {
        loggedIn = false
    }

} catch (e) {
    loggedIn = false
}

async function loadTenders() {
    try {
        const data = await $directus.request<Tender[]>(
            $readItems('tenders', {
                fields: ['*'],
            })
        )
        tenders.value = data
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenders', life: 3000 })
        return []
    }
}

async function createForm() {
    await $directus.request($createItem('forms', {
        nazov_dodavatela: form.value.nazovDod,
        ico: form.value.ico,
        cas_vypracovania: form.value.casVypr,
        cena_vypracovania: form.value.cenaVypr,
        tender: currentTenderId
    }))

    toast.add({ severity: 'success', summary: 'Success', detail: 'Form created', life: 3000 })
    addVisible.value = false
    currentTenderId = null

    await loadTenders()
}

async function editTender() {
    await $directus.request($updateItem('tenders', String(currentTenderId), {
        nazov: tender.value.nazov,
        datum_trvania_od: tender.value.datOd,
        datum_trvania_do: tender.value.datDo,
        max_cas_vypracovania: tender.value.maxCas,
        max_cena: tender.value.maxCena,
        stav: tender.value.stav
    }))

    toast.add({ severity: 'success', summary: 'Success', detail: 'Tender updated', life: 3000 })
    editVisible.value = false
    currentTenderId = null
    currentTender = null

    await loadTenders()
}

async function loadCurrentTender() {
    currentTender = await $directus.request<Tender>(
        $readItems('tenders', {
            fields: ['*'],
            filter: {
                id: {
                    _eq: currentTenderId,
                },
            },
        })
    )
    tender.value.nazov = currentTender.nazov
    tender.value.datOd = currentTender.datOd
    tender.value.datDo = currentTender.datDo
    tender.value.maxCas = currentTender.maxCas
    tender.value.maxCena = currentTender.maxCas
    tender.value.stav = currentTender.stav

}

async function deleteTender() {
    await $directus.request($deleteItem('tenders', String(currentTenderId)))

    toast.add({ severity: 'success', summary: 'Success', detail: 'Tender deleted', life: 3000 })
    currentTenderId = null
    currentTender = null

    await loadTenders()
}


</script>