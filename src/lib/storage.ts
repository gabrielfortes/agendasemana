export type Activity = {
  id: string;
  title: string;
  description: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
  created_at: string;
};

export type ActivityInput = Omit<Activity, 'id' | 'created_at'>;

const STORAGE_KEY = 'agenda-semana:activities';

function readAll(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(activities: Activity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listActivities(): Promise<Activity[]> {
  const all = readAll();
  return [...all].sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export async function insertActivity(input: ActivityInput): Promise<Activity> {
  const all = readAll();
  const activity: Activity = {
    ...input,
    id: uid(),
    created_at: new Date().toISOString(),
  };
  all.push(activity);
  writeAll(all);
  return activity;
}

export async function updateActivity(id: string, input: ActivityInput): Promise<void> {
  const all = readAll();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Atividade não encontrada.');
  all[idx] = { ...all[idx], ...input };
  writeAll(all);
}

export async function deleteActivity(id: string): Promise<void> {
  const all = readAll().filter((a) => a.id !== id);
  writeAll(all);
}
