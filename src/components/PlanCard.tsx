import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { FitnessPlan } from '@/types/fitnessPlan';

interface PlanCardProps {
  plan: FitnessPlan;
  onUpdate: (id: string, partial: Partial<Pick<FitnessPlan, 'title' | 'notes'>>) => void;
  onDelete: (id: string) => void;
}

function PlanCard({ plan, onUpdate, onDelete }: PlanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(plan.title);
  const [draftNotes, setDraftNotes] = useState(plan.notes);

  useEffect(() => {
    setDraftTitle(plan.title);
    setDraftNotes(plan.notes);
  }, [plan.title, plan.notes]);

  const handleSave = () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      return;
    }

    onUpdate(plan.id, {
      title: nextTitle,
      notes: draftNotes.trim(),
    });
    setIsEditing(false);
  };

  const createdDate = new Date(plan.createdAt).toLocaleDateString();

  return (
    <Card className="rounded-2xl border-slate-200 bg-slate-50">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="min-w-0 space-y-2">
          {isEditing ? (
            <div>
              <Label
                htmlFor={`title-${plan.id}`}
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Plan title
              </Label>
              <Input
                id={`title-${plan.id}`}
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
              />
            </div>
          ) : (
            <CardTitle className="truncate text-lg font-bold text-slate-900">{plan.title}</CardTitle>
          )}
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-500">Created {createdDate}</p>
            <Badge variant="outline">{plan.days.length}-day split</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button type="button" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setDraftTitle(plan.title);
                  setDraftNotes(plan.notes);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onDelete(plan.id)}
          >
            Delete
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {plan.days.map((dayPlan) => (
          <section
            key={`${plan.id}-${dayPlan.day}`}
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <h4 className="text-sm font-semibold text-slate-900">
              {dayPlan.day}: {dayPlan.focus}
            </h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {dayPlan.exercises.map((exercise) => (
                <li key={exercise}>{exercise}</li>
              ))}
            </ul>
          </section>
        ))}
      </CardContent>

      <CardFooter className="block">
        <Separator className="mb-4" />
        {isEditing ? (
          <div>
            <Label
              htmlFor={`notes-${plan.id}`}
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Plan notes
            </Label>
            <Textarea
              id={`notes-${plan.id}`}
              rows={3}
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Notes:</span> {plan.notes}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

export default PlanCard;
