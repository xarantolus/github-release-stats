<template>
    <form class="form" @submit.prevent="onSubmit()" target="#">
        <div class="field has-addons">
            <div class="control">
                <div class="button is-info">
                    Username
                </div>
            </div>
            <div class="control is-expanded">
                <input autofocus class="input" @input="userRepos = []; releases = []" :class="usernameError ? 'is-danger' : ((userRepos.length > 0 && userName.trim()) ? 'is-success' : '')" type="text" @blur.prevent="loadUserRepos()" v-model="userName" placeholder="GitHub username" list="user-suggestions">
                <datalist id="user-suggestions">
                    <option v-for="user in (usernameSuggestions ?? [])" v-bind:key="user" :value="user" />
                </datalist>
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

        <div class="buttons has-addons is-centered">
            <button tabindex="-1" type="reset" @click.prevent="reset()" v-if="!loading && (userName.trim() || repoName.trim())" class="button is-secondary">Clear</button>
            <button type="reset" v-else class="button is-secondary is-disabled" disabled>Clear</button>

            <button v-if="!userName.trim() || !repoName.trim()" disabled class="button is-primary is-disabled" :class="loading ? 'is-loading' : ''" type="submit">Show release stats</button>
            <button v-else class="button is-primary" :class="loading ? 'is-loading' : ''" type="submit">Show release stats</button>
        </div>
    </form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { RepoInfo } from '@/models/RepoInfo';
import { Repository } from '@/models/Repository';
import { Release } from '@/models/Release';
import ago from 'ts-ago';

export interface RepoInputInterface {
    loadRepo(user: string, name: string): void;
    reset(): void;
}

export default defineComponent({
    name: 'RepoInput',
    emits: ["repo-change", "interface"],
    props: {
        usernameSuggestions: Array as PropType<string[]>,
    },
    data() {
        return {
            userRepos: [] as Array<Repository>,
            usernameError: "",
            releasesError: "",
            loading: false,
            releases: [] as Array<Release>,
            scheduledNextLoad: null as RepoInfo | null,
            ...RepoInfo.fromState(window.location.search, window.history.state),
        }
    },
    async mounted() {
        // Emit our interface to make sure the app component can call this
        this.$emit('interface', {
            loadRepo: this.loadRepo,
            reset: this.reset,
        } as RepoInputInterface)

        // If the username is already filled in, we can directly fetch repo suggestions
        await this.loadUserRepos();
        // We can also already submit the form in case all data is filled in
        await this.onSubmit();
    },
    created() {
        window.onpopstate = this.handlePop;
    },
    methods: {
        async loadRepo(user: string, name: string) {
            this.userName = user;
            this.repoName = name;
            await this.onSubmit();
            this.loadUserRepos();
        },
        handlePop(event: PopStateEvent) {
            let info = RepoInfo.fromState("", event.state);
            if (info.userName && info.repoName) {
                this.$data.repoName = info.repoName;
                this.$data.userName = info.userName;
            }
            this.onSubmit();
        },
        reset() {
            this.userName = this.repoName = "";
            this.userRepos = [];
            this.usernameError = this.releasesError = "";
            history.pushState(null, "", location.protocol + "//" + location.host + location.pathname);
            this.$emit("repo-change", null, null, null);
        },
        async onSubmit() {
            if (!this.$data.userName || !this.$data.repoName) {
                return;
            }
            if (this.loading) {
                this.scheduledNextLoad = new RepoInfo(this.$data.repoName, this.$data.userName);
                return;
            }

            this.loading = true;

            try {
                await this.loadReleases();

                if (this.$data.releases && !this.releasesError) {
                    let repoInfo = new RepoInfo(this.$data.repoName, this.$data.userName);
                    let previousInfo = RepoInfo.fromState(window.location.search, null);
                    if (!RepoInfo.equal(previousInfo, repoInfo)) {
                        history.pushState(repoInfo, "", RepoInfo.toURL(repoInfo));
                    }
                    this.$emit("repo-change", this.$data.releases, repoInfo.userName, repoInfo.repoName);
                }
            } catch (ex) {
                console.error(ex);
            }

            if (this.$data.usernameError || this.$data.releasesError) {
                this.$emit("repo-change", null, null, null);
            }

            // If we're done loading, we can load the next requested repo
            this.loading = false;
            if (this.scheduledNextLoad) {
                let info = this.scheduledNextLoad;
                this.scheduledNextLoad = null;
                this.loadRepo(info.userName, info.repoName);
            }
        },
        async loadReleases() {
            if (!this.userName || !this.repoName) return;

            this.releases = [];
            this.releasesError = "";

            // If we have seen this repository in our list before, we correct the casing of the input
            let knownRepo = this.userRepos
                .find(r => r.owner.login.toUpperCase() == this.userName.toUpperCase() &&
                    r.name.toUpperCase() == this.repoName.toUpperCase());
            if (knownRepo) {
                this.userName = knownRepo.owner.login;
                this.repoName = knownRepo.name;
            }

            let resp = await fetch(`https://api.github.com/repos/${encodeURI(this.userName)}/${encodeURI(this.repoName)}/releases?per_page=100`);
            if (!resp.ok) {
                this.releasesError = this.generateErrorMsg(resp, 'fetching repository release info');
                return;
            }

            this.releases = await resp.json();
        },
        generateErrorMsg(resp: Response, during: string): string {
            let nextTime = resp.headers.get('x-ratelimit-reset');
            if (nextTime && resp.headers.get('x-ratelimit-remaining') == '0') {
                let unixTime = parseInt(nextTime) * 1000;
                let ts = new Date(unixTime);
                let msDiff = Math.abs(+ts - +new Date());
                if (msDiff < 120 * 1000) {
                    return "Rate limit reached while " + during + ", try again in " + msDiff + " seconds";
                }
                return "Rate limit reached while " + during + ", try again " + ago(unixTime);
            }
            return `Invalid status code ${resp.status} while ` + during;
        },
        async loadUserRepos() {
            if (!this.userName) return;

            this.userRepos = [];
            this.usernameError = "";

            let resp = await fetch(`https://api.github.com/users/${encodeURI(this.userName)}/repos?per_page=100`);
            if (!resp.ok) {
                this.usernameError = this.generateErrorMsg(resp, 'fetching user info');
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
</style>
