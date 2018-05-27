const router = require('express').Router();
const Todo = require('../models/Todo');
const helper = require('../helpers/helper');


// INDEX ALL
router.get('/todos', function (request, response, next) {

    let currentUserId = request.session.user.rowid;

    Todo.findByUserId(currentUserId, function (todoRows) {

        let todos = todoRows.map((row) => new Todo(row));

        response.format({
            html: () => {
                response.render('todos/index.ejs', {todos: todos})
            },
            json: () => {
                response.send(todoRows)
            }
        })
    })
});


// ADD (view used to display the form for adding content)
router.get('/todos/add', function (request, response) {
    response.render('todos/edit.ejs'); // ou add.ejs
});


// SHOW
router.get('/todos/:todoId', function (request, response, next) {

    let todoId = request.params.todoId;

    if (!isNaN(todoId)) {
        Todo.find(todoId, function (rowTodo) {

            if(!rowTodo){
                next(new Error("No Todo with ID : " + todoId + ""))
            }

            let todo = new Todo(rowTodo);

            response.format({
                html: () => {
                    response.render('todos/show.ejs', {todo: todo})
                },
                json: () => {
                    response.send(rowTodo)
                }
            })
        }, next);
    } else {
        next(new Error("Invalid ID : '" + todoId + "'"))
    }
});


// CREATE (backend code that handles the Add form)
router.post('/todos', function (request, response, next) {

    console.log(request.body)

    if(!helper.checkEmptyFields(request.body)){

        let todo_data = [
            request.body.userId,
            request.body.message
        ];

        Todo.create(todo_data, function (lastID) {

            Todo.find(lastID, function (rowTodo) {

                console.log(rowTodo)

                response.format({
                    html: () => {
                        response.redirect('/todos');
                    },
                    json: () => {
                        response.send(rowTodo);
                    }
                })
            }, next);
        }, next);
    } else {
        response.format({
            html: () => {
                response.redirect(303, '/todos/add')
            },
            json: () => {
                response.send({"error" : "Please fill all fields"})
            }
        })
    }
});


// EDIT (view used to display the form for editing existing content)
router.get('/todos/:todoId/edit', function (request, response, next) {

    let todoId = request.params.todoId;

    if (!isNaN(todoId)) {
        Todo.find(todoId, function (rowTodo) {

            let todo = new Todo(rowTodo);
            console.log(todo)

            response.render('todos/edit.ejs', {editedTodo: todo});

        }, next);
    } else {
        next(new Error("Invalid ID : '" + userId + "'"))
    }
});


// UPDATE (backend code that handles the Edit form) (coché : completedAt)
router.put('/todos/:todoId', function (request, response, next) {

    let todoId = request.params.todoId;

    if (!isNaN(todoId)) {
        if (!helper.checkEmptyFields(request.body)) {

            let todo_data = [
                request.body.userId,
                request.body.message
            ];

            Todo.update(todoId, todo_data, function () {

                Todo.find(todoId, function (rowTodo) {

                    response.format({
                        html: () => {
                            response.end();
                            // c'est le callback de la requete ajax qui redirige
                        },
                        json: () => {
                            response.send(rowTodo);
                        }
                    })

                }, next);
            }, next);

        } else {
            response.format({
                html: () => {
                    response.redirect(303, '/todos/'+ todoId +'/edit')
                },
                json: () => {
                    response.send({"error" : "Please fill all fields"})
                }
            })
        }

    } else {
        next(new Error("Invalid ID : '" + userId + "'"))
    }


});

// DELETE
router.delete('/todos/:todoId', function (request, response, next) {

    let todoId = request.params.todoId;

    if (!isNaN(todoId)) {

        Todo.delete(todoId, function () {
            response.format({
                html: () => {
                    response.end();
                    // c'est le callback de la requete ajax qui redirige
                },
                json: () => {
                    response.status(204).end();
                }
            })
        }, next);

    } else {
        next(new Error("Invalid ID : '" + userId + "'"))
    }


});




module.exports = router;