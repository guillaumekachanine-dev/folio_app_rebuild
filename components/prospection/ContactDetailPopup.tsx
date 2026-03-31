'use client';

import { useEffect, useState } from 'react';
import type { ProspectContact } from './types';

type ContactDetailPopupProps = {
  open: boolean;
  contact: ProspectContact | null;
  onClose: () => void;
  onSave: (payload: Partial<ProspectContact>) => Promise<void>;
};

export default function ContactDetailPopup({
  open,
  contact,
  onClose,
  onSave,
}: ContactDetailPopupProps) {
  const [form, setForm] = useState<Partial<ProspectContact>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!contact) return;
    setForm({
      job_title: contact.job_title ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      linkedin_url: contact.linkedin_url ?? '',
      notes: contact.notes ?? '',
      last_activity: contact.last_activity ?? '',
      activity_note: contact.activity_note ?? '',
    });
  }, [contact]);

  if (!open || !contact) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">
              {contact.first_name} {contact.last_name}
            </h3>
            <p className="text-sm text-stone-500">
              {contact.job_title || contact.role || 'Contact'}
            </p>
            {contact.company_name && (
              <p className="text-xs text-stone-400">{contact.company_name}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            Fermer
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="text-sm text-stone-600">
            Poste
            <input
              value={form.job_title ?? ''}
              onChange={(event) => setForm({ ...form, job_title: event.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="Fonction"
            />
          </label>
          <label className="text-sm text-stone-600">
            Email
            <input
              value={form.email ?? ''}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="email@exemple.com"
            />
          </label>
          <label className="text-sm text-stone-600">
            Telephone
            <input
              value={form.phone ?? ''}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="+33 6 00 00 00 00"
            />
          </label>
          <label className="text-sm text-stone-600">
            LinkedIn
            <input
              value={form.linkedin_url ?? ''}
              onChange={(event) => setForm({ ...form, linkedin_url: event.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="https://linkedin.com/in/..."
            />
          </label>
          <label className="text-sm text-stone-600">
            Derniere activite
            <input
              value={form.last_activity ?? ''}
              onChange={(event) => setForm({ ...form, last_activity: event.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="Ex: Appel, email, meeting..."
            />
          </label>
          <label className="text-sm text-stone-600">
            Note d&apos;activite
            <textarea
              value={form.activity_note ?? ''}
              onChange={(event) => setForm({ ...form, activity_note: event.target.value })}
              className="mt-1 min-h-[70px] w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-stone-600">
            Notes
            <textarea
              value={form.notes ?? ''}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className="mt-1 min-h-[90px] w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-600"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
