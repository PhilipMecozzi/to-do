class LinkFactory {
    #baseUrl;
    #pathTemplates;
    constructor(baseUrl, pathTempaltes) {
        this.#baseUrl = baseUrl;
        this.#pathTemplates = pathTempaltes;
    }

    createHref(rel, id) {
        return `${this.#baseUrl}${this.#pathTemplates[rel](id)}`;
    }
}

export { LinkFactory };