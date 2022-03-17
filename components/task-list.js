customElements.define('task-list',
    class extends HTMLElement {
        #header;
        #main;
        #footer;
        constructor() {
            super();
            this.attachShadow({mode: 'open'});

            this.#header = document.createElement('header');

            this.#main = document.createElement('main');
            this.#main.setAttribute('class', 'collection');

            this.#footer = document.createElement('footer');

            this.shadowRoot.appendChild(this.#header);
            this.shadowRoot.appendChild(this.#main);
            this.shadowRoot.appendChild(this.#footer);

            //Work-around to allow awaiting fetch.
            (async () => await this.loadElements())();
        }

        //TODO - Find a better way to pass a URL.
        get taskListHrefFromUrl() {
            const queryString = new URL(location)?.search;
            const searchTerm = 'href=';
            const start = queryString.indexOf(searchTerm);
            if (start == -1) return null;
            let end = queryString.indexOf('&', start);
            if (end == -1) end = queryString.length;
            const output = queryString.substring(start + searchTerm.length, end);
            return output;
        }

        async taskListData() {
            const response = await fetch(this.taskListHrefFromUrl, { method: 'GET', mode: 'cors' });
            if (!response.ok) return;
            return await response.json();            
        }

        async deleteTask(href) {
            const response = await fetch(href, { method: 'DELETE', mode: 'cors' });
            if (response.ok) this.loadElements();
        }

        async loadElements() {
            const taskListData = await this.taskListData();
            
            const taskListName = taskListData?.name ?? '';
            this.#header.innerHTML = `<h2>${taskListName}</h2>`;

            const tasks = taskListData?.tasks ?? [];
            this.#main.innerHTML = '';
            const ul = this.#main.appendChild(document.createElement('ul'));
            tasks.forEach(t => {
                const description = t?.description ?? '';
                const dueDate = t?.dueDate ?? '';
                const priority = t?.priority ?? '';
                const isComplete = t?.status == 'complete';
                const editLink = t?._links?.find(l => l !== undefined && l?.rel == 'edit-form' && l?.method == 'GET');
                const deleteLink = t?._links?.find(l => l !== undefined && l?.rel == 'self' && l?.method == 'DELETE');

                const li = ul.appendChild(document.createElement('li'));
                if (editLink !== undefined) {
                    const editButton = li.appendChild(document.createElement('button'));
                    editButton.setAttribute('type', 'button');
                    editButton.innerText = editLink.title;
                    editButton.addEventListener('click', async () => await this.loadEditTask(li, editLink.href));
                }
                const span = li.appendChild(document.createElement('span'));
                span.innerHTML = `
                    ${isComplete ? '<s>' : ''}
                    ${description}
                    ${dueDate}
                    ${priority}
                    ${isComplete ? '</s>' : ''}
                `;
                if (deleteLink !== undefined) {
                    const deleteButton = li.appendChild(document.createElement('button'));
                    deleteButton.setAttribute('type', 'button');
                    deleteButton.innerText = deleteLink.title;
                    deleteButton.addEventListener('click', async () => await this.deleteTask(deleteLink.href));
                }
            });
            
            const taskListLinks = taskListData?._links?? [];
            this.#footer.innerHTML = '';
            const addLink = taskListLinks?.find(l => l !== undefined && l?.rel == 'create-form' && l?.method == 'GET');
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
            this.replaceElementContentWithForm(this.#footer, submitLink);
        }

        async loadEditTask(element, href) {
            const response = await fetch(href, { method: 'GET', mode: 'cors' });
            if (!response.ok) return;
            const data = await response.json();
            const submitLink = data?._links?.find(l => l !== undefined && l?.rel == 'self' && l?.method == 'PUT');
            this.replaceElementContentWithForm(element, submitLink, data);
        }

        replaceElementContentWithForm(element, submitLink, values = null) {
            if (element === undefined || submitLink === undefined) return;

            element.innerHTML = '';
            const form = element.appendChild(document.createElement('form'));
            form.setAttribute('action', submitLink.href);
            form.setAttribute('method', submitLink.method);

            const descriptionLabel = form.appendChild(document.createElement('label'));
            descriptionLabel.innerText = 'Description';
            descriptionLabel.setAttribute('for', 'description');
            const descriptionInput = form.appendChild(document.createElement('input'));
            descriptionInput.setAttribute('type', 'text');
            descriptionInput.setAttribute('id', 'description');
            descriptionInput.setAttribute('name', 'description');
            descriptionInput.setAttribute('required', 'required');
            if (values?.description != null) descriptionInput.value = values.description;
            
            const dueDateLabel = form.appendChild(document.createElement('label'));
            dueDateLabel.innerText = 'Due Date';
            dueDateLabel.setAttribute('for', 'dueDate');
            const dueDateInput = form.appendChild(document.createElement('input'));
            dueDateInput.setAttribute('type', 'date');
            dueDateInput.setAttribute('id', 'dueDate');
            dueDateInput.setAttribute('name', 'dueDate');
            dueDateInput.setAttribute('required', 'required');
            dueDateInput.setAttribute('min', '2000-01-01');
            dueDateInput.setAttribute('max', '2099-12-31');
            if (values?.dueDate != null) dueDateInput.value = values.dueDate;
            
            const priorityLabel = form.appendChild(document.createElement('label'));
            priorityLabel.innerText = 'Priority';
            priorityLabel.setAttribute('for', 'priority');
            const prioritySelect = form.appendChild(document.createElement('select'));
            prioritySelect.setAttribute('id', 'priority');
            prioritySelect.setAttribute('name', 'priority');
            const priority = values?.priority ?? 'low';
            prioritySelect.innerHTML = `
                <option value="low"${priority == 'low' ? 'selected' : ''}>Low</option>
                <option value="medium"${priority == 'medium' ? 'selected' : ''}>Medium</option>
                <option value="high"${priority == 'high' ? 'selected' : ''}>High</option>`;
            
            const completeLabel = form.appendChild(document.createElement('label'));
            completeLabel.innerText = 'Complete';
            completeLabel.setAttribute('for', 'complete');
            const completeInput = form.appendChild(document.createElement('input'));
            completeInput.setAttribute('type', 'checkbox');
            completeInput.setAttribute('id', 'complete');
            completeInput.setAttribute('name', 'status');
            if(submitLink.method == 'POST') {
                completeLabel.setAttribute('hidden', 'hidden');
                completeInput.setAttribute('hidden', 'hidden');
            } else {
                completeInput.checked = values?.status == 'complete';
            }

            const button = form.appendChild(document.createElement('button'));
            button.innerText = submitLink.title;
            button.setAttribute('type', 'submit');

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const body = JSON.stringify({
                    description: descriptionInput.value,
                    dueDate: dueDateInput.value,
                    priority: prioritySelect.value,
                    status: completeInput.checked ? 'complete': 'open'
                });
                await fetch(submitLink.href, { 
                    method: submitLink.method,
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: body
                });
                this.loadElements();
            });
        }

    }
);