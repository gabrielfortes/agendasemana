export type ColorKey =
  | 'sky'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'orange'
  | 'teal';

export const COLORS: { key: ColorKey; label: string; dot: string; bar: string; chip: string; soft: string; text: string }[] = [
  { key: 'sky', label: 'Azul', dot: 'bg-sky-500', bar: 'bg-sky-500', chip: 'bg-sky-100 text-sky-700', soft: 'bg-sky-50', text: 'text-sky-700' },
  { key: 'emerald', label: 'Verde', dot: 'bg-emerald-500', bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700', soft: 'bg-emerald-50', text: 'text-emerald-700' },
  { key: 'amber', label: 'Âmbar', dot: 'bg-amber-500', bar: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700', soft: 'bg-amber-50', text: 'text-amber-700' },
  { key: 'rose', label: 'Rosa', dot: 'bg-rose-500', bar: 'bg-rose-500', chip: 'bg-rose-100 text-rose-700', soft: 'bg-rose-50', text: 'text-rose-700' },
  { key: 'orange', label: 'Laranja', dot: 'bg-orange-500', bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700', soft: 'bg-orange-50', text: 'text-orange-700' },
  { key: 'teal', label: 'Turquesa', dot: 'bg-teal-500', bar: 'bg-teal-500', chip: 'bg-teal-100 text-teal-700', soft: 'bg-teal-50', text: 'text-teal-700' },
];

export const colorByKey = (key: string) =>
  COLORS.find((c) => c.key === key) ?? COLORS[0];

export const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;
export const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
