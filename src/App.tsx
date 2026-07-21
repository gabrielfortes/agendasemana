import { useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Plus, CalendarDays, Clock, Pencil, Loader2, AlertCircle, Download, Check } from 'lucide-react';
import { Activity, ActivityInput, listActivities, insertActivity, updateActivity, deleteActivity } from '@/lib/storage';
import { COLORS, DAYS, DAYS_SHORT, colorByKey } from '@/lib/colors';
import ActivityModal from '@/components/ActivityModal';

const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

function formatDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h${String(m).padStart(2, '0')}`;
  if (h) return `${h}h`;
  return `${m}min`;
}

export default function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [defaultDay, setDefaultDay] = useState(1);
  const [savingImg, setSavingImg] = useState(false);
  const [savedImg, setSavedImg] = useState(false);

  const scheduleRef = useRef<HTMLDivElement>(null);
  const today = new Date().getDay();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listActivities();
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atividades.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const byDay = useMemo(() => {
    const map: Record<number, Activity[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    for (const a of activities) {
      (map[a.day_of_week] ??= []).push(a);
    }
    return map;
  }, [activities]);

  const total = activities.length;

  const openNew = (day: number) => {
    setEditing(null);
    setDefaultDay(day);
    setModalOpen(true);
  };

  const openEdit = (a: Activity) => {
    setEditing(a);
    setDefaultDay(a.day_of_week);
    setModalOpen(true);
  };

  const save = async (input: ActivityInput, id?: string) => {
    try {
      if (id) {
        await updateActivity(id, input);
      } else {
        await insertActivity(input);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar atividade.');
      return;
    }
    setModalOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    try {
      await deleteActivity(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir atividade.');
      return;
    }
    setModalOpen(false);
    await load();
  };

  const downloadSnapshot = async () => {
    if (!scheduleRef.current) return;
    setSavingImg(true);
    setSavedImg(false);
    try {
      const dataUrl = await toPng(scheduleRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8fafc',
      });
      const link = document.createElement('a');
      link.download = 'minha-semana.png';
      link.href = dataUrl;
      link.click();
      setSavedImg(true);
      setTimeout(() => setSavedImg(false), 2000);
    } catch (err) {
      setError('Não foi possível gerar a imagem.');
    } finally {
      setSavingImg(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <CalendarDays size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">Minha Semana</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {total} {total === 1 ? 'atividade' : 'atividades'} no total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadSnapshot}
              disabled={savingImg || loading || total === 0}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Salvar imagem da agenda"
            >
              {savedImg ? <Check size={18} className="text-emerald-600" /> : savingImg ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span className="hidden sm:inline">{savedImg ? 'Salvo!' : savingImg ? 'Gerando...' : 'Salvar imagem'}</span>
            </button>
            <button
              onClick={() => openNew(today)}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.98] transition shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nova atividade</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <div ref={scheduleRef}>
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-7 gap-3">
              {MONDAY_FIRST.map((d) => {
                const isToday = d === today;
                return (
                  <div key={d} className="flex flex-col">
                    <div className={`flex flex-col items-center justify-center py-2 mb-2 rounded-xl ${isToday ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                      <span className="text-xs uppercase tracking-wide font-medium opacity-70">{DAYS_SHORT[d]}</span>
                      <span className="text-base font-semibold">{DAYS[d]}</span>
                    </div>
                    <DayColumn day={d} items={byDay[d]} isToday={isToday} onAdd={openNew} onEdit={openEdit} />
                  </div>
                );
              })}
            </div>

            {/* Mobile list */}
            <div className="md:hidden space-y-4">
              {MONDAY_FIRST.map((d) => {
                const isToday = d === today;
                const items = byDay[d];
                return (
                  <section key={d}>
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-2 ${isToday ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                      <span className="font-semibold">{DAYS[d]} {isToday && <span className="text-xs font-normal opacity-70 ml-1">· hoje</span>}</span>
                      <button onClick={() => openNew(d)} className={`p-1.5 rounded-lg ${isToday ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <DayColumn day={d} items={items} isToday={isToday} onAdd={openNew} onEdit={openEdit} />
                  </section>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Cores:</span>
              {COLORS.map((c) => (
                <span key={c.key} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      <ActivityModal
        open={modalOpen}
        initial={editing}
        defaultDay={defaultDay}
        onClose={() => setModalOpen(false)}
        onSave={save}
        onDelete={remove}
      />
    </div>
  );
}

function DayColumn({
  day,
  items,
  isToday,
  onAdd,
  onEdit,
}: {
  day: number;
  items: Activity[];
  isToday: boolean;
  onAdd: (d: number) => void;
  onEdit: (a: Activity) => void;
}) {
  if (items.length === 0) {
    return (
      <button
        onClick={() => onAdd(day)}
        className="w-full min-h-[120px] rounded-xl border border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-white hover:text-slate-600 flex flex-col items-center justify-center gap-1 text-xs transition"
      >
        <Plus size={18} />
        Adicionar
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((a) => {
        const c = colorByKey(a.color);
        return (
          <button
            key={a.id}
            onClick={() => onEdit(a)}
            className={`group w-full text-left rounded-xl ${c.soft} border border-transparent hover:border-slate-200 hover:shadow-sm transition overflow-hidden`}
          >
            <div className={`h-1 w-full ${c.bar}`} />
            <div className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-slate-800 leading-snug">{a.title}</h3>
                <Pencil size={13} className="opacity-0 group-hover:opacity-100 text-slate-400 transition shrink-0 mt-0.5" />
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${c.text} bg-white/70 rounded-md px-2 py-1 w-fit`}>
                <Clock size={12} className="shrink-0" />
                <span className="tabular-nums">{a.start_time}</span>
                <span className="opacity-40">→</span>
                <span className="tabular-nums">{a.end_time}</span>
                <span className="opacity-30">·</span>
                <span>{formatDuration(a.start_time, a.end_time)}</span>
              </div>
              {a.description && (
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{a.description}</p>
              )}
            </div>
          </button>
        );
      })}
      <button
        onClick={() => onAdd(day)}
        className="w-full py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 hover:bg-white border border-dashed border-slate-200 transition flex items-center justify-center gap-1"
      >
        <Plus size={14} /> Adicionar
      </button>
    </div>
  );
}
