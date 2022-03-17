customElements.define('task-list-collection',
    class extends HTMLElement {
        #header;
        #main;
        #footer;
        constructor() {
            super();
            this.attachShadow({mode: 'open'});

            this.#header = document.createElement('header');
            this.#header.innerHTML = `<h2>${this.title}</h2>`;

            this.#main = document.createElement('main');
            this.#main.setAttribute('class', 'collection');

            this.#footer = document.createElement('footer');

            this.shadowRoot.appendChild(this.#header);
            this.shadowRoot.appendChild(this.#main);
            this.shadowRoot.appendChild(this.#footer);

            //Work-around to allow awaiting fetch.
            (async () => await this.loadElements())();
        }

        get title() {
            return this.hasAttribute('title') ? this.getAttribute('title') : '';
        }

        async taskListCollectionData() {
            const apiBaseUrl = this.hasAttribute('baseUrl') ? this.getAttribute('baseUrl') : 'http://localhost/TaskLists';
            const response = await fetch(apiBaseUrl, { method: 'GET', mode: 'cors' });
            if (!response.ok) return;
            return await response.json();
        }

        async deleteList(href) {
            const response = await fetch(href, { method: 'DELETE', mode: 'cors' });
            if (response.ok) this.loadElements();
        }

        async loadElements() {
            const collectionData = await this.taskListCollectionData();

            const collectionLists = collectionData?.lists ?? [];
            this.#main.innerHTML = '';
            const ul = this.#main.appendChild(document.createElement('ul'));
            collectionLists.forEach(cl => {
                const taskCount = cl?.taskCount ?? 0;
                const completedTaskCount = cl?.completedTaskCount ?? 0;
                const allTasksComplete = taskCount > 0 && taskCount == completedTaskCount;
                const getLink = cl?._links?.find(l => l !== undefined && l?.rel == 'self' && l?.method == 'GET');
                const deleteLink = cl?._links?.find(l => l !== undefined && l?.rel == 'self' && l?.method == 'DELETE');

                const li = ul.appendChild(document.createElement('li'));
                if (getLink !== undefined) {
                    li.innerHTML = `
                        ${getLink === undefined ? '' : `<a target="_blank" href="./task-list.html?href=${encodeURI(getLink.href)}" rel="${getLink.rel}">${allTasksComplete ? `<s>${getLink.title}</s>` : getLink.title}</a>`}
                        (${completedTaskCount}/${taskCount})`;
                }
                if (deleteLink !== undefined) {
                    const button = li.appendChild(document.createElement('button'));
                    button.setAttribute('type', 'button');
                    button.innerText = deleteLink.title;
                    button.addEventListener('click', async () => await this.deleteList(deleteLink.href));
                }
            });

            this.#footer.innerHTML = '';
            const collectionLinks = collectionData?._links ?? [];
            const addLink = collectionLinks?.find(l => l !== undefined && l?.rel == 'create-form' && l?.method == 'GET');
            if (addLink !== undefined) {
                const addButton = this.#footer.appendChild(document.createElement('button'));
                addButton.setAttribute('type', 'button');
                addButton.innerText = addLink.title;
                addButton.addEventListener('click', async () => await this.loadNewFooter(addLink.href));
            }
        }

        async loadNewFooter(href) {
            const response = await fetch(href, { method: 'GET', mode: 'cors' });
            if (!response.ok) return;
            const newData = await response.json();
            const submitLink = newData?._links?.find(l => l !== undefined && l?.rel == 'collection' && l?.method == 'POST');
            if (submitLink !== undefined) {
                this.#footer.innerHTML = '';
                const form = this.#footer.appendChild(document.createElement('form'));
                form.setAttribute('action', submitLink.href);
                form.setAttribute('method', submitLink.method);
                const label = form.appendChild(document.createElement('label'));
                label.innerText = 'Name';
                label.setAttribute('for', 'name');
                const input = form.appendChild(document.createElement('input'));
                input.setAttribute('type', 'text');
                input.setAttribute('id', 'name');
                input.setAttribute('name', 'name');
                input.setAttribute('required', 'required');
                const button = form.appendChild(document.createElement('button'));
                button.innerText = submitLink.title;
                button.setAttribute('type', 'submit');

                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    await fetch(submitLink.href, { 
                        method: submitLink.method,
                        mode: 'cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: input.value })
                    });
                    this.loadElements();
                });
            }
        }

    }
);