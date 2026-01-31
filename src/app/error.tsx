'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in a real app
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                 <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-headline mt-4">Oops! Something went wrong.</CardTitle>
                <CardDescription>
                    We encountered an unexpected issue. Please try again.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* For developers: show error details in development */}
                {process.env.NODE_ENV === 'development' && (
                     <div className="bg-muted p-3 rounded-md text-left text-xs">
                        <p className="font-bold">Error Details:</p>
                        <p className="font-mono mt-1">{error.message}</p>
                    </div>
                )}
                <div className="flex justify-center gap-4">
                    <Button onClick={() => reset()}>
                        Try Again
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">Go to Homepage</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
