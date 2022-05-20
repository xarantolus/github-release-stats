
export class RepoInfo {
    repoName: string
    userName: string

    constructor(repo: string, user: string) {
        this.repoName = repo;
        this.userName = user;
    }

    public static toURL(ri: RepoInfo): string {
        const baseURL = location.protocol + "//" + location.host + location.pathname;

        return baseURL + "?"
            + "user=" + encodeURIComponent(ri.userName)
            + "&repo=" + encodeURIComponent(ri.repoName);
    }

    public static fromState(urlSearch: string, state: any): RepoInfo {
        const urlParams = new URLSearchParams(urlSearch);
        return {
            repoName: urlParams.get('repo') ?? state?.repoName ?? "",
            userName: urlParams.get('user') ?? state?.userName ?? "",
        }
    }
}
