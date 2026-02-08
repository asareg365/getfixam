'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { Search, Filter, Download, Loader2, Inbox } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtisans() {
      try {
        // Fetch top 10 artisans for performance monitoring
        const q = query(collection(db, 'providers'), orderBy('rating', 'desc'), limit(10));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArtisans(data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchArtisans();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Artisan Analytics</h1>
          <p className="text-muted-foreground">Monitor provider performance and engagement based on real data.</p>
        </div>
        <button className="h-10 px-4 bg-primary text-white rounded-md text-sm font-medium flex items-center justify-center">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/10 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              className="w-full h-10 pl-10 pr-4 rounded-md border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search artisans..."
            />
          </div>
          <div className="flex gap-2">
            <button className="h-10 px-3 border rounded-md flex items-center text-sm font-medium hover:bg-muted/50">
              <Filter className="mr-2 h-4 w-4" />
              Category
            </button>
            <button className="h-10 px-3 border rounded-md flex items-center text-sm font-medium hover:bg-muted/50">
              Status
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : artisans.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/5">
                  <th className="p-4 border-b text-sm font-semibold">Artisan Name</th>
                  <th className="p-4 border-b text-sm font-semibold">Category</th>
                  <th className="p-4 border-b text-sm font-semibold text-center">Rating</th>
                  <th className="p-4 border-b text-sm font-semibold text-center">Reviews</th>
                  <th className="p-4 border-b text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {artisans.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b text-sm font-medium">{item.name}</td>
                    <td className="p-4 border-b text-sm text-muted-foreground">{item.category || 'N/A'}</td>
                    <td className="p-4 border-b text-sm text-center font-mono">{item.rating?.toFixed(1) || '0.0'}</td>
                    <td className="p-4 border-b text-sm text-center font-mono">{item.reviewCount || 0}</td>
                    <td className="p-4 border-b text-sm">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">No artisan data found.</p>
              <p className="text-sm">Once artisans are approved, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
