<template>
    <form class="form" @submit.prevent="onSubmit" target="#">
        <div class="field has-addons">
            <div class="control">
                <div class="button is-info">
                    Username
                </div>
            </div>
            <div class="control is-expanded">
                <input class="input" :class="error ? 'is-danger' : (userRepos.length > 0 ? 'is-success' : '')" type="text" @blur.prevent="loadUserRepos()" v-model="userName" placeholder="GitHub username">
            </div>
        </div>

        <div class="field has-addons">
            <div class="control">
                <div class="button is-info">
                    Repository
                </div>
            </div>
            <div class="control is-expanded">
                <input class="input" @blur.prevent="onSubmit()" v-model="repoName" placeholder="Repository name" list="repo-suggestions" />
                <datalist id="repo-suggestions">
                    <option v-for="repo in userRepos" v-bind:key="repo.id" :value="repo.name" />
                </datalist>
            </div>
        </div>

        <span class="help is-danger" v-if="error">{{ error }}</span>
        <button class="button is-primary" type="submit">Show release stats</button>
    </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RepoInfo } from '@/models/RepoInfo';
import { Repository } from '@/models/Repository';

export default defineComponent({
    name: 'RepoInput',
    emits: ["repo-change"],
    components: {

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
            if (!this.$data.userName || !this.$data.repoName) {
                return;
            }
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
