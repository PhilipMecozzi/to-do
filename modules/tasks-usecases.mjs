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

    getNewTaskRepresentation(id) {
        return {
            _links: [{
                title: 'Submit',
                rel: 'collection',
                method: 'POST'
            }],
            taskListId: id,
            description: '',
            dueDate: '',
            priority: ''
        };
    }

    getTask(id) {
        let task = this.#tasksRepository.readTaskById(id);
        if (task === null) return null;
        let _links = [{
            title: 'Submit',
            rel: 'self',
            method: 'PUT'
        }];
        return { _links, ...task };
    }

    updateTask(id, description, dueDate, priority, status) {
        return this.#tasksRepository.updateTask(id, description, dueDate, priority, status);
    }
}

export { TasksUseCases };