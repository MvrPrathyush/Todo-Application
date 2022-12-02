const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
app.use(express.json());

const filePath = path.join(__dirname, "todoApplication.db");
let db;
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite.Database,
    });

    app.listen(3000, () => {
      console.log("Server Started Successfully");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
  }
};

initializeDbAndServer();
const snakeToCamel = (todoList) => {
  let newTodoList = [];
  for (let eachTodo of todoList) {
    let newObj = {
      id: eachTodo.id,
      todo: eachTodo.todo,
      priority: eachTodo.priority,
      status: eachTodo.status,
      category: eachTodo.category,
      dueDate: eachTodo.due_date,
    };
    newTodoList.push(newObj);
  }
  return newTodoList;
};

const validStatus = (status) => {
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    return true;
  } else {
    return false;
  }
};

const validPriority = (priority) => {
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    return true;
  } else {
    return false;
  }
};

const validCategory = (category) => {
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    return true;
  } else {
    return false;
  }
};

const sendStatusInvalidResponse = (request, response) => {
  response.status(400);
  response.send("Invalid Todo Status");
};

const sendInvalidPriorityResponse = (request, response) => {
  response.status(400);
  response.send("Invalid Todo Priority");
};

const sendInvalidCategoryResponse = (request, response) => {
  response.status(400);
  response.send("Invalid Todo Category");
};
let isStatusValid;
let isPriorityValid;
let isCategoryValid;
let isDateValid;
app.get("/todos/", async (request, response) => {
  const { todo, status, priority, category, search_q } = request.query;
  const onlyStatus =
    status !== undefined &&
    todo === undefined &&
    priority === undefined &&
    category === undefined &&
    search_q === undefined;
  const onlyPriority =
    status === undefined &&
    todo === undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined;

  const onlyCategory =
    status === undefined &&
    todo === undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === undefined;

  const priorityAndStatus =
    status !== undefined &&
    todo === undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined;

  const categoryAndStatus =
    status !== undefined &&
    todo === undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === undefined;

  const categoryAndPriority =
    status === undefined &&
    todo === undefined &&
    priority !== undefined &&
    category !== undefined &&
    search_q === undefined;

  const onlySearch =
    status === undefined &&
    todo === undefined &&
    priority === undefined &&
    category === undefined &&
    search_q !== undefined;

  switch (true) {
    // todo with only status

    case onlyStatus:
      isStatusValid = validStatus(status);
      if (isStatusValid) {
        //get results
        const getTodoQuery = `SELECT * 
                                    FROM todo
                                    WHERE status ='${status}';`;
        const todoList = await db.all(getTodoQuery);
        const newTodoList = snakeToCamel(todoList);
        response.send(newTodoList);
      } else {
        sendStatusInvalidResponse(request, response);
      }
      break;

    //todo with only priority

    case onlyPriority:
      isPriorityValid = validPriority(priority);
      if (isPriorityValid) {
        //get results
        const getTodoQuery = `SELECT * 
                                    FROM todo
                                    WHERE priority ='${priority}';`;
        const todoList = await db.all(getTodoQuery);

        const newTodoList = snakeToCamel(todoList);
        response.send(newTodoList);
      } else {
        sendInvalidPriorityResponse(request, response);
      }
      break;

    //priority  and status

    case priorityAndStatus:
      isStatusValid = validStatus(status);
      isPriorityValid = validPriority(priority);
      if (isStatusValid && isPriorityValid) {
        //get results
        const getTodoQuery = `SELECT * 
                                FROM todo 
                                WHERE status = '${status}'
                                AND priority='${priority}';`;
        const todoList = await db.all(getTodoQuery);
        const newTodoList = snakeToCamel(todoList);
        response.send(newTodoList);
      } else if (validStatus === false) {
        sendStatusInvalidResponse(request, response);
      } else if (validPriority === false) {
        sendInvalidPriorityResponse(request, response);
      }
      break;
    //only search
    case onlySearch:
      const getTodoQuery = `SELECT * 
                                    FROM todo 
                                    WHERE todo LIKE '%${search_q}%';`;
      const todoList = await db.all(getTodoQuery);
      const newTodoList = snakeToCamel(todoList);
      response.send(newTodoList);
      break;

    //category and status
    case categoryAndStatus:
      isCategoryValid = validCategory(category);
      isStatusValid = validStatus(status);
      if (validStatus && validCategory) {
        //get results
        const getTodoQuery = `SELECT * 
                                    FROM todo
                                WHERE status = '${status}' 
                                AND category = '${category}'; `;
        const todoList = await db.all(getTodoQuery);
        const newTodoList = snakeToCamel(todoList);
        response.send(newTodoList);
      } else if (isStatusValid === false) {
        sendStatusInvalidResponse(request, response);
      } else if (isCategoryValid === false) {
        sendInvalidCategoryResponse(request, response);
      }
      break;

    // only category
    case onlyCategory:
      isCategoryValid = validCategory(category);
      if (isCategoryValid) {
        //get results
        const getTodoQuery = `SELECT * 
                                    FROM todo
                                    WHERE category ='${category}';`;
        const todoList = await db.all(getTodoQuery);
        const newTodoList = snakeToCamel(todoList);
        response.send(newTodoList);
      } else {
        sendInvalidCategoryResponse(request, response);
      }
      break;
    //category and priority
    case categoryAndPriority:
      isCategoryValid = validCategory(category);
      isPriorityValid = validPriority(priority);
      if (isCategoryValid && isPriorityValid) {
        //get results
        const getTodoQuery = `SELECT * 
                                    FROM todo
                                WHERE priority = '${priority}' 
                                AND category = '${category}'; `;
        const todoList = await db.all(getTodoQuery);
        const newTodoList = snakeToCamel(todoList);
        response.send(newTodoList);
      } else if (isPriorityValid === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else if (isCategoryValid === false) {
        sendInvalidCategoryResponse(request, response);
      }
      break;
  }
});

// GET TODOS based on todo ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * 
                            FROM todo 
                                WHERE id = ${todoId};`;
  const todoList = await db.get(getTodoQuery);
  const newTodoList = {
    id: todoList.id,
    todo: todoList.todo,
    priority: todoList.priority,
    status: todoList.status,
    category: todoList.category,
    dueDate: todoList.due_date,
  };
  response.send(newTodoList);
});
// todos before dueDate

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  try {
    const dueDate = format(new Date(date), "yyyy-MM-dd");
    const getTodoQuery = `SELECT *
                                FROM todo 
                                WHERE due_date = '${dueDate}';`;
    const todoList = await db.all(getTodoQuery);
    const newTodoList = snakeToCamel(todoList);
    response.send(newTodoList);
  } catch (error) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// UPDATE TODO

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateDetails = request.body;
  const { status, priority, todo, category, dueDate } = updateDetails;

  switch (true) {
    case status !== undefined:
      isStatusValid = validStatus(status);
      if (isStatusValid) {
        //update status
        const updateStatusQuery = `UPDATE todo
                                SET status = '${status}'
                                WHERE id = ${todoId};`;
        await db.run(updateStatusQuery);
        response.send("Status Updated");
      } else {
        sendStatusInvalidResponse(request, response);
      }

      break;
    case priority !== undefined:
      //update priority
      isPriorityValid = validPriority(priority);

      if (isPriorityValid) {
        const updatePriorityQuery = `UPDATE todo
                                SET priority = '${priority}'
                                WHERE id = ${todoId};`;
        await db.run(updatePriorityQuery);
        response.send("Priority Updated");
      } else {
        sendInvalidPriorityResponse(request, response);
      }
      break;
    case todo !== undefined:
      //update todo
      const updateTodoQuery = `UPDATE todo
                                SET todo = '${todo}'
                                WHERE id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");

      break;
    case category !== undefined:
      isCategoryValid = validCategory(category);
      if (isCategoryValid) {
        //update category
        const updateCategoryQuery = `UPDATE todo
                                SET category = '${category}'
                                WHERE id = ${todoId};`;
        await db.run(updateCategoryQuery);
        response.send("Category Updated");
      } else {
        sendInvalidCategoryResponse(request, response);
      }

      break;
    case dueDate !== undefined:
      const validDueDate = isValid(new Date(dueDate));

      if (validDueDate) {
        //update dueDate
        const updateDueDateQuery = `UPDATE todo
                                SET due_date = '${dueDate}'
                                WHERE id = ${todoId};`;
        await db.run(updateDueDateQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
  }
});
//delete todo

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo 
                            WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

//POST TODOS
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  isStatusValid = validStatus(status);
  isPriorityValid = validPriority(priority);
  isCategoryValid = validCategory(category);
  isValidDate = isValid(new Date(dueDate));
  const postCondition =
    isStatusValid && isPriorityValid && isCategoryValid && isValidDate;
  switch (true) {
    case postCondition:
      const updateTodoQuery = `
                        INSERT INTO todo(id,todo,priority,status,category,due_date)
                        VALUES(
                            '${id}',
                            '${todo}',
                            '${priority}',
                            '${status}',
                            '${category}',
                            ${dueDate}
                        );`;

      const dbResponse = await db.run(updateTodoQuery);

      response.send("Todo Successfully Added");
      break;

    case isStatusValid === false:
      sendStatusInvalidResponse(request, response);
      break;
    case isPriorityValid === false:
      sendInvalidPriorityResponse(request, response);
      break;
    case isCategoryValid === false:
      sendInvalidCategoryResponse(request, response);
      break;
    case isValidDate === false:
      response.status(400);
      response.send("Invalid Due Date");
      break;
  }
});

module.exports = app;
