import { Release } from "@/models/Release";
import { Repository } from "@/models/Repository";
import { Octokit } from "octokit";

export async function loadAllReleases(
    kit: Octokit, user: string, repo: string,
    intermediateResults: ((r: Release[]) => void) | null,
): Promise<Release[]> {
    let page = 1;
    const perPage = 100;


    const result: Release[] = [];

    let resp;
    do {
        resp = await kit.rest.repos.listReleases({
            owner: user,
            repo: repo,
            page: page,
            per_page: perPage,
        });

        result.push(...(resp.data as Array<Release>))

        // Always sort releases descending
        result.sort((a, b) => +new Date(a.published_at) - +new Date(b.published_at));

        if (resp.data.length < perPage) {
            break;
        }

        if (intermediateResults != null)
            intermediateResults(result);

        page++;
    } while (resp.data.length == perPage);

    return result;
}



export async function loadAllRepositories(
    kit: Octokit, user: string,
    intermediateResults: ((r: Repository[]) => void) | null,
): Promise<Repository[]> {
    let page = 1;
    const perPage = 100;


    const result: Repository[] = [];

    let resp;
    do {
        resp = await kit.rest.repos.listForUser({
            username: user,
            page: page,
            sort: "full_name",
            per_page: perPage,
        });

        result.push(...(resp.data as Array<Repository>))

        if (resp.data.length < perPage) {
            break;
        }

        if (intermediateResults != null)
            intermediateResults(result);

        page++;
    } while (resp.data.length == perPage);

    return result;
}
