'use client';

import dynamic from 'next/dynamic';

const ProviderMap = dynamic(() => import('@/components/admin/provider-map'), { ssr: false });

export default ProviderMap;
