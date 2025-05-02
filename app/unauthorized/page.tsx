import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: 'Unauthorized Access',
  description: 'You are not authorized to access this page',
}

export default function Unauthorized() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center space-y-4 h-[calc(100vh-200px)]">
      <h1 className="text-4xl h1-bold">Unauthorized Access</h1>
      <p className="text-muted-foreground">You do not have permission to access this page.</p>
      <Button asChild>
        <Link href="/">Go to Home</Link>
      </Button>
    </div>
  )
}



