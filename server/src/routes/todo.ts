import { handleGetTodos, handleAddTodos, handleDeleteTodos, handleEditTodos}  from '../controllers/todoController';
const express = require('express');
const router = express.Router();

router.get('/:id', handleGetTodos); // Get all todos
router.put('/:id', handleAddTodos); // Update a todo by ID
router.put('/:id/:todoId', handleEditTodos);
router.delete('/:id/:todoId', handleDeleteTodos); // Delete a todo by ID

module.exports = router;