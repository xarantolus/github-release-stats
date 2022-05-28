<template>
    <div class="card">
        <header class="card-header">
            <span class="card-header-title title is-5">
                Summary for&nbsp;
                <a :href="'https://github.com/' + encodeURI(userName) + '/' + encodeURI(repoName)" target="_blank">{{ userName }}/{{ repoName }}</a>
            </span>
        </header>
        <div class="card-content">
            <div class="content has-text-left">
                <ul class="mt-1">
                    <li>
                        {{ releases.length == 1 ? 'One release' : (releases.length + ' releases') }} loaded
                    </li>
                    <li v-if="releases.some(r => r.assets.length > 0)">
                        {{ totalDownloads() }} total downloads {{ agoTextWithoutAgo(oldestDate()) }}
                    </li>
                </ul>
            </div>
            <div class="content has-text-left" v-if="allReleasesHaveAllAssets()">
                <h6 class="title is-6 mb-0">Total asset downloads</h6>
                <ul class="mt-1">
                    <li v-for="[name, downloads] in assetStats()" v-bind:key="name">
                        <code>{{ name }}</code>: {{ downloads }} downloads
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Release } from '@/models/Release';
import ago from 'ts-ago';

export default defineComponent({
    name: 'ReleaseSummary',
    props: {
        releases: {
            type: Array as () => Array<Release>,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        repoName: {
            type: String,
            required: true
        },
    },
    methods: {
        ago: ago,
        agoTextWithoutAgo(date: Date): string {
            let str = ago(date);
            if (!str || str == "just now") {
                return "";
            }
            const agoText = 'ago';
            if (str.endsWith(agoText)) {
                str = str.substring(0, str.length - agoText.length)
            }
            return "within " + str.trim();
        },
        totalDownloads(): number {
            return this.releases.map(r => {
                return r.assets.map(a => a.download_count).reduce((a, b) => a + b, 0)
            }).reduce((a, b) => a + b, 0)
        },
        oldestDate(): Date {
            return new Date(Math.min.apply(null, this.releases.map(r => +new Date(r.published_at))));
        },
        // allReleasesHaveAllAssets returns whether all releases have all assets
        allReleasesHaveAllAssets(): boolean {
            let allAssetNames = [...new Set(
                this.releases.flatMap(r => r.assets.map(a => a.name))
            )];
            if (allAssetNames.length == 0) return false;

            return this.releases.every(r => {
                let releaseAssetNames = r.assets.map(a => a.name);
                return allAssetNames.every(n => releaseAssetNames.includes(n));
            })
        },
        assetStats(): Array<[string, number]> {
            let assetDownloads = new Map<string, number>();

            this.releases.forEach(r => {
                r.assets.forEach(a => {
                    assetDownloads.set(a.name, (assetDownloads.get(a.name) ?? 0) + a.download_count);
                })
            })

            return [...assetDownloads.entries()].sort((a, b) => b[1] - a[1]);
        }
    }
});
</script>

<style scoped>
</style>
