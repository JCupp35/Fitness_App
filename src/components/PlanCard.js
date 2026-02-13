import { useEffect, useState } from 'react';

function PlanCard({ plan, onUpdate, onDelete }) {
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
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {isEditing ? (
            <div>
              <label
                htmlFor={`title-${plan.id}`}
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Plan title
              </label>
              <input
                id={`title-${plan.id}`}
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-700 focus:outline-none"
              />
            </div>
          ) : (
            <h3 className="truncate text-lg font-bold text-slate-900">{plan.title}</h3>
          )}
          <p className="mt-1 text-xs text-slate-500">Created {createdDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftTitle(plan.title);
                  setDraftNotes(plan.notes);
                  setIsEditing(false);
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(plan.id)}
            className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="space-y-3">
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
      </div>

      <footer className="mt-4">
        {isEditing ? (
          <div>
            <label
              htmlFor={`notes-${plan.id}`}
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Plan notes
            </label>
            <textarea
              id={`notes-${plan.id}`}
              rows={3}
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-700 focus:outline-none"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Notes:</span> {plan.notes}
          </p>
        )}
      </footer>
    </article>
  );
}

export default PlanCard;
