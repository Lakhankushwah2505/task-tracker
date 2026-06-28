import React, { useState, useEffect } from 'react';

const INITIAL = { title: '', description: '', priority: '', category: 'general', due: '', status: 'todo' };

const CATEGORIES = ['general', 'work', 'personal', 'shopping', 'health'];
const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES = ['todo', 'in-progress', 'done'];

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Title is required';
  else if (values.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  else if (values.title.trim().length > 100) errors.title = 'Title cannot exceed 100 characters';
  if (!values.priority) errors.priority = 'Please select a priority';
  if (values.description.length > 500) errors.description = 'Max 500 characters';
  return errors;
}

export default function TaskForm({ task, onSubmit, onCancel, loading }) {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (task) {
      setValues({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || '',
        category: task.category || 'general',
        due: task.due ? task.due.split('T')[0] : '',
        status: task.status || 'todo',
      });
    } else {
      setValues(INITIAL);
    }
    setErrors({});
    setTouched({});
  }, [task]);

  const change = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...values, [name]: value });
      setErrors((e) => ({ ...e, [name]: errs[name] }));
    }
  };

  const blur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const errs = validate(values);
    setErrors((e) => ({ ...e, [name]: errs[name] }));
  };

  const submit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(values).map((k) => [k, true]));
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...values, due: values.due || null });
  };

  const field = (name, label, required, children) => (
    <div className="form-row">
      <label className="form-label">{label}{required && ' *'}</label>
      {children}
      {touched[name] && errors[name] && <span className="err">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      {field('title', 'Title', true,
        <input name="title" value={values.title} onChange={change} onBlur={blur} placeholder="What needs to be done?" className={touched.title && errors.title ? 'error' : ''} />
      )}

      {field('description', 'Description', false,
        <>
          <textarea name="description" value={values.description} onChange={change} onBlur={blur} placeholder="Add more details…" rows={3} />
          <span style={{ fontSize: 11, color: values.description.length > 450 ? 'var(--text-danger)' : 'var(--text-muted)' }}>
            {values.description.length}/500
          </span>
        </>
      )}

      <div className="form-row-2">
        {field('priority', 'Priority', true,
          <select name="priority" value={values.priority} onChange={change} onBlur={blur}>
            <option value="">Select…</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        )}
        {field('category', 'Category', false,
          <select name="category" value={values.category} onChange={change}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        )}
      </div>

      <div className="form-row-2">
        {field('status', 'Status', false,
          <select name="status" value={values.status} onChange={change}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'in-progress' ? 'In progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        )}
        {field('due', 'Due date', false,
          <input type="date" name="due" value={values.due} onChange={change} />
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : task ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
