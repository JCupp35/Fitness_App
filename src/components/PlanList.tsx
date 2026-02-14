import PlanCard from '@/components/PlanCard';
import type { FitnessPlan } from '@/types/fitnessPlan';

interface PlanListProps {
  plans: FitnessPlan[];
  onUpdate: (id: string, partial: Partial<Pick<FitnessPlan, 'title' | 'notes'>>) => void;
  onDelete: (id: string) => void;
}

function PlanList({ plans, onUpdate, onDelete }: PlanListProps) {
  if (plans.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
        No plans yet. Fill out the form and click Generate Plan to create one.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default PlanList;
