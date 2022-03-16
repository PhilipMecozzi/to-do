//In-memory data persistence arrays
let taskLists = [
    {id:1647576000000, name:'Groceries'},
    {id:1647576000001, name:'Reading'}
];

let tasks = [
{
    id: 1647576000002,
    taskListId: 1647576000000,
    description: 'Bananas',
    dueDate: '2022-03-18',
    priority: 'low',
    status: 'open'
},
{
    id: 1647576000003,
    taskListId: 1647576000000,
    description: 'Chicken',
    dueDate: '2022-03-18',
    priority: 'medium',
    status: 'open'
},
{
    id: 1647576000004,
    taskListId: 1647576000000,
    description: 'Cookies',
    dueDate: '2022-03-18',
    priority: 'high',
    status: 'open'
},
{
    id: 1647576000005,
    taskListId: 1647576000000,
    description: 'Rice',
    dueDate: '2022-03-18',
    priority: 'high',
    status: 'complete'
},
{
    id: 1647576000006,
    taskListId: 1647576000001,
    description: "The Hitchhiker's Guide to the Galaxy",
    dueDate: '2022-03-18',
    priority: 'low',
    status: 'complete'
},
{
    id: 1647576000007,
    taskListId: 1647576000001,
    description: 'Dune',
    dueDate: '2022-03-18',
    priority: 'low',
    status: 'complete'
},
{
    id: 1647576000008,
    taskListId: 1647576000001,
    description: 'The Last Wish',
    dueDate: '2022-03-18',
    priority: 'low',
    status: 'complete'
}];

const getUniqueId = () => Date.now();   //Milliseconds since unix epoch gets the Krusty Brand Seal of Approval.

class TasksRepository {

    readTasksByTaskList(taskListId) {
        return tasks.filter(t => t.taskListId == taskListId);
    }

    readTaskById(id) {
        let task = tasks.find(t => t.id == id);
        if (task === undefined) return null;
        return task;
    }

    #readTaskByDescription(description) {
        let task = tasks.find(t => t.description == description);
        if (task === undefined) return null;
        return task;
    }

    createTask(taskListId, description, dueDate, priority = 'medium') {
        if (this.#readTaskByDescription(description) !== null) return {success: false};

        let id = getUniqueId();
        let beforeCount = tasks.length;
        let task = {
            id: id,
            taskListId: taskListId,
            description: description,
            dueDate: dueDate,
            priority: priority,
            status: 'open'
        };
        let afterCount = tasks.push(task);
        
        if (afterCount == beforeCount) return {success: false};

        this.#sortTasks();
        return {success: true, id: id};
    }

    updateTask(id, description, dueDate, priority, status) {
        let task = this.readTaskById(id);

        if (task === undefined) return {success: false};
        if (description != task.description
            && this.#readTaskByDescription(description) !== null)
            return {success: false};
            
        task.description = description;
        task.dueDate = dueDate;
        task.priority = priority;
        task.status = status;

        return {success: true};
    }

    deleteTask(id) {
        tasks = tasks.filter(t => t.id != id);
        return {success: true};
    }

    #sortTasks = () => tasks.sort((a,b) => a.description.localeCompare(b.description));
}

class TaskListsRepository {

    readTaskLists() {
        return taskLists;
    }

    readTaskListById(id) {
        let taskList = taskLists.find(tl => tl.id == id);
        if (taskList === undefined) return null;
        return taskList;
    }

    #readTaskListByName(name) {
        let taskList = taskLists.find(tl => tl.name == name);
        if (taskList === undefined) return null;
        return taskList;
    }

    createTaskList(name) {
        if (this.#readTaskListByName(name) !== null) return {success: false};

        let id = getUniqueId();
        let beforeCount = taskLists.length;
        let afterCount = taskLists.push({
            id: id,
            name: name
        });

        if (afterCount == beforeCount) return {success: false};

        this.#sortTaskLists();
        return {success: true, id: id};
    }

    deleteTaskList(id) {
        taskLists = taskLists.filter(tl => tl.id != id);
        return {success: true};
    }

    #sortTaskLists = () => taskLists.sort((a,b) => a.name.localeCompare(b.name));
}

const tasksRepository = new TasksRepository();
const taskListsRepository = new TaskListsRepository();

export { tasksRepository, taskListsRepository };