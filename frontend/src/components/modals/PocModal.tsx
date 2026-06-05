import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';

export function PocModal() {
  const { pocModalOpen, setPocModalOpen, addPoc, showToast } = useApp();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Enter a name');
      return;
    }
    addPoc({ name, role, phone, email });
    setName('');
    setRole('');
    setPhone('');
    setEmail('');
  };

  return (
    <Modal open={pocModalOpen} onClose={() => setPocModalOpen(false)}>
      <h2 className="mb-4 font-display text-[17px] font-bold tracking-tight">Add Client PoC</h2>
      {(['Name', 'Role', 'Phone (10 digits)', 'Email (optional)'] as const).map((label, i) => {
        const keys = ['name', 'role', 'phone', 'email'] as const;
        const key = keys[i];
        const type = key === 'phone' ? 'tel' : key === 'email' ? 'email' : 'text';
        const values = { name, role, phone, email };
        const setters = { name: setName, role: setRole, phone: setPhone, email: setEmail };
        return (
          <div key={key} className="mb-3">
            <label className="mb-1 block text-[11px] font-medium text-ink2">{label}</label>
            <input
              className="w-full rounded-[9px] border border-line bg-surface px-3 py-[11px] text-[13px] outline-none focus:border-accent"
              type={type}
              value={values[key]}
              onChange={(e) => setters[key](e.target.value)}
              placeholder={key === 'role' ? 'e.g. Facility Manager' : undefined}
            />
          </div>
        );
      })}
      <button type="button" onClick={handleSave} className="w-full rounded-app-sm bg-accent py-3 text-sm font-semibold text-white">Add PoC</button>
      <button type="button" onClick={() => setPocModalOpen(false)} className="mt-2 w-full rounded-app-sm border border-line bg-transparent py-3 text-[13px] text-ink2">Cancel</button>
    </Modal>
  );
}
