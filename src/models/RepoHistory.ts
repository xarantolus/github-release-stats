export class RepoHistory {
    static key = 'repo-history';

    static load(): Array<RepoHistoryItem> {
        const storedItems = localStorage.getItem(this.key) ?? "[]";

        try {
            return (JSON.parse(storedItems) as Array<RepoHistoryItem>)
                .sort((a, b) => (+new Date(a.lastVisit)) - (+new Date(b.lastVisit)));
        } catch (ex) {
            console.log("Parsing data from repo-history:", ex);
        }
        return [];
    }

    static addEntry(entry: RepoHistoryItem): Array<RepoHistoryItem> {
        // Add this item to the top of the stack and remove older entries that match this repo
        const items = [entry,
            ...this.load().filter(e => e.repoName != entry.repoName && e.userName != entry.userName)
        ];

        localStorage.setItem(this.key, JSON.stringify(items));

        return items;
    }

    static deleteEntry(entry: RepoHistoryItem): Array<RepoHistoryItem> {
        const items = this.load().filter(e => e.repoName != entry.repoName && e.userName != entry.userName)

        localStorage.setItem(this.key, JSON.stringify(items));

        return items;
    }
}

export interface RepoHistoryItem {
    lastVisit: Date;

    userName: string;
    repoName: string;
}
