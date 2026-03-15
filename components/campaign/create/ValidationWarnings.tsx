import { AlertTriangle } from "lucide-react";

interface ValidationWarningsProps {
  errors: string[];
  visible: boolean;
}

export function ValidationWarnings({ errors, visible }: ValidationWarningsProps) {
  if (!visible || errors.length === 0) return null;

  return (
    <div className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
      <p className="font-semibold mb-1 flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5" />
        Lưu ý:
      </p>
      <ul className="list-disc list-inside space-y-0.5">
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
}
