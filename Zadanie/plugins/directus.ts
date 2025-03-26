import { createDirectus, rest, login, refresh, logout, readItem, readItems, withToken, authentication, type AuthenticationData, createItem, updateItem, deleteItem } from '@directus/sdk';

class LocalStorage {
    get() {
        return JSON.parse(localStorage.getItem('digital.okto.zadanie.app') ?? '{}')
    }
    set(data: AuthenticationData | null) {
        localStorage.setItem('digital.okto.zadanie.app', JSON.stringify(data))
    }
}

export default defineNuxtPlugin(() => {
    const directus = createDirectus('http://localhost:8055')
        .with(rest())
        .with(authentication('json', { storage: new LocalStorage }));

    return {
        provide: { directus, readItems, readItem, login, refresh, logout, withToken, createItem, updateItem, deleteItem },
    };
});

