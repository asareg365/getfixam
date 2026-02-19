'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { DataTable } from '@/components/ui/data-table';
import { columns, EngagementColumn } from './columns';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export const EngagementClient = () => {
  const [engagements, setEngagements] = useState<EngagementColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'engagements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          createdAt: docData.createdAt.toDate(),
        } as EngagementColumn;
      });
      setEngagements(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Engagements (${engagements.length})`} description="Manage user requests and complaints" />
        <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
      </div>
      <DataTable columns={columns} data={engagements} searchKey="name" loading={loading} />
    </>
  );
};
