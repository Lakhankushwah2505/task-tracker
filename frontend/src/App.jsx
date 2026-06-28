import React, { useEffect, useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { TaskProvider, useTasks } from './context/TaskContext';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import './App.css';

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'due_asc', label: 'Due date ↑' },
  { value: 'due_desc', label: 'Due date ↓' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title A–Z' },
];

const STATUS_FILTERS = [
  { val: 'all', label: 'All tasks' },
  { val: 'todo', label: 'To do' },
  { val: 'in-progress', label: 'In progress' },
  { val: 'done', label: 'Done' },
];

const PRIORITY_FILTERS = [
  { val: 'all', label: 'All priorities' },
  { val: 'high', label: 'High' },
  { val: 'medium', label: 'Medium' },
  { val: 'low', label: 'Low' },
];

const CATEGORY_FILTERS = [
  { val: 'all', label: 'All categories' },
  { val: 'general', label: 'General' },
  { val: 'work', label: 'Work' },
  { val: 'personal', label: 'Personal' },
  { val: 'shopping', label: 'Shopping' },
  { val: 'health', label: 'Health' },
];

function TaskApp() {
  const { tasks, loading, filters, stats, fetchTasks, createTask, updateTask, toggleStatus, deleteTask, setFilter } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Client-side filtering + sorting (matches server-side logic)
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filters.status !== 'all') list = list.filter(t => t.status === filters.status);
    if (filters.priority !== 'all') list = list.filter(t => t.priority === filters.priority);
    if (filters.category !== 'all') list = list.filter(t => t.category === filters.category);
    if (filters.search) list = list.filter(t =>
      t.title.toLowerCase().includes(filters.search) || t.description?.toLowerCase().includes(filters.search)
    );
    list.sort((a, b) => {
      if (filters.sort === 'createdAt_desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (filters.sort === 'createdAt_asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (filters.sort === 'due_asc') return (a.due || '9999') > (b.due || '9999') ? 1 : -1;
      if (filters.sort === 'due_desc') return (a.due || '9999') < (b.due || '9999') ? 1 : -1;
      if (filters.sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (filters.sort === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
    return list;
  }, [tasks, filters]);

  const openAdd = () => { setEditTask(null); setShowModal(true); };
  const openEdit = (task) => { setEditTask(task); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTask(null); };

  const handleSubmit = async (data) => {
    setSaving(true);
    const result = editTask ? await updateTask(editTask._id, data) : await createTask(data);
    setSaving(false);
    if (result.success) closeModal();
  };

  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const isFiltered = filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all';

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="topbar-brand-icon">✓</div>
          <span className="topbar-title">TaskFlow</span>
          <span className="badge badge-accent">MERN Stack</span>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add task</button>
      </header>

      <div className="main">
        <aside className="sidebar">
          <div>
            <p className="sidebar-section-label">Overview</p>
            <div className="stat-grid">
              <div className="stat-card"><div className="val">{stats.total}</div><div className="lbl">Total tasks</div></div>
              <div className="stat-card"><div className="val" style={{ color: 'var(--text-success)' }}>{stats.done}</div><div className="lbl">Completed</div></div>
              <div className="stat-card"><div className="val" style={{ color: 'var(--text-accent)' }}>{stats.inProgress}</div><div className="lbl">In progress</div></div>
              <div className="stat-card"><div className="val" style={{ color: 'var(--text-danger)' }}>{stats.highPriority}</div><div className="lbl">High priority</div></div>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{stats.done} of {stats.total} complete ({pct}%)</p>
          </div>

          {[
            { label: 'Status', opts: STATUS_FILTERS, key: 'status' },
            { label: 'Priority', opts: PRIORITY_FILTERS, key: 'priority' },
            { label: 'Category', opts: CATEGORY_FILTERS, key: 'category' },
          ].map(({ label, opts, key }) => (
            <div key={key}>
              <p className="sidebar-section-label">{label}</p>
              <div className="filter-group">
                {opts.map(o => (
                  <button key={o.val} className={`filter-btn${filters[key] === o.val ? ' active' : ''}`}
                    onClick={() => setFilter({ [key]: o.val })}>
                    {o.label}
                    <span className="count">
                      {o.val === 'all' ? tasks.length : tasks.filter(t => t[key] === o.val).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="content">
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search tasks…" value={filters.search}
                onChange={e => setFilter({ search: e.target.value.toLowerCase() })} />
            </div>
            <select value={filters.sort} onChange={e => setFilter({ sort: e.target.value })}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {isFiltered && (
              <button className="btn btn-sm" onClick={() => setFilter({ status: 'all', priority: 'all', category: 'all' })}>
                ✕ Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty">Loading tasks…</div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <strong>No tasks found</strong><br />
              <span style={{ fontSize: 13 }}>Try adjusting your filters or add a new task.</span>
            </div>
          ) : (
            <div className="task-list">
              {filtered.map(task => (
                <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={deleteTask} onToggle={toggleStatus} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h2 className="modal-title">{editTask ? 'Edit task' : 'Add task'}</h2>
            <TaskForm task={editTask} onSubmit={handleSubmit} onCancel={closeModal} loading={saving} />
          </div>
        </div>
      )}

      <Toaster position="bottom-right" toastOptions={{ duration: 2800 }} />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <TaskApp />
    </TaskProvider>
  );
}
