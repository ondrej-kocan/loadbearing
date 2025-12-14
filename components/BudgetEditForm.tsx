'use client';

import { useState } from 'react';

interface BudgetItem {
  id: string;
  area: string;
  description: string;
  plannedAmount: number;
  actualAmount: number | null;
}

interface BudgetEditFormProps {
  budgetItem: BudgetItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BudgetEditForm({ budgetItem, onSuccess, onCancel }: BudgetEditFormProps) {
  const [area, setArea] = useState(budgetItem.area);
  const [description, setDescription] = useState(budgetItem.description);
  const [plannedAmount, setPlannedAmount] = useState(budgetItem.plannedAmount.toString());
  const [actualAmount, setActualAmount] = useState(
    budgetItem.actualAmount !== null ? budgetItem.actualAmount.toString() : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/budget/${budgetItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          description,
          plannedAmount: parseFloat(plannedAmount),
          actualAmount: actualAmount ? parseFloat(actualAmount) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update budget item');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Edit Budget Item</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="edit-area" className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <input
            type="text"
            id="edit-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="edit-planned" className="block text-sm font-medium text-gray-700 mb-1">
              Planned Amount ($)
            </label>
            <input
              type="number"
              id="edit-planned"
              value={plannedAmount}
              onChange={(e) => setPlannedAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="edit-actual" className="block text-sm font-medium text-gray-700 mb-1">
              Actual Amount ($)
            </label>
            <input
              type="number"
              id="edit-actual"
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Optional</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
