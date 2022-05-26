<template>
    <form class="form" @submit.prevent="onSubmit()" target="#">
        <div class="field has-addons">
            <div class="control">
                <div class="button is-info">
                    Username
                </div>
            </div>
            <div class="control is-expanded">
                <input class="input" @input="userRepos = []; releases = []" :class="usernameError ? 'is-danger' : ((userRepos.length > 0 && userName.trim()) ? 'is-success' : '')" type="text" @blur.prevent="loadUserRepos()" v-model="userName" placeholder="GitHub username">
            </div>
        </div>

        <div class="field has-addons">
            <div class="control">
                <div class="button is-info">
                    Repository
                </div>
            </div>
            <div class="control is-expanded">
                <input class="input" @input="releases = []" :class="releasesError ? 'is-danger' : ((releases.length > 0 && userName.trim()) ? 'is-success' : '')" @blur.prevent="onSubmit()" v-model="repoName" placeholder="Repository name" list="repo-suggestions" />
                <datalist id="repo-suggestions">
                    <option v-for="repo in userRepos" v-bind:key="repo.id" :value="repo.name" />
                </datalist>
            </div>
        </div>

        <span class="help is-danger" v-if="usernameError">{{ usernameError }}</span>
        <span class="help is-danger mb-1 mt-0" v-if="releasesError">{{ releasesError }}</span>

        <button class="button is-primary" :class="loading ? 'is-loading' : ''" type="submit">Show release stats</button>
    </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RepoInfo } from '@/models/RepoInfo';
import { Repository } from '@/models/Repository';
import { Release } from '@/models/Release';

export default defineComponent({
    name: 'RepoInput',
    emits: ["repo-change"],
    data() {
        return {
            userRepos: [] as Array<Repository>,
            usernameError: "",
            releasesError: "",
            loading: false,
            releases: [] as Array<Release>,
            ...RepoInfo.fromState(window.location.search, window.history.state)
        }
    },
    mounted() {
        // If the username is already filled in, we can directly fetch repo suggestions
        this.loadUserRepos();
        // We can also already submit the form in case all data is filled in
        this.onSubmit();
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
            this.onSubmit()
        },
        async onSubmit() {
            if (!this.$data.userName || !this.$data.repoName || this.loading) {
                return;
            }

            this.loading = true;

            try {
                let repoInfo = new RepoInfo(this.$data.repoName, this.$data.userName);
                await this.loadReleases();
                if (this.$data.releases) {

                    let previousInfo = RepoInfo.fromState(window.location.search, null);
                    if (!RepoInfo.equal(previousInfo, repoInfo)) {
                        console.log("infos not equal")
                        history.pushState(repoInfo, "", RepoInfo.toURL(repoInfo));
                    } else {
                        console.log("info equal")
                    }
                    this.$emit("repo-change", this.$data.releases);
                }
            } finally {
                this.loading = false;
            }

            if (this.$data.usernameError || this.$data.releasesError) {
                this.$emit("repo-change", null);
            }
        },
        async loadReleases() {
            if (!this.userName || !this.repoName) return;

            this.releases = [];
            this.releasesError = "";

            let resp = await fetch(`https://api.github.com/repos/${encodeURI(this.userName)}/${encodeURI(this.repoName)}/releases?per_page=100`);
            if (!resp.ok) {
                this.releasesError = `Invalid status code ${resp.status} while fetching repository release info`;
                return;
            }

            this.releases = await resp.json();
        },
        async loadUserRepos() {
            if (!this.userName) return;

            this.userRepos = [];
            this.usernameError = "";

            let resp = await fetch(`https://api.github.com/users/${encodeURI(this.userName)}/repos?per_page=100`);
            if (!resp.ok) {
                this.usernameError = `Invalid status code ${resp.status} while fetching user info`;
                return;
            }
            this.userRepos = await resp.json();
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

.card-content {
    padding: 1rem !important;
}
</style>
