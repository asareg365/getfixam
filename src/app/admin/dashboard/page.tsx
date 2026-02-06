import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Link 
          href="/admin/providers" 
          style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Total Providers</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Click to manage all artisans</div>
        </Link>

        <Link 
          href="/admin/providers?status=pending" 
          style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Pending</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Review new submissions</div>
        </Link>

        <Link 
          href="/admin/jobs" 
          style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Total Requests</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Monitor live service jobs</div>
        </Link>

        <Link 
          href="/admin/services" 
          style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Services</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Update categories and prices</div>
        </Link>
      </div>
    </div>
  );
}