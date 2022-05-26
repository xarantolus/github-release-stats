<template>
  <div class="stats-app">
    <h3 class="title is-3">GitHub Release Stats</h3>
    <RepoInput @repo-change="handleRepoChange" />

    <div class="pt-4">
      <ReleaseCard v-for="release in (releases ?? [])" v-bind:key="release.id" :release="release" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RepoInput from '@/components/RepoInput.vue';
import ReleaseCard from './components/ReleaseCard.vue';
import { Release } from './models/Release';

export default defineComponent({
  name: 'App',
  components: {
    RepoInput,
    ReleaseCard
  },
  data() {
    return {
      releases: null as Array<Release> | null
    }
  },
  methods: {
    handleRepoChange(evt: Array<Release>) {
      this.releases = evt;
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
}

.stats-app {
  width: 60%;
  margin: 0 auto;

  padding-top: 2.5%;
}

@media only screen and (max-width: 1024px) {
  .stats-app {
    width: 100%;
    margin: 0 auto;

    padding-top: 5%;
  }

}
</style>
