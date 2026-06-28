import React from 'react';

const CAT_ICONS = { general: '⬡', work: '💼', personal: '👤', shopping: '🛒', health: '❤️' };

const priorityColor = { high: 'danger', medium: 'warning', low: 'success' };
const statusLabel = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };
const statusBadge = { todo: 'neutral', 'in-progress': 'accent', done: 'success' };

function isOverdue(due) {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const overdue = isOverdue(task.due) && task.status !== 'done';

  return (
    <article className={`task-card priority-${task.priority}`} aria-label={`Task: ${task.title}`}>
      <div className="task-header">
        <button
          className={`task-cb${task.status === 'done' ? ' done' : ''}`}
          onClick={() => onToggle(task)}
          title={task.status === 'done' ? 'Mark as not done' : 'Mark as done'}
          aria-label={task.status === 'done' ? 'Mark as not done' : 'Mark as done'}
        >
          {task.status === 'done' && '✓'}
        </button>
        <span className={`task-title${task.status === 'done' ? ' done' : ''}`}>{task.title}</span>
        <div className="task-actions">
          <button className="icon-btn" onClick={() => onEdit(task)} title="Edit task" aria-label="Edit task">✎</button>
          <button className="icon-btn danger" onClick={() => onDelete(task._id)} title="Delete task" aria-label="Delete task">🗑</button>
        </div>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span className={`badge badge-${statusBadge[task.status]}`}>{statusLabel[task.status]}</span>
        <span className={`badge badge-${priorityColor[task.priority]}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        <span className="badge badge-neutral">{CAT_ICONS[task.category]} {task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
        {task.due && (
          <span className={`badge ${overdue ? 'badge-danger' : 'badge-neutral'}`}>
            📅 {fmtDate(task.due)}{overdue ? ' · Overdue' : ''}
          </span>
        )}
      </div>
    </article>
  );
}
