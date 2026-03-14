// src/hooks/useProblems.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { ProblemTemplate } from '@/lib/types';

async function fetchProblems(): Promise<ProblemTemplate[]> {
  const { data, error } = await supabase
    .from('problems')
    .select('data')
    .order('grade');

  if (error) throw new Error(error.message);
  return (data ?? []).map((row: { data: ProblemTemplate }) => row.data);
}

/** Все шаблоны задач из Supabase */
export function useProblems() {
  return useQuery<ProblemTemplate[]>({
    queryKey: ['problems'],
    queryFn: fetchProblems,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

/** Шаблоны для конкретного класса и топика */
export function useProblemsByTopic(grade: number, topic: string) {
  return useQuery<ProblemTemplate[]>({
    queryKey: ['problems', grade, topic],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problems')
        .select('data')
        .eq('grade', grade)
        .eq('topic', topic);

      if (error) throw new Error(error.message);
      return (data ?? []).map((row: { data: ProblemTemplate }) => row.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}
