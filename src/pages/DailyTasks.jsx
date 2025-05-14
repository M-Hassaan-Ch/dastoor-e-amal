import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  ListGroup,
  Badge,
} from "react-bootstrap";
import {
  Plus,
  Trash,
  Check,
  List,
  Calendar,
  Tag,
  X,
} from "react-bootstrap-icons";
import { todoService } from '../services/todoService';
import "./Tasks.css";

const DailyTasks = () => {
  const [taskDetails, setTaskDetails] = useState({
    description: "",
    dueDate: "",
  });
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [showListModal, setShowListModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await todoService.getAllTodos();
      setTasks(data);
      
      // Extract unique lists and tags from tasks
      const uniqueLists = [...new Set(data.map(task => task.listId))]
        .filter(Boolean)
        .map(listId => ({
          id: listId,
          name: data.find(task => task.listId === listId)?.listName || 'Default List',
          count: data.filter(task => task.listId === listId).length
        }));
      
      const uniqueTags = [...new Set(data.flatMap(task => task.tags || []))]
        .map(tag => ({
          ...tag,
          count: data.filter(task => task.tags?.some(t => t.id === tag.id)).length
        }));

      setLists(uniqueLists);
      setTags(uniqueTags);
      
      if (uniqueLists.length > 0) {
        setSelectedList(uniqueLists[0].id);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateListCount = (listId, change) => {
    setLists(prevLists => 
      prevLists.map(list => 
        list.id === listId 
          ? { ...list, count: list.count + change }
          : list
      )
    );
  };

  // List Management
  const addNewList = async () => {
    if (newListName.trim()) {
      try {
        const newList = {
          id: Date.now(),
          name: newListName,
          count: 0,
        };
        
        // We'll store list information in tasks for now
        await todoService.createTodo({
          title: `List: ${newListName}`,
          listId: newList.id,
          listName: newListName,
          isListMarker: true,
          completed: false
        });

        const updatedLists = [...lists, newList];
        setLists(updatedLists);

        if (updatedLists.length === 1) {
          setSelectedList(newList.id);
        }

        setNewListName("");
        setShowListModal(false);
      } catch (err) {
        setError('Failed to create list');
        console.error('Error creating list:', err);
      }
    }
  };

  const deleteList = async (listId) => {
    if (window.confirm("Are you sure you want to delete this list? All tasks in this list will be deleted!")) {
      try {
        const tasksToDelete = tasks.filter(task => task.listId === listId);
        for (const task of tasksToDelete) {
          await todoService.deleteTodo(task._id);
        }

        const updatedTasks = tasks.filter(task => task.listId !== listId);
        setTasks(updatedTasks);

        const updatedLists = lists.filter(list => list.id !== listId);
        setLists(updatedLists);

        if (selectedList === listId) {
          setSelectedList(updatedLists[0]?.id || null);
        }
      } catch (err) {
        setError('Failed to delete list');
        console.error('Error deleting list:', err);
      }
    }
  };

  const deleteTag = (tagId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this tag? It will be removed from all tasks!"
      )
    ) {
      // Remove tag from tags state
      const updatedTags = tags.filter((tag) => tag.id !== tagId);
      setTags(updatedTags);

      // Remove tag from all tasks
      const updatedTasks = tasks.map((task) => ({
        ...task,
        tags: task.tags.filter((tag) => tag.id !== tagId),
      }));
      setTasks(updatedTasks);
    }
  };

  // Tag Management
  const addNewTag = () => {
    if (newTagName.trim()) {
      const newTag = {
        id: Date.now(),
        name: newTagName,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        count: 0,
      };
      setTags([...tags, newTag]);
      setNewTagName("");
      setShowTagModal(false);
    }
  };

  const toggleTagSelection = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Task Management
  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));
        
        const newTaskData = {
          title: newTask,
          completed: false,
          listId: selectedList,
          listName: lists.find(list => list.id === selectedList)?.name,
          description: taskDetails.description,
          dueDate: taskDetails.dueDate,
          tags: selectedTagObjects,
        };

        const result = await todoService.createTodo(newTaskData);
        const newTaskObj = { ...newTaskData, _id: result.id };

        setTasks([...tasks, newTaskObj]);
        updateListCount(selectedList, 1);
        setNewTask("");
        setShowTaskModal(false);
        setTaskDetails({ description: "", dueDate: "" });
        setSelectedTags([]);
      } catch (err) {
        setError('Failed to create task');
        console.error('Error creating task:', err);
      }
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      await todoService.updateTodo(taskId, {
        ...task,
        completed: !task.completed
      });

      const updatedTasks = tasks.map(task =>
        task._id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await todoService.deleteTodo(taskId);
      const taskToDelete = tasks.find(task => task._id === taskId);
      const updatedTasks = tasks.filter(task => task._id !== taskId);
      setTasks(updatedTasks);
      updateListCount(taskToDelete.listId, -1);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleTaskUpdate = () => {
    const updatedTasks = tasks.map((task) =>
      task._id === selectedTask._id ? selectedTask : task
    );
    setTasks(updatedTasks);
    setSelectedTask(null);
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container fluid className="tasks-container">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <Row className="h-100">
        {/* Sidebar */}
        <Col md={3} className="sidebar bg-dark">
          <div className="p-3">
            <h5 className="text-muted mb-4">
              <List className="me-2" />
              Tasks
            </h5>

            <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
              <h6 className="text-muted">
                <List className="me-2" />
                Lists
              </h6>
              <Button
                variant="link"
                className="text-muted p-0"
                onClick={() => setShowListModal(true)}
              >
                <Plus size={16} />
              </Button>
            </div>

            <ListGroup variant="flush">
              {lists.length === 0 ? (
                <ListGroup.Item className="bg-dark text-light">
                  No lists available. Create a new list to get started.
                </ListGroup.Item>
              ) : (
                lists.map((list) => (
                  <ListGroup.Item
                    key={list.id}
                    action
                    active={selectedList === list.id}
                    onClick={() => setSelectedList(list.id)}
                    className="bg-dark text-light d-flex justify-content-between align-items-center"
                  >
                    <span>{list.name}</span>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="secondary">{list.count}</Badge>
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(list.id);
                        }}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>

            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-muted">
                  <Tag className="me-2" />
                  Tags
                </h6>
                <Button
                  variant="link"
                  className="text-muted p-0"
                  onClick={() => setShowTagModal(true)}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{
                      backgroundColor: tag.color,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {tag.name} ({tag.count})
                    <Button
                      variant="link"
                      className="delete-tag-btn text-light p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTag(tag.id);
                      }}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={9} className="main-content bg-dark p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-light">
              {lists.find((l) => l.id === selectedList)?.name ||
                "Select a List"}
            </h2>
            <Button
              variant="primary"
              onClick={() => setShowTaskModal(true)}
              disabled={lists.length === 0}
            >
              <Plus /> Add New Task
            </Button>
          </div>

          {selectedList ? (
            <ListGroup>
              {tasks
                .filter((t) => t.listId === selectedList)
                .map((task) => (
                  <ListGroup.Item
                    key={task._id}
                    className={`bg-secondary text-light mb-2 rounded ${
                      task.completed ? "completed-task" : ""
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      <Form.Check
                        checked={task.completed}
                        onChange={() => toggleTask(task._id)}
                        className="me-3"
                      />
                      <div className="flex-grow-1">
                        <h5 className="mb-1">{task.title}</h5>
                        <div className="d-flex align-items-center mt-2">
                          {task.dueDate && (
                            <Badge bg="warning" text="dark" className="me-2">
                              <Calendar className="me-1" />{" "}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                          {task.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              style={{ backgroundColor: tag.color }}
                              className="me-2"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="link"
                        onClick={() => setSelectedTask(task)}
                        className="text-light"
                      >
                        Details
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
            </ListGroup>
          ) : (
            <div className="text-center text-light mt-5">
              {lists.length > 0
                ? "Select a list from the sidebar"
                : "Create a list first to start adding tasks!"}
            </div>
          )}
        </Col>
      </Row>

      {/* Add List Modal */}
      <Modal
        show={showListModal}
        onHide={() => setShowListModal(false)}
        centered
        className="dark-modal"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>Create New List</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              addNewList();
            }}
          >
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="List name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="bg-secondary text-light"
                autoFocus
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowListModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={addNewList}>
                Create List
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Tag Modal */}
      <Modal
        show={showTagModal}
        onHide={() => setShowTagModal(false)}
        centered
        className="dark-modal"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>Create New Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              addNewTag();
            }}
          >
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="bg-secondary text-light"
                autoFocus
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowTagModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={addNewTag}>
                Create Tag
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        centered
        className="dark-modal"
      >
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Task title"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="bg-secondary text-light"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={taskDetails.description}
                onChange={(e) =>
                  setTaskDetails({
                    ...taskDetails,
                    description: e.target.value,
                  })
                }
                className="bg-secondary text-light"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={taskDetails.dueDate}
                onChange={(e) =>
                  setTaskDetails({ ...taskDetails, dueDate: e.target.value })
                }
                className="bg-secondary text-light"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{
                      backgroundColor: tag.color,
                      cursor: "pointer",
                      opacity: selectedTags.includes(tag.id) ? 1 : 0.5,
                    }}
                    onClick={() => toggleTagSelection(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={addTask}>
                Add Task
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          show={!!selectedTask}
          onHide={() => setSelectedTask(null)}
          centered
          className="dark-modal"
        >
          <Modal.Header closeButton className="bg-dark text-light">
            <Modal.Title>{selectedTask.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={selectedTask.description}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      description: e.target.value,
                    })
                  }
                  className="bg-secondary text-light"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedTask.dueDate}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      dueDate: e.target.value,
                    })
                  }
                  className="bg-secondary text-light"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{
                        backgroundColor: tag.color,
                        cursor: "pointer",
                        opacity: selectedTask.tags.some((t) => t.id === tag.id)
                          ? 1
                          : 0.5,
                      }}
                      onClick={() => {
                        const updatedTags = selectedTask.tags.some(
                          (t) => t.id === tag.id
                        )
                          ? selectedTask.tags.filter((t) => t.id !== tag.id)
                          : [...selectedTask.tags, tag];
                        setSelectedTask({ ...selectedTask, tags: updatedTags });
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button
                  variant="danger"
                  onClick={() => deleteTask(selectedTask._id)}
                >
                  <Trash /> Delete Task
                </Button>
                <Button variant="success" onClick={handleTaskUpdate}>
                  <Check /> Save Changes
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default DailyTasks;
