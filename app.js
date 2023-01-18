const express = require("express");
let format = require("date-fns/format");
let isValid = require("date-fns/isValid");

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`server running at http://localhost:3000`);
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};
initializeDBAndServer();

//API 1
//Scenario 1 Scenario 2  Scenario 3 and Scenario 4 Scenario 5 Scenario 6 Scenario 7
const convertFunction = (list) => {
  return {
    id: list.id,
    todo: list.todo,
    priority: list.priority,
    status: list.status,
    category: list.category,
    dueDate: list.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { search_q } = request.query;
  const keys = Object.keys(request.query);

  if (keys[0] === "search_q") {
    const getSearchQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
    const getSearch = await db.all(getSearchQuery);
    response.send(getSearch.map((list) => convertFunction(list)));
  } else if (keys.length === 1) {
    const value = request.query[keys[0]];
    const getStatusAllQueries = `SELECT * FROM todo WHERE ${keys[0]} = '${value}'`;
    const getStatus = await db.all(getStatusAllQueries);
    if (getStatus[0] === undefined) {
      if (keys[0] === "status") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (keys[0] === "priority") {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (keys[0] === "category") {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.send(getStatus.map((list) => convertFunction(list)));
    }
  } else if (keys.length === 2) {
    const keys = Object.keys(request.query);
    const value1 = request.query[keys[0]];
    const value2 = request.query[keys[1]];
    console.log(value1);
    console.log(value2);
    getTodosQuery = `select * from todo where ${keys[0]}='${value1}' and ${keys[1]}='${value2}';`;
    const getStatusDT = await db.all(getTodosQuery);
    response.send(getStatusDT.map((list) => convertFunction(list)));
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoIdQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const gettodosId = await db.get(getTodoIdQuery);
  response.send(convertFunction(gettodosId));
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const isValidDate = isValid(new Date(date));

  if (isValidDate === true) {
    let newDate = format(new Date(date), "yyyy-MM-dd");

    const getDueDateQuery = `SELECT * FROM todo WHERE due_date = '${newDate}';`;
    const getDateId = await db.all(getDueDateQuery);
    response.send(getDateId.map((list) => convertFunction(list)));
  } else {
    response.status(400);
    response.send(`Invalid Due Date`);
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;

  const checkStatus =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const checkPriority =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const checkCategory =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  const isValidDate = isValid(new Date(dueDate));

  //   console.log(checkCategory);
  if (checkStatus && checkPriority && checkCategory && isValidDate) {
    const date = format(new Date(dueDate), "yyyy-MM-dd");
    const createTodoQuery = `
      INSERT INTO todo(id,todo,priority,status,category,due_date)
      VALUES(
          ${id},
          '${todo}',
          '${priority}',
          '${status}',
          '${category}',
           '${date}'
      );`;
    const dbResponse = await db.run(createTodoQuery);
    response.send("Todo Successfully Added");
  } else {
    if (checkStatus === false) {
      response.status(400);
      response.send(`Invalid Todo Status`);
    } else if (checkPriority === false) {
      response.status(400);
      response.send(`Invalid Todo Priority`);
    } else if (checkCategory === false) {
      response.status(400);
      response.send(`Invalid Todo Category`);
    } else if (isValidDate === false) {
      response.status(400);
      response.send(`Invalid Due Date`);
    }
  }
});

//API 5
//Scenario 1 and Scenario 2  and Scenario 3 scenario4 scenario 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateDetails = request.body;
  const KEY = Object.keys(updateDetails);
  const VALUE = updateDetails[KEY[0]];

  if (KEY[0] === "todo") {
    updateTodoQuery = `UPDATE todo SET
              ${KEY[0]} = '${VALUE}'
              WHERE id = ${todoId}`;
    const getDt = await db.run(updateTodoQuery);
    response.send("Todo Updated");
  } else if (KEY[0] === "status") {
    const validStatus =
      VALUE === "TO DO" || VALUE === "IN PROGRESS" || VALUE === "DONE";
    if (validStatus === true) {
      updateTodoQuery = `UPDATE todo SET
              ${KEY[0]} = '${VALUE}'
              WHERE id = ${todoId}`;
      const getDt = await db.run(updateTodoQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send(`Invalid Todo Status`);
    }
  } else if (KEY[0] === "priority") {
    const validPriority =
      VALUE === "HIGH" || VALUE === "MEDIUM" || VALUE === "LOW";
    if (validPriority === true) {
      updateTodoQuery = `UPDATE todo SET
              ${KEY[0]} = '${VALUE}'
              WHERE id = ${todoId}`;
      const getDt = await db.run(updateTodoQuery);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send(`Invalid Todo Priority`);
    }
  } else if (KEY[0] === "category") {
    const validCategory =
      VALUE === "WORK" || VALUE === "HOME" || VALUE === "LEARNING";
    if (validCategory === true) {
      updateTodoQuery = `UPDATE todo SET
              ${KEY[0]} = '${VALUE}'
              WHERE id = ${todoId}`;
      const getDt = await db.run(updateTodoQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send(`Invalid Todo Category`);
    }
  } else if (KEY[0] === "dueDate") {
    const isValidDate = isValid(new Date(VALUE));
    if (isValidDate === true) {
      updateTodoQuery = `UPDATE todo SET
              due_date = '${VALUE}'
              WHERE id = ${todoId}`;
      const getDt = await db.run(updateTodoQuery);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send(`Invalid Due Date`);
    }
  }
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId}`;
  const deleteTodo = await db.run(deleteTodoQuery);
  response.send(`Todo Deleted`);
});
module.exports = app;
