class TaskListsUseCases {
    #tasksRepository;
    #taskListsRepository;
    constructor (tasksRepository, taskListsRepository) {
        this.#tasksRepository = tasksRepository;
        this.#taskListsRepository = taskListsRepository;
    }

    createTaskList(name) {
        return this.#taskListsRepository.createTaskList(name);
    }

    deleteTaskList(id) {
        return this.#taskListsRepository.deleteTaskList(id);
    }

    getNewTaskListRepresentation(linkFactory) {
        return {
            _links: [{
                title: 'Submit',
                rel: 'collection',
                method: 'POST',
                href: linkFactory.createHref('collection')
            }],
            name: ''
        };
    }

    getTaskList(linkFactory, id) {
        let taskList = this.#taskListsRepository.readTaskListById(id);
        if (taskList === null) return null;
        return {
            _links: [{
                title: 'Add Task',
                rel: 'create-form',
                method: 'GET',
                href: linkFactory.createHref('create-form', id)
            }],
            ...taskList,
            tasks: this.#tasksRepository.readTasksByTaskList(id).map(t => {
                let task = {
                    _links: [],
                    id: t.id,
                    description: t.description,
                    dueDate: t.dueDate,
                    priority: t.priority,
                    status: t.status
                };

                task._links.push({
                    title: 'Delete',
                    rel: 'self',
                    method: 'DELETE',
                    href: linkFactory.createHref('self', t.id)
                });
                if (task.status != 'complete')
                    task._links.push({
                        title: 'Edit',
                        rel: 'edit-form',
                        method: 'GET',
                        href: linkFactory.createHref('edit-form', t.id)
                    });

                return task;
            })
        };
    }

    getTaskLists(linkFactory) {
        return {
            _links: [{
                title: 'Add List',
                rel: 'create-form',
                method: 'GET',
                href: linkFactory.createHref('create-form')
            }],
            lists:
                this.#taskListsRepository.readTaskLists().map(tl => {
                let taskList = {
                    _links: []
                };
                let tasks = this.#tasksRepository.readTasksByTaskList(tl.id);
                taskList.taskCount = tasks.length;
                taskList.completedTaskCount = tasks.filter(t => t.status == 'complete').length;
                
                taskList._links.push({
                    title: tl.name,
                    rel: 'self',
                    method: 'GET',
                    href: linkFactory.createHref('self', tl.id)
                });
                if (taskList.taskCount == 0 || taskList.taskCount > taskList.completedTaskCount)
                    taskList._links.push({
                        title: 'Delete',
                        rel: 'self',
                        method: 'DELETE',
                        href: linkFactory.createHref('self', tl.id)
                    });
                
                return taskList;
            })
        };
    }
}

export { TaskListsUseCases };