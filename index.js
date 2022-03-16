import express, { json as parseJsonRequests, urlencoded as parseUrlEncodedRequests } from 'express';
import env from 'process';
import { tasksRepository, taskListsRepository } from './modules/tasks-store.mjs';
import { TasksUseCases } from './modules/tasks-usecases.mjs';
import { TaskListsUseCases } from './modules/task-lists-usecases.mjs';

const PORT = env.PORT ?? 3000;
const app = express();
const tasksUseCases = new TasksUseCases(tasksRepository);
const taskListsUseCases = new TaskListsUseCases(tasksRepository, taskListsRepository);

//Middleware
  //Parse JSON request bodies.
app.use(parseJsonRequests());

  //Parse URL encoded request bodies using qs.
app.use(parseUrlEncodedRequests({ extended: true }));

  //Request & response logging?

//Routing
app.get('/TaskLists/New', (request, response) => {
  let taskList = taskListsUseCases.getNewTaskListRepresentation();
  return response.status(200).send(taskList);
});

app.get('/TaskLists', (request, response) => {
  let taskLists = taskListsUseCases.getTaskLists() ?? [];
  if (taskLists.length == 0) return response.status(204).end();
  return response.status(200).send(taskLists);
});

app.post('/TaskLists', (request, response) => {
  let result = taskListsUseCases.createTaskList(request?.body?.name);
  if (!result.success) return response.status(400).end(); //Should return problem details
  response.location(`${request.protocol}://${request.hostname}:${PORT}/TaskLists/${result.id}`);
  return response.status(201).end();
});

app.delete('/TaskLists/:id', (request, response) => {
  let result = taskListsUseCases.deleteTaskList(request?.params?.id);
  if (!result.success) return response.status(400).end(); //Should return problem details
  return response.status(204).end();
});

app.get('/TaskLists/:id', (request, response) => {
  let taskList = taskListsUseCases.getTaskList(request?.params?.id);
  if (taskList === null) return response.status(404).end();
  return response.status(200).send(taskList);
});

app.get('/TaskLists/:id/New', (request, response) => {
  let task = tasksUseCases.getNewTaskRepresentation(request?.params?.id);
  return response.status(200).send(task);
});

app.post('/TaskLists/:id', (request, response) => {
  let result = tasksUseCases.createTask(
    request?.params?.id, 
    request?.body?.description, 
    request?.body?.dueDate,
    request?.body?.priority);
  if (!result.success) return response.status(400).end();  //Should return problem details
  response.location(`${request.protocol}://${request.hostname}:${PORT}/Tasks/${result.id}`);
  return response.status(201).end();
});

app.get('/Tasks/:id', (request, response) => {
  let task = tasksUseCases.getTask(request?.params?.id);
  if (task === null) return response.status(404).end();
  return response.status(200).send(task);
});

app.put('/Tasks/:id', (request, response) => {
  let result = tasksUseCases.updateTask(
    request?.params?.id,
    request?.body?.description,
    request?.body?.dueDate,
    request?.body?.priority,
    request?.body?.status
  );
  if (!result.success) return response.status(400).end();  //Should return problem details
  return response.status(204).end();
});

app.delete('/Tasks/:id', (request, response) => {
  let result = tasksUseCases.deleteTask(request?.params?.id);
  if (!result.success) return response.status(400).end(); //Should return problem details
  return response.status(204).end();
});

//Start HTTP server.
app.listen(PORT, () =>
  console.log(`Example app listening on port ${PORT}!`),
);