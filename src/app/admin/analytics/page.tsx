'use client';

import { Search, Filter, Download } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const dummyData = [
    { id: 1, name: 'Kwame Electric', category: 'Electrician', rating: 4.8, jobs: 42, status: 'Active' },
    { id: 2, name: 'Ama Plumbing', category: 'Plumber', rating: 4.5, jobs: 31, status: 'Active' },
    { id: 3, name: 'Kofi Auto Works', category: 'Mechanic', rating: 4.9, jobs: 56, status: 'Active' },
    { id: 4, name: 'Yaw Carpentry', category: 'Carpenter', rating: 4.2, jobs: 18, status: 'Inactive' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Artisan Analytics</h1>
          <p className="text-muted-foreground">Monitor provider performance and engagement.</p>
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/5">
                <th className="p-4 border-b text-sm font-semibold">Artisan Name</th>
                <th className="p-4 border-b text-sm font-semibold">Category</th>
                <th className="p-4 border-b text-sm font-semibold text-center">Rating</th>
                <th className="p-4 border-b text-sm font-semibold text-center">Total Jobs</th>
                <th className="p-4 border-b text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item) => (
                <tr key={item.id} className="hover:bg-muted/5 transition-colors">
                  <td className="p-4 border-b text-sm font-medium">{item.name}</td>
                  <td className="p-4 border-b text-sm text-muted-foreground">{item.category}</td>
                  <td className="p-4 border-b text-sm text-center font-mono">{item.rating}</td>
                  <td className="p-4 border-b text-sm text-center font-mono">{item.jobs}</td>
                  <td className="p-4 border-b text-sm">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}