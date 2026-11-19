import { AlertTriangle } from 'lucide-react';

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6">
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
      <div className="flex items-center gap-2 text-rose-700">
        <AlertTriangle size={18} />

        <h3 className="text-sm font-bold">Unable to load dashboard</h3>
      </div>

      <p className="text-xs text-rose-600 mt-2">{message}</p>
    </div>
  </div>
);

export default ErrorState;
