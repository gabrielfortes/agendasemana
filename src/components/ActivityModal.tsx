import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Activity, ActivityInput } from '@/lib/supabase';
import { COLORS, ColorKey, DAYS } from '@/lib/colors';

type Props = {
  open: boolean;
  initial: Activity | null;
  defaultDay: number;
  onClose: () => void;
  onSave: (input: ActivityInput, id?: string) => void;
  onDelete: (id: string) => void;
};

const empty = (day: number): ActivityInput => ({
  title: '',
  description: '',
  day_of_week: day,
  start_time: '09:00',
  end_time: '10:00',
  color: 'sky',
});

export default function ActivityModal({ open, initial, defaultDay, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<ActivityInput>(empty(defaultDay));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : empty(defaultDay));
      setError(null);
    }
  }, [open, initial, defaultDay]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Dê um nome à atividade.');
    if (form.end_time <= form.start_time) return setError('O horário de fim deve ser depois do início.');
    onSave(form, initial?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-[slideUp_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {initial ? 'Editar atividade' : 'Nova atividade'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex.: Aula de matemática"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição (opcional)</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Notas, local, link..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Dia</label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Início</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fim</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cor</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.key as ColorKey })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${
                    form.color === c.key
                      ? 'border-slate-300 bg-slate-50 text-slate-800'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            {initial ? (
              <button
                type="button"
                onClick={() => onDelete(initial.id)}
                className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg transition"
              >
                <Trash2 size={16} /> Excluir
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition">
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition shadow-sm">
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
