export class RepoHistory {
    static key = 'repo-history';

    static load(): Array<RepoHistoryItem> {
        const storedItems = localStorage.getItem(this.key) ?? "[]";

        try {
            const items = (JSON.parse(storedItems) as Array<RepoHistoryItem>);

            return items.sort((a, b) => (+new Date(b.lastVisit)) - (+new Date(a.lastVisit)));
        } catch (ex) {
            console.log("Parsing data from " + this.key + ":", ex);
        }
        return [];
    }

    static deleteAll(): Array<RepoHistoryItem> {
        localStorage.removeItem(this.key);

        return [];
    }

    static addEntry(entry: RepoHistoryItem): Array<RepoHistoryItem> {
        // Add this item to the top of the stack and remove older entries that match this repo
        const items = [
            entry,
            ...this.deleteEntry(entry)
        ];

        localStorage.setItem(this.key, JSON.stringify(items));

        return items;
    }

    static deleteEntry(entry: RepoHistoryItem): Array<RepoHistoryItem> {
        let items = this.load();

        items = items.filter(e => {
            return !(e.userName === entry.userName && e.repoName === entry.repoName)
        })

        localStorage.setItem(this.key, JSON.stringify(items));

        return items;
    }
}

export interface RepoHistoryItem {
    lastVisit: Date;

    userName: string;
    repoName: string;
}
