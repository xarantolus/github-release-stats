<template>
  <RepoInput @repo-change="handleRepoChange" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RepoInput from '@/components/RepoInput.vue';
import { RepoInfo } from '@/models/RepoInfo';

export default defineComponent({
  name: 'App',
  components: {
    RepoInput
  },
  methods: {
    handleRepoChange(evt: RepoInfo) {
      console.log(evt);
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
</style>
