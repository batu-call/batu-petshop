import { Suspense } from 'react';
import SuccessContent from './SuccessContent'; 



export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-white min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}