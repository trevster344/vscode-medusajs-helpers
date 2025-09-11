<template>
    <div class="flex">
        <div class="flex-col mt-4">
            <input class="p-4" id="searchBox" @keyup.enter="get_query_results" v-model="query_term" type="text"
                placeholder="Search..." />
        </div>
        <div class="flex-col mt-4">
            <button @click="get_query_results" class="p-4 ms-4 bg-blue-500 text-white rounded">Search</button>
        </div>
    </div>

    <div class="mt-4">
        <pre><code class="language-typescript" v-html="type_results"></code></pre>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import 'prismjs/themes/prism-tomorrow.css';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';

let vscode;

const query_term = ref('');
const type_results = ref('');

const handlers = {
    search: (payload) => {
        query_term.value = payload.query || '';
        if (payload?.result?.length) {
            type_results.value = Prism.highlight(payload?.result, Prism.languages.typescript, 'typescript');
        }
    },
};

const get_query_results = () => {
    vscode.postMessage({
        type: 'search',
        payload: { query: query_term.value }
    });
}

window.addEventListener("message", (event) => {
    const { type, payload } = event.data;
    if (handlers?.[type]) handlers[type ?? "none"]?.(payload ?? {});
});

onMounted(() => {
    // @ts-ignore
    vscode = acquireVsCodeApi();
});

</script>