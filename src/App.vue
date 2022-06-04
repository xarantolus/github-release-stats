<template>
  <div class="stats-app">
    <h3 class="title is-3 mb-1">GitHub Release Stats</h3>

    <p v-if="showForm()">This page summarizes stats for a GitHub repository. Feel free to <a target="_blank" href="https://github.com/xarantolus/github-release-stats">check it out on GitHub</a>.</p>

    <div class="repo-input mt-4">
      <RepoInput :disabled="!showForm()"  @repo-change="handleRepoChange" :username-suggestions="usernameSuggestions()" @interface="(i) => repoInterface = i" />
    </div>

    <template v-if="releases && releases.length === 0">
      <!-- No releases to show, but everything worked -->
      <p class="mt-5 title is-5 has-text-danger has-text-weight-bold">No releases available for&nbsp;
        <a :href="'https://github.com/' + encodeURI(userName!) + '/' + encodeURI(repoName!)" target="_blank">{{ userName }}/{{ repoName }}</a>.
      </p>
    </template>

    <template v-else-if="releases && releases.length > 0">
      <!-- We have releases we can show, everything worked -->
      <ReleaseSummary class="mt-4" :releases="releases!" :user-name="userName!" :repo-name="repoName!"></ReleaseSummary>
      <div class="mt-4">
        <h4 class="title is-4 pt-4">Releases</h4>
        <ReleaseCard v-for="release in (releases ?? [])" v-bind:key="release.id" :release="release" />
      </div>
    </template>

    <div v-else-if="showForm() && history.length > 0" class="history">
      <!-- No releases to show, so show the history -->
      <hr>
      <h4 class="title is-4 pt-4">History</h4>
      <div v-for="item in history" v-bind:key="item.userName + '/' + item.repoName" class="buttons field has-addons mb-0">
        <a :href="historyURL(item)" @click.prevent="repoInterface?.loadRepo(item.userName, item.repoName)" class="control button is-expanded is-info is-outlined has-text-weight-bold">
          {{ item.userName }}/{{ item.repoName }}
        </a>
        <button class="control button is-danger delete-button" @click.prevent="removeHistoryItem(item)">
          X
        </button>
      </div>

      <button class="button is-expanded is-danger mt-4 delete-button" @click.prevent="removeAllHistory">Clear repository history</button>
    </div>

    <template v-else-if="showForm()">
      <!-- A small example to see how the page works -->
      <p class="mt-4">Not sure what you're looking for?
        <a href="/?user=xarantolus&repo=filtrite" @click.prevent="repoInterface?.loadRepo('xarantolus', 'filtrite')">Click here to try one of my repos</a>.
      </p>
    </template>

    <span class="help" v-if="showForm()">
      If you want to link to releases without showing the input above, you can add the <code>noform</code> URL parameter.
    </span>
    <span class="help" v-else-if="repoName && userName">
      The current page shows stats for {{ userName }}/{{ repoName }}, visit the <a @click.prevent="repoInterface?.reset()" href="/">main page</a> to find stats for other repositories.
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RepoInput, { RepoInputInterface } from '@/components/RepoInput.vue';
import ReleaseCard from '@/components/ReleaseCard.vue';
import ReleaseSummary from '@/components/ReleaseSummary.vue';
import { Release } from '@/models/Release';
import { RepoHistory, RepoHistoryItem } from './models/RepoHistory';
import { RepoInfo } from './models/RepoInfo';

const appTitle = "GitHub Release Stats"

export default defineComponent({
  name: 'App',
  components: {
    RepoInput,
    ReleaseCard,
    ReleaseSummary
  },
  data() {
    return {
      history: RepoHistory.load(),
      releases: null as Array<Release> | null,
      repoName: "" as string | undefined,
      userName: "" as string | undefined,
      repoInterface: null as RepoInputInterface | null
    }
  },
  methods: {
    showForm(): boolean {
      return !window.location.search.includes('noform');
    },
    usernameSuggestions(): Array<string> {
      let users = this.history.map(i => i.userName);

      return [...new Set(users)];
    },
    historyURL(item: RepoHistoryItem): string {
      let ri = new RepoInfo(item.repoName, item.userName);
      return RepoInfo.toURL(ri);
    },
    removeHistoryItem(item: RepoHistoryItem) {
      this.history = RepoHistory.deleteEntry(item);
    },
    removeAllHistory() {
      this.history = RepoHistory.deleteAll();
    },
    handleRepoChange(evt: Array<Release> | null, userName: string | undefined, repoName: string | undefined) {
      this.releases = evt;
      this.userName = userName;
      this.repoName = repoName;

      if (this.$data.userName && this.$data.repoName) {
        this.history = RepoHistory.addEntry({
          lastVisit: new Date(),
          repoName: this.$data.repoName,
          userName: this.$data.userName,
        });

        document.title = `${this.userName}/${this.repoName} | ${appTitle}`;
      } else {
        document.title = appTitle;
      }
    }
  }
});
</script>

<style>
@import "../node_modules/bulma/css/bulma.min.css";
@import "../node_modules/bulma-prefers-dark/css/bulma-prefers-dark.css";

/* ALL color definitions go here */
:root {
  --font-color: #1f2933;
  --border-color: #ccc;
  --green: #00ff55;
  --yellow: #f7ae40;
  --font-color-on-yellow: var(--font-color);
  --blue: #6fcaff;
  --card-color: #fff;
  --card-hover-color: #ddd;
  --button-color: #bbb;
  --red-focus: #b80000;
}

@media (prefers-color-scheme: dark) {
  :root {
    --font-color: #f8e0c8;
    --border-color: #999;
    --green: #158c11;
    --yellow: #df8b1d;
    --font-color-on-yellow: #333;
    --blue: #004770;
    --card-color: #222;
    --card-hover-color: #444;
    --button-color: #333;
    --red-focus: #c70000;
  }

  /* Some additional color fixes */
  .invert-dm {
    filter: invert(1) !important;
  }


  /* Some style fixes for bulma */
  .navbar-link.is-active,
  .navbar-link:focus,
  .navbar-link:focus-within,
  .navbar-link:hover,
  a.navbar-item.is-active,
  a.navbar-item:focus,
  a.navbar-item:focus-within,
  a.navbar-item:hover {
    background-color: var(--button-color);
    color: var(--green);
  }
}

html {
  overflow: hidden;
  height: 100%;
}

body {
  height: 100%;
  overflow: auto;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--font-color);

  margin: 2.5%;
}

.stats-app {
  width: 60%;
  margin: 0 auto;

  padding-top: 2.5%;
}

.repo-input {
  width: 60%;
  margin: 0 auto;
}

.history {
  width: 80%;
  margin: 0 auto;
}

.hidden {
  display: none;
}

.delete-button:focus {
  background-color: var(--red-focus);
}

@media only screen and (max-width: 1024px) {
  .stats-app {
    width: 100%;
    margin: 0 auto;

    padding-top: 5%;
  }

  .repo-input,
  .history {
    width: 100%
  }
}
</style>
