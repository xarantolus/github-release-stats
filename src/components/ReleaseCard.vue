<template>
    <div class="card">
        <header class="card-header">
            <a :href="release.html_url" target="_blank" class="card-header-title title is-5">
                {{ release.name }}
            </a>
        </header>
        <div class="card-content">
            <div class="content has-text-left release-info">
                <h6 class="title is-6 mb-0">Release info</h6>
                <ul class="mt-1">
                    <li>
                        Author:
                        <a :href="release.author.html_url" target="_blank">{{ release.author.login }}</a>
                    </li>
                    <li>
                        Published:
                        <time :datetime="new Date(release.published_at).toISOString()" :title="new Date(release.published_at).toISOString()">
                            {{ formatDate(new Date(release.published_at)) }}
                        </time>
                    </li>
                    <li v-if="release.assets.length > 0">
                        Total downloads:
                        {{ release.assets.map(a => a.download_count).reduce((a, b) => a + b, 0) }}
                    </li>
                </ul>
            </div>
            <div class="content has-text-left asset-info" v-if="release.assets.length > 0">
                <h6 class="title is-6 mb-0">Assets</h6>
                <ul class="mt-1">
                    <li v-for="asset in release.assets" v-bind:key="asset.id">
                        <a :href="asset.browser_download_url" target="_blank"><code>{{ asset.name }}</code></a>: {{ asset.download_count }} downloads, {{ prettyBytes(asset.size) }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Release } from '@/models/Release';
import prettyBytes from 'pretty-bytes';
import ago from "ts-ago";

export default defineComponent({
    name: 'ReleaseCard',
    props: {
        release: {
            type: Object as PropType<Release>,
            required: true
        }
    },
    methods: {
        prettyBytes,
        formatDate(date: Date) {
            if (this.isToday(date)) {
                return 'Today, ' + ago(date)
            }
            if (this.isDaysAgo(date, 1)) {
                return `Yesterday, ${date.getHours()}:${date.getMinutes()}`
            }
            if (this.isDaysAgo(date, 2)) {
                return '2 days ago'
            }

            return ago(date) ?? date.toDateString();
        },
        isToday(date: Date): boolean {
            const today = new Date()
            return date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        },
        isDaysAgo(date: Date, numDays: number): boolean {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - numDays);
            return date.getDate() === yesterday.getDate() &&
                date.getMonth() === yesterday.getMonth() &&
                date.getFullYear() === yesterday.getFullYear();
        },
    }
});
</script>

<style scoped>
.card {
    margin-bottom: 1%;
}
</style>
