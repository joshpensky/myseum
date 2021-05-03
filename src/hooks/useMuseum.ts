import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Museum } from '@prisma/client';
import { supabase } from '@src/data/supabase';

export const useMuseum = <T extends Museum>(initialData: T) => {
  const router = useRouter();

  const [museum, setMuseum] = useState(initialData);

  useEffect(() => {
    const subscription = supabase
      .from(`museums:id=eq.${museum.id}`)
      .on('UPDATE', payload => {
        console.log(payload);
        setMuseum(museum => ({
          ...museum,
          ...payload.new,
        }));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [museum.id, router.pathname]);

  return museum;
};
