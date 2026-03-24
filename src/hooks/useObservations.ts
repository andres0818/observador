import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { subDays, startOfDay } from 'date-fns';

export type ObservationType = 'positive' | 'negative';

export interface Observation {
  id: string;
  memberId: string;
  type: ObservationType;
  comment?: string;
  timestamp: Timestamp;
}

export const MEMBERS = [
  { id: 'la_ratica99', name: 'la ratica99' },
  { id: 'ferilo12', name: 'ferilo12' },
  { id: 'derek', name: 'Derek' },
  { id: 'andres', name: 'Andrés' },
];

export const useObservations = (filterDays: number | null) => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q;
    
    if (filterDays !== null) {
      const dateLimit = startOfDay(subDays(new Date(), filterDays));
      q = query(
        collection(db, 'observations'),
        where('timestamp', '>=', Timestamp.fromDate(dateLimit)),
        orderBy('timestamp', 'desc')
      );
    } else {
      q = query(
        collection(db, 'observations'),
        orderBy('timestamp', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const obsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Observation[];
      setObservations(obsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching observations:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterDays]);

  return { observations, loading };
};

export const addObservation = async (memberId: string, type: ObservationType, comment?: string) => {
  try {
    await addDoc(collection(db, 'observations'), {
      memberId,
      type,
      comment: comment || '',
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding observation:", error);
    throw error;
  }
};
