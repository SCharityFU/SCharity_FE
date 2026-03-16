import { AlertTriangle } from 'lucide-react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import type { CreateCampaignFormValues } from '@/components/campaign/create/schema';

export function ValidationWarnings() {
  const { control } = useFormContext<CreateCampaignFormValues>();
  const { errors } = useFormState({ control });
  const title = useWatch({ control, name: 'title' }) ?? '';

  const warningErrors = [
    errors.title?.message,
    errors.goalAmount?.message,
    errors.deadline?.message,
    errors.story?.message,
    errors.bankName?.message,
    errors.accountNumber?.message,
    errors.accountHolderName?.message,
  ].filter((msg): msg is string => Boolean(msg));

  if (title.trim().length === 0 || warningErrors.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
      <p className="mb-1 flex items-center gap-1 font-semibold">
        <AlertTriangle className="h-3.5 w-3.5" />
        Lưu ý:
      </p>
      <ul className="list-inside list-disc space-y-0.5">
        {warningErrors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
}
