# TODO

## **Requirements**
---
- Web application should consist of two pages.
- Node/Express Restful APIs should compose backend.
- Landing page should display to-do lists.
    - Users should be able to create and delete to-do lists.
    - To-do lists names should be unique.
    - To-do lists should be displayed with name as well as completed and total task counts.
    - To-do lists with all tasks completed should be displayed with "strikethrough" formatting.
    - User should be able to click on to-do list name to open that list on second page.
- Second page should display tasks within a single to-do list.
    - Users should be able to create, update, or delete tasks for parent to-do list.
    - Tasks should have a name, description, due date, priority (high, medium, or low), and status (completed or not).
    - All properties of a task are required.  Users shouldn't be able to submit a task update/creation without all fields.
    - Task names should be unique.
    - Completed tasks cannot be updated.
## **Design**
---
Javascript, html, css for front-end.  Want to utilize web components to encapsulate task lists.  Keep it simple and request the whole task list after every unsafe request.  Restful API requires hypermedia, so use something like HAL or HTML as API media type.  

In-memory arrays may be enough for data persistance.  If not use file system.

Authorization on API low-priority or not needed.

**API endpoints**
- GET .../TaskLists
- GET .../TaskLists/New
- POST .../TaskLists
- DELETE .../TaskLists/:id
- GET .../TaskLists/:id
- GET .../TaskLists/:id/New
- POST .../TaskLists/:id
- GET .../Tasks/:id
- PUT .../Tasks/:id
- DELETE .../Tasks/:id

## **Stories**
---
- ☐ *Not completed*
- ☑ *Completed*
- ☒ *Not needed at this time*
---
1. ☑ Express controllers/route handlers
    - Need to handle all routes specified in API endpoints.
1. ☑ In-memory data store module
    - Should keep data persistence implementation separate.
1. ☑ TaskLists use cases module
    - Hypermedia to dictate available actions.
1. ☑ Tasks use cases module
    - Hypermedia to dictate available actions.
1. ☑ Calculate hypermedia hrefs with information from controller methods
    - Keep specific HTTP concerns out of use cases as much as possible.
    - May need HTTP helper module or factory.
1. ☑ Create main page
    - When opening index.html in a web browser, the main page of the application should be displayed.
    - Main page should be titled "TODO".
1. ☐ Main page should display all task lists
    - Page should request collection of task lists from API.
    - Task lists should each display their name, completed task count, and total task count.
1. ☐ TaskList component
1. ☐ Task component
1. ☐ Styling
1. ☒ Request/Response logging middleware
1. ☒ Authorization middleware
    - Could use basic auth to keep things simple.