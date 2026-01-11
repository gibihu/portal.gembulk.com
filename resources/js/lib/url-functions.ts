export function extractDomain(input?: string) {
    if (!input) return '';

    try {
        const url = input.startsWith('http')
            ? new URL(input)
            : new URL(`https://${input}`);

        return url.hostname.replace(/^www\./, '');
    } catch {
        return input;
    }
}