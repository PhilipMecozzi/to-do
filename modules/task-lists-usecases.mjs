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

    getNewTaskListRepresentation() {
        return {
            _links: [{
                title: 'Submit',
                rel: 'collection',
                method: 'POST'
            }],
            name: ''
        };
    }

    getTaskList(id) {
        let taskList = this.#taskListsRepository.readTaskListById(id);
        if (taskList === null) return null;
        return {
            _links: [{
                title: 'Add Task',
                rel: 'create-form',
                method: 'GET'
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
                    method: 'DELETE'
                });
                if (task.status != 'complete')
                    task._links.push({
                        title: 'Edit',
                        rel: 'edit-form',
                        method: 'GET'
                    });

                return task;
            })
        };
    }

    getTaskLists() {
        return {
            _links: [{
                title: 'Add List',
                rel: 'create-form',
                method: 'GET'
            }],
            lists:
                this.#taskListsRepository.readTaskLists().map(tl => {
                let taskList = {
                    _links: [],
                    id: tl.id
                };
                let tasks = this.#tasksRepository.readTasksByTaskList(taskList.id);
                taskList.taskCount = tasks.length;
                taskList.completedTaskCount = tasks.filter(t => t.status == 'complete').length;
                
                taskList._links.push({
                    title: tl.name,
                    rel: 'self',
                    method: 'GET'
                });
                if (taskList.taskCount > taskList.completedTaskCount)
                    taskList._links.push({
                        title: 'Delete',
                        rel: 'self',
                        method: 'DELETE'
                    });
                
                return taskList;
            })
        };
    }
}

export { TaskListsUseCases };