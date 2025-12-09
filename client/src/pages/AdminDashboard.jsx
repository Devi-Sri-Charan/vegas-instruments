// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Toast from '../components/Toast';

export default function AdminDashboard() {
  const [categories, setCategories] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [formState, setFormState] = useState({
    name: '', categoryId: '', description: '', videoUrl: '', inStock: true, image: '', pdf: ''
  });

  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [catSaving, setCatSaving] = useState(false);

  // PDF specific UI state
  const [pdfRemoved, setPdfRemoved] = useState(false);
  const [pdfName, setPdfName] = useState('No PDF selected');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [cRes, iRes] = await Promise.all([
        api.get('/categories'),
        api.get('/instruments/admin/list/all')
      ]);
      setCategories(cRes.data || []);
      setInstruments(iRes.data || []);
    } catch (err) {
      console.error(err);
      setToast({ title: 'Error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  }

  function resetInstrumentForm() {
    setSelectedInstrument(null);
    setFormState({ name:'', categoryId:'', description:'', videoUrl:'', inStock:true, image:'', pdf: '' });
    const imgEl = document.getElementById('imageFile');
    if (imgEl) imgEl.value = '';
    const pdfEl = document.getElementById('pdfFile');
    if (pdfEl) pdfEl.value = '';
    setPdfRemoved(false);
    setPdfName('No PDF selected');
  }

  function editInstrument(inst) {
    setSelectedInstrument(inst);
    setFormState({
      name: inst.name,
      categoryId: inst.categoryId? inst.categoryId._id : '',
      description: inst.description || '',
      videoUrl: inst.videoUrl || '',
      inStock: inst.inStock,
      image: inst.image || '',
      pdf: inst.pdf || ''
    });
    setPdfRemoved(false);
    if (inst.pdf) {
      try {
        const parts = inst.pdf.split('/');
        setPdfName(parts[parts.length - 1] || 'Uploaded PDF');
      } catch {
        setPdfName('Uploaded PDF');
      }
    } else {
      setPdfName('No PDF selected');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitInstrument(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formState.name);
      fd.append('categoryId', formState.categoryId);
      fd.append('description', formState.description || '');
      fd.append('videoUrl', formState.videoUrl || '');
      fd.append('inStock', formState.inStock ? 'true' : 'false');

      const fileEl = document.getElementById('imageFile');
      if (fileEl && fileEl.files.length) fd.append('image', fileEl.files[0]);

      const pdfEl = document.getElementById('pdfFile');
      if (pdfEl && pdfEl.files.length) fd.append('pdf', pdfEl.files[0]);

      if (pdfRemoved) {
        fd.append('pdfRemove', 'true');
      }

      if (selectedInstrument) {
        await api.put(`/instruments/${selectedInstrument._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setToast({ title: 'Saved', message: 'Instrument updated' });
      } else {
        await api.post('/instruments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setToast({ title: 'Saved', message: 'Instrument created' });
      }
      await load();
      resetInstrumentForm();
    } catch (err) {
      console.error(err);
      setToast({ title: 'Error', message: err.response?.data?.message || 'Error saving instrument' });
    } finally {
      setSaving(false);
    }
  }

  async function deleteInstrument(id) {
    if (!confirm('Delete instrument?')) return;
    try {
      await api.delete(`/instruments/${id}`);
      setToast({ title: 'Deleted', message: 'Instrument deleted' });
      await load();
    } catch (err) {
      console.error(err);
      setToast({ title: 'Error', message: 'Failed to delete instrument' });
    }
  }

  async function toggleStock(id, current) {
    try {
      await api.put(`/instruments/${id}`, { inStock: !current }, { headers: { 'Content-Type': 'application/json' }});
      setToast({ title: 'Updated', message: 'Stock status changed' });
      await load();
    } catch (err) {
      console.error(err);
      setToast({ title: 'Error', message: 'Failed to update stock' });
    }
  }

  // Category logic unchanged...
  function startNewCategory() {
    setEditingCategory(null);
    setCatForm({ name: '', description: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startEditCategory(cat) {
    setEditingCategory(cat);
    setCatForm({ name: cat.name || '', description: cat.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submitCategory(e) {
    e.preventDefault();
    if (catSaving) return;
    setCatSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', catForm.name);
      fd.append('description', catForm.description || '');
      const fileEl = document.getElementById('catImage');
      if (fileEl && fileEl.files.length) fd.append('image', fileEl.files[0]);

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
        setToast({ title: 'Updated', message: 'Category updated' });
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
        setToast({ title: 'Saved', message: 'Category added' });
      }
      setEditingCategory(null);
      setCatForm({ name: '', description: '' });
      await load();
    } catch (err) {
      console.error(err);
      setToast({ title: 'Error', message: err.response?.data?.message || 'Failed to save category' });
    } finally {
      setCatSaving(false);
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete category? This will not delete instruments automatically.')) return;
    try {
      await api.delete(`/categories/${id}`);
      setToast({ title: 'Deleted', message: 'Category deleted' });
      await load();
    } catch (err) {
      console.error(err);
      setToast({ title: 'Error', message: err.response?.data?.message || 'Failed to delete category' });
    }
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {toast && <Toast id="admin-toast" title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      <div className="row">
        <div className="col-md-8">
          <div className="card p-3 mb-3">
            <h5>{selectedInstrument ? 'Edit Instrument' : 'Add Instrument'}</h5>
            <form onSubmit={submitInstrument}>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <input className="form-control" placeholder="Name" value={formState.name} onChange={e => setFormState(s => ({ ...s, name: e.target.value }))} required />
                </div>

                <div className="col-md-6 mb-2">
                  <select className="form-control" value={formState.categoryId} onChange={e => setFormState(s => ({ ...s, categoryId: e.target.value }))} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-12 mb-2">
                  <textarea className="form-control" placeholder="Description" value={formState.description} onChange={e => setFormState(s => ({ ...s, description: e.target.value }))}></textarea>
                </div>

                <div className="col-md-6 mb-2">
                  <input className="form-control" placeholder="YouTube link" value={formState.videoUrl} onChange={e => setFormState(s => ({ ...s, videoUrl: e.target.value }))} />
                </div>

                <div className="col-md-3 mb-2">
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="checkbox" checked={formState.inStock} onChange={e => setFormState(s => ({ ...s, inStock: e.target.checked }))} id="instInStock" />
                    <label className="form-check-label" htmlFor="instInStock">In Stock</label>
                  </div>
                </div>

                <div className="col-md-3 mb-2">
                  <input id="imageFile" type="file" className="form-control" accept="image/*" />
                </div>

                {/* PDF input + preview area (new) */}
                <div className="col-md-12 mb-2">
                  <label className="form-label">Datasheet / PDF (optional)</label>
                  <div className="d-flex align-items-center gap-2">
                    <input id="pdfFile" type="file" className="form-control" accept="application/pdf"
                      onChange={(e) => {
                        const f = e.target.files && e.target.files[0];
                        setPdfName(f ? f.name : (selectedInstrument?.pdf ? selectedInstrument.pdf.split('/').pop() : 'No PDF selected'));
                        if (f) setPdfRemoved(false);
                      }} />
                    <div style={{ minWidth: 240 }}>
                      <div className="form-text">{pdfName}</div>
                      <div className="mt-1">
                        {selectedInstrument && selectedInstrument.pdf && !pdfRemoved && (
                          <a href={selectedInstrument.pdf} target="_blank" rel="noreferrer" className="me-2">Open current PDF</a>
                        )}
                        { (selectedInstrument && (selectedInstrument.pdf || pdfName !== 'No PDF selected')) && (
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => {
                            setPdfRemoved(true);
                            const pdfEl = document.getElementById('pdfFile');
                            if (pdfEl) pdfEl.value = '';
                            setPdfName('No PDF selected');
                          }}>
                            Remove PDF
                          </button>
                        ) }
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-2">
                <button className="btn btn-primary me-2" disabled={saving}>{saving ? 'Saving...' : (selectedInstrument ? 'Update Instrument' : 'Save Instrument')}</button>
                <button type="button" className="btn btn-secondary" onClick={resetInstrumentForm}>Reset</button>
              </div>
            </form>
          </div>

          <div className="card p-3 mb-3">
            <h5>Existing Instruments</h5>
            {loading ? 'Loading...' : (
              <table className="table">
                <thead><tr><th>Name</th><th>Category</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {instruments.map(i => (
                    <tr key={i._id}>
                      <td>{i.name}</td>
                      <td>{i.categoryId ? i.categoryId.name : '-'}</td>
                      <td>{i.inStock ? 'In Stock' : 'Out of Stock'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editInstrument(i)}>Edit</button>
                        <button className="btn btn-sm btn-outline-warning me-1" onClick={() => toggleStock(i._id, i.inStock)}>{i.inStock ? 'Mark Out' : 'Mark In'}</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteInstrument(i._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h5>{editingCategory ? 'Edit Category' : 'Add Category'}</h5>
            <form onSubmit={submitCategory}>
              <input className="form-control mb-2" placeholder="Name" value={catForm.name} onChange={e => setCatForm(s => ({ ...s, name: e.target.value }))} required />
              <textarea className="form-control mb-2" placeholder="Description" value={catForm.description} onChange={e => setCatForm(s => ({ ...s, description: e.target.value }))}></textarea>
              <input id="catImage" type="file" className="form-control mb-2" accept="image/*" />
              <div className="d-flex">
                <button className="btn btn-primary me-2" disabled={catSaving}>{catSaving ? (editingCategory ? 'Updating...' : 'Saving...') : (editingCategory ? 'Update Category' : 'Add Category')}</button>
                {editingCategory && <button type="button" className="btn btn-secondary" onClick={() => { setEditingCategory(null); setCatForm({ name: '', description: '' }); }}>Cancel</button>}
              </div>
            </form>

            <hr />
            <h6 className="mt-2">Existing</h6>
            <ul className="list-group">
              {categories.map(c => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={c._id}>
                  <div>
                    <strong>{c.name}</strong>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>{c.description}</div>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => startEditCategory(c)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(c._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-3">
            <h5>Admin Actions</h5>
            <button className="btn btn-outline-secondary w-100" onClick={() => { localStorage.removeItem('vega_admin_token'); window.location.href = '/'; }}>Logout</button>
            <div className="mt-2">
              <button className="btn btn-sm btn-link" onClick={() => startNewCategory()}>+ Add New Category (quick)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
