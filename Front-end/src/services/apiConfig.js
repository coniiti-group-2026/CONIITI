const DEFAULT_API_BASE = '/api';
const LOCAL_DEV_PORTS = new Set(['3000', '5173']);
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

function trimTrailingSlash(value) {
    return value.endsWith('/') ? value.slice(0, -1) : value;
}

function isLocalDevFrontend() {
    if (typeof window === 'undefined') {
        return false;
    }

    const { hostname, port } = window.location;
    return LOCAL_HOSTS.has(hostname) && LOCAL_DEV_PORTS.has(port);
}

export function getApiBase() {
    const configuredBase = trimTrailingSlash(import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_BASE);

    if (!/^https?:\/\//i.test(configuredBase) || !isLocalDevFrontend()) {
        return configuredBase || DEFAULT_API_BASE;
    }

    try {
        const parsed = new URL(configuredBase);
        if (LOCAL_HOSTS.has(parsed.hostname) && (!parsed.port || parsed.port === '80')) {
            return trimTrailingSlash(parsed.pathname || DEFAULT_API_BASE) || DEFAULT_API_BASE;
        }
    } catch {
        return configuredBase || DEFAULT_API_BASE;
    }

    return configuredBase || DEFAULT_API_BASE;
}

export function getJsonHeaders(options = {}) {
    const headers = {
        ...options.headers,
    };

    if (options.body !== undefined && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
}
