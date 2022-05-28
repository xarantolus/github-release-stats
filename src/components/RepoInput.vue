<template>
    <form class="form" @submit.prevent="onSubmit()" target="#">
        <div class="field has-addons">
            <div class="control">
                <div class="button is-info input-label">
                    Username
                </div>
            </div>
            <div class="control is-expanded">
                <input autofocus class="input" @input="userRepos = []" :class="usernameError ? 'is-danger' : ''" type="text" @blur.prevent="loadUserRepos()" v-model="userName" placeholder="GitHub username" list="user-suggestions">
                <datalist id="user-suggestions">
                    <option v-for="user in (usernameSuggestions ?? [])" v-bind:key="user" :value="user" />
                </datalist>
            </div>
        </div>

        <div class="field has-addons">
            <div class="control">
                <div class="button is-info input-label">
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

        <span class="help is-danger mb-1 " v-if="usernameError">{{ usernameError }}</span>

        <div class="buttons has-addons is-centered">
            <button tabindex="-1" type="reset" @click.prevent="reset()" v-if="userName.trim() || repoName.trim()" class="button is-secondary">Clear</button>
            <button type="reset" v-else class="button is-secondary is-disabled" disabled>Clear</button>

            <button v-if="!userName.trim() || !repoName.trim()" disabled class="button is-primary is-disabled" :class="loading ? 'is-loading' : ''" type="submit">Show release stats</button>
            <button v-else class="button is-primary" :class="loading ? 'is-loading' : ''" type="submit">Show release stats</button>
        </div>
    </form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Repository } from '@/models/Repository';
import { generateFetchErrorMessage } from '@/util/fetch';

export default defineComponent({
    name: 'RepoInput',
    emits: ["submit"],
    props: {
        usernameSuggestions: Array as PropType<string[]>,
        initialUserName: String,
        initialRepoName: String,
        loading: Boolean,
    },
    data() {
        return {
            userName: this.initialUserName ?? "",
            repoName: this.initialRepoName ?? "",

            // Additional state after we loaded user info
            userRepos: [] as Array<Repository>,
            usernameError: "",
        }
    },
    async mounted() {
        // If the username is already filled in, we can directly fetch repo suggestions
        await this.loadUserRepos();
        // We can also already submit the form in case all data is filled in
        await this.onSubmit();
    },
    methods: {
        reset() {
            this.userName = this.repoName = "";
            this.userRepos = [];
            this.usernameError = "";
        },
        async onSubmit() {
            if (!this.$data.userName || !this.$data.repoName) {
                return;
            }

            // Correct the casing of the repository in case we know it
            let knownRepo = this.userRepos
                .find(r => r.owner.login.toUpperCase() == this.userName.toUpperCase() &&
                    r.name.toUpperCase() == this.repoName.toUpperCase());
            if (knownRepo) {
                this.userName = knownRepo.owner.login;
                this.repoName = knownRepo.name;
            }

            this.$emit("submit", this.$data.userName, this.$data.repoName);
        },
        async loadUserRepos() {
            if (!this.userName) return;

            this.userRepos = [];
            this.usernameError = "";

            let resp = await fetch(`https://api.github.com/users/${encodeURI(this.userName)}/repos?per_page=100`);
            if (!resp.ok) {
                this.usernameError = generateFetchErrorMessage(resp, 'fetching user info');
                return;
            }
            this.userRepos = await resp.json();

            // If we find a repo owned by this user in these repositories, we correct the casing of the username
            let repoByUser = this.userRepos.find(r => r.owner.login.toUpperCase() == this.userName.toUpperCase())
            if (repoByUser) {
                this.userName = repoByUser.owner.login;
            }
        }
    }
});
</script>

<style>
.card-content {
    padding: 1rem !important;
}

.input-label {
    width: 120px;
}

@media only screen and (max-width: 1024px) {
    .input-label {
        width: 100px;
    }
}
</style>
