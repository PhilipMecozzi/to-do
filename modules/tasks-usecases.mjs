class TasksUseCases {
    #tasksRepository;
    constructor (tasksRepository) {
        this.#tasksRepository = tasksRepository;
    }

    createTask(taskListId, description, dueDate, priority) {
        let result = this.#tasksRepository.createTask(taskListId, description, dueDate, priority);
        return result;
    }

    deleteTask(id) {
        return this.#tasksRepository.deleteTask(id);
    }

    getNewTaskRepresentation(linkFactory, id) {
        return {
            _links: [{
                title: 'Submit',
                rel: 'collection',
                method: 'POST',
                href: linkFactory.createHref('collection', id)
            }],
            taskListId: id,
            description: '',
            dueDate: '',
            priority: ''
        };
    }

    getTask(linkFactory, id) {
        let task = this.#tasksRepository.readTaskById(id);
        if (task === null) return null;
        let _links = [{
            title: 'Submit',
            rel: 'self',
            method: 'PUT',
            href: linkFactory.createHref('self', id)
        }];
        return { _links, ...task };
    }

    updateTask(id, description, dueDate, priority, status) {
        return this.#tasksRepository.updateTask(id, description, dueDate, priority, status);
    }
}

export { TasksUseCases };