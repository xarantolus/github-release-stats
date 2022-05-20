<template>
    <div>
        <input class="input" @blur.prevent="loadUserRepos()" v-model="userName" placeholder="GitHub username" />
        <span class="help" v-if="error">{{ error }}</span>


        <autocomplete :disabled="userName.trim().length === 0" :permitArbitraryValues="true" @blur.prevent="onSubmit()" class="input" v-model="repoName" :items="userRepos" returned="name" displayed="name" placeholder="Repository" />



    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import autocomplete from 'vue-autocomplete-input-tag';
import { RepoInfo } from '@/models/RepoInfo';
import { Repository } from '@/models/Repository';

export default defineComponent({
    name: 'RepoInput',
    emits: ["repo-change"],
    components: {
        autocomplete
    },
    data() {
        return {
            userRepos: [] as Array<Repository>,
            error: "",
            ...RepoInfo.fromState(window.location.search, window.history.state)
        }
    },
    mounted() {
        this.loadUserRepos()
    },
    created() {
        window.onpopstate = this.handlePop;
    },
    methods: {
        handlePop(event: PopStateEvent) {
            let info = RepoInfo.fromState("", event.state);
            if (info.userName && info.repoName) {
                this.$data.repoName = info.repoName;
                this.$data.userName = info.userName;
            }
        },
        onSubmit() {
            let repoInfo = new RepoInfo(this.$data.repoName, this.$data.userName);
            this.$emit("repo-change", repoInfo);

            history.pushState(repoInfo, "", RepoInfo.toURL(repoInfo));
        },
        async loadUserRepos() {
            if (!this.userName) return;

            this.userRepos = [];
            let resp = await fetch(`https://api.github.com/users/${encodeURI(this.userName)}/repos?per_page=100`);
            if (!resp.ok) {
                this.error = `Invalid status code ${resp.status} while fetching user info`;
                return;
            }
            this.userRepos = await resp.json();
            this.error = "";
        }
    }
});
</script>

<style>
.vue-autocomplete-input-tag-items {
    border: 1px solid var(--border-color);
    max-height: 50%;
    width: 100%;
    background-color: var(--card-color);
    border-radius: 8px;
    overflow: auto;
}

.vue-autocomplete-input-tag-item {
    padding: 6px 16px;
    color: var(--font-color);
    max-width: 100%;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
}

.vue-autocomplete-input-tag-item:hover {
    background-color: var(--card-hover-color);
}
</style>
