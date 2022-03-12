const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000

//Data persistence
let todos = [{id: 1, name: 'First ToDo'}];

//Routing
app.get('/TaskLists', (req, res) => {
  return res.status(200).send(todos);
});

app.listen(PORT, () =>
  console.log(`Example app listening on port ${PORT}!`),
);