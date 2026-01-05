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
      <h2 style={{ fontWeight: 700, marginBottom: '2rem' }}>Admin Dashboard</h2>
      {toast && <Toast id="admin-toast" title={toast.title} message={toast.message} onClose={() => setToast(null)} />}

      <div className="row">
        {/* Left column - Instruments */}
        <div className="col-md-8">
          <div className="admin-section">
            <h5>{selectedInstrument ? 'Edit Instrument' : 'Add Instrument'}</h5>
            <form onSubmit={submitInstrument}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name</label>
                  <input 
                    className="form-control" 
                    placeholder="Instrument name" 
                    value={formState.name} 
                    onChange={e => setFormState(s => ({ ...s, name: e.target.value }))} 
                    required 
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control" 
                    value={formState.categoryId} 
                    onChange={e => setFormState(s => ({ ...s, categoryId: e.target.value }))} 
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Product description" 
                    rows="4"
                    value={formState.description} 
                    onChange={e => setFormState(s => ({ ...s, description: e.target.value }))}
                  ></textarea>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">YouTube Link</label>
                  <input 
                    className="form-control" 
                    placeholder="https://youtube.com/..." 
                    value={formState.videoUrl} 
                    onChange={e => setFormState(s => ({ ...s, videoUrl: e.target.value }))} 
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Stock Status</label>
                  <div className="form-check mt-2">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={formState.inStock} 
                      onChange={e => setFormState(s => ({ ...s, inStock: e.target.checked }))} 
                      id="instInStock" 
                    />
                    <label className="form-check-label" htmlFor="instInStock">
                      In Stock
                    </label>
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Image</label>
                  <input 
                    id="imageFile" 
                    type="file" 
                    className="form-control" 
                    accept="image/*" 
                  />
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label">Datasheet / PDF (optional)</label>
                  <div className="d-flex align-items-start gap-3">
                    <div style={{ flex: 1 }}>
                      <input 
                        id="pdfFile" 
                        type="file" 
                        className="form-control" 
                        accept="application/pdf"
                        onChange={(e) => {
                          const f = e.target.files && e.target.files[0];
                          setPdfName(f ? f.name : (selectedInstrument?.pdf ? selectedInstrument.pdf.split('/').pop() : 'No PDF selected'));
                          if (f) setPdfRemoved(false);
                        }} 
                      />
                      <div className="form-text mt-2">{pdfName}</div>
                    </div>
                    <div style={{ minWidth: 200 }}>
                      {selectedInstrument && selectedInstrument.pdf && !pdfRemoved && (
                        <a 
                          href={selectedInstrument.pdf} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-sm btn-outline-secondary d-block mb-2"
                        >
                          Open Current PDF
                        </a>
                      )}
                      {(selectedInstrument && (selectedInstrument.pdf || pdfName !== 'No PDF selected')) && (
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger d-block" 
                          onClick={() => {
                            setPdfRemoved(true);
                            const pdfEl = document.getElementById('pdfFile');
                            if (pdfEl) pdfEl.value = '';
                            setPdfName('No PDF selected');
                          }}
                        >
                          Remove PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <button className="btn btn-primary me-2" disabled={saving}>
                  {saving ? 'Saving...' : (selectedInstrument ? 'Update Instrument' : 'Save Instrument')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetInstrumentForm}>
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="admin-section">
            <h5>Existing Instruments</h5>
            {loading ? (
              <div style={{ color: 'var(--text-grey)' }}>Loading...</div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instruments.map(i => (
                      <tr key={i._id}>
                        <td>{i.name}</td>
                        <td>{i.categoryId ? i.categoryId.name : '-'}</td>
                        <td>
                          <span style={{ 
                            color: i.inStock ? 'var(--accent-green)' : '#ef4444',
                            fontWeight: 500 
                          }}>
                            {i.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary" 
                              onClick={() => editInstrument(i)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-outline-warning" 
                              onClick={() => toggleStock(i._id, i.inStock)}
                            >
                              {i.inStock ? 'Mark Out' : 'Mark In'}
                            </button>
                            <button 
                              className="btn btn-outline-danger" 
                              onClick={() => deleteInstrument(i._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Categories and Actions */}
        <div className="col-md-4">
          <div className="admin-section">
            <h5>{editingCategory ? 'Edit Category' : 'Add Category'}</h5>
            <form onSubmit={submitCategory}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input 
                  className="form-control" 
                  placeholder="Category name" 
                  value={catForm.name} 
                  onChange={e => setCatForm(s => ({ ...s, name: e.target.value }))} 
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  placeholder="Category description" 
                  rows="3"
                  value={catForm.description} 
                  onChange={e => setCatForm(s => ({ ...s, description: e.target.value }))}
                ></textarea>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Image</label>
                <input 
                  id="catImage" 
                  type="file" 
                  className="form-control" 
                  accept="image/*" 
                />
              </div>
              
              <div className="d-grid gap-2">
                <button className="btn btn-primary" disabled={catSaving}>
                  {catSaving ? (editingCategory ? 'Updating...' : 'Saving...') : (editingCategory ? 'Update Category' : 'Add Category')}
                </button>
                {editingCategory && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setEditingCategory(null); setCatForm({ name: '', description: '' }); }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="mt-4">
              <h6 style={{ color: 'var(--text-white)', marginBottom: '1rem' }}>Existing Categories</h6>
              <div className="list-group">
                {categories.map(c => (
                  <div className="list-group-item d-flex justify-content-between align-items-start" key={c._id}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-white)', marginBottom: '0.25rem' }}>
                        {c.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {c.description}
                      </div>
                    </div>
                    <div className="btn-group btn-group-sm ms-2">
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={() => startEditCategory(c)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-outline-danger" 
                        onClick={() => deleteCategory(c._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-section">
            <h5>Admin Actions</h5>
            <button 
              className="btn btn-secondary w-100" 
              onClick={() => { 
                localStorage.removeItem('vega_admin_token'); 
                window.location.href = '/'; 
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}