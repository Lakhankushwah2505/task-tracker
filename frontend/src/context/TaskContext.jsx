import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  filters: { status: 'all', priority: 'all', category: 'all', search: '', sort: 'createdAt_desc' },
  stats: { total: 0, done: 0, inProgress: 0, highPriority: 0 },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    case 'SET_TASKS':
      const tasks = action.payload;
      return {
        ...state,
        tasks,
        loading: false,
        stats: {
          total: tasks.length,
          done: tasks.filter(t => t.status === 'done').length,
          inProgress: tasks.filter(t => t.status === 'in-progress').length,
          highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
        },
      };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t._id === action.payload._id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t._id !== action.payload) };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default: return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchTasks = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await taskAPI.getAll(params);
      dispatch({ type: 'SET_TASKS', payload: res.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error('Failed to load tasks');
    }
  }, []);

  const createTask = useCallback(async (data) => {
    try {
      const res = await taskAPI.create(data);
      dispatch({ type: 'ADD_TASK', payload: res.data.data });
      toast.success('Task added!');
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const updateTask = useCallback(async (id, data) => {
    try {
      const res = await taskAPI.update(id, data);
      dispatch({ type: 'UPDATE_TASK', payload: res.data.data });
      toast.success('Task updated');
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const toggleStatus = useCallback(async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const res = await taskAPI.patchStatus(task._id, newStatus);
      dispatch({ type: 'UPDATE_TASK', payload: res.data.data });
      toast.success(newStatus === 'done' ? '✅ Task complete!' : 'Moved back to to do');
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await taskAPI.delete(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      toast.success('Task deleted', { icon: '🗑️' });
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const setFilter = useCallback((filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  return (
    <TaskContext.Provider value={{ ...state, fetchTasks, createTask, updateTask, toggleStatus, deleteTask, setFilter }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider');
  return ctx;
};
