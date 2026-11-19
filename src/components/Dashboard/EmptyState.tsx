import { Boxes } from 'lucide-react';

const EmptyState = ({ message }: { message: string }) => (
  <div className="py-8 text-center">
    <Boxes size={26} className="mx-auto text-slate-300 mb-2" />

    <p className="text-sm text-slate-500">{message}</p>
  </div>
);

export default EmptyState;
