import ago from 'ts-ago';

export function generateFetchErrorMessage(resp: Response, during: string): string {
    const nextTime = resp.headers.get('x-ratelimit-reset');
    if (nextTime && resp.headers.get('x-ratelimit-remaining') == '0') {
        const unixTime = parseInt(nextTime) * 1000;
        const ts = new Date(unixTime);
        const msDiff = Math.abs(+ts - +new Date());
        if (msDiff < 120 * 1000) {
            return "Rate limit reached while " + during + ", try again in " + msDiff + " seconds";
        }
        return "Rate limit reached while " + during + ", try again " + ago(unixTime);
    }
    return `Invalid status code ${resp.status} while ` + during;
}
