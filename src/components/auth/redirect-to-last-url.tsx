'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const RedirectToLastVistedUrl = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            const lastVisitedUrl = localStorage.getItem('lastVisitedUrl');

            if (lastVisitedUrl) {
                // Clear the stored URL after using it
                localStorage.removeItem('lastVisitedUrl');
                router.push(lastVisitedUrl);
            }
        }
    }, [router, isClient]);

    return null; // This component doesn't render anything
};

export default RedirectToLastVistedUrl;
