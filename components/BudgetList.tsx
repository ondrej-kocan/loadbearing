'use client';

import { useState } from 'react';

interface BudgetItem {
  id: string;
  area: string;
  description: string;
  plannedAmount: number;
  actualAmount: number | null;
  createdAt: string;
}

interface BudgetListProps {
  budgetItems: BudgetItem[];
  onBudgetDeleted: () => void;
}

export default function BudgetList({ budgetItems, onBudgetDeleted }: BudgetListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this budget item?')) {
      return;
    }

    setDeletingId(itemId);

    try {
      const response = await fetch(`/api/budget/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget item');
      }

      onBudgetDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete budget item');
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Group budget items by area
  const itemsByArea = budgetItems.reduce((acc, item) => {
    if (!acc[item.area]) {
      acc[item.area] = [];
    }
    acc[item.area].push(item);
    return acc;
  }, {} as Record<string, BudgetItem[]>);

  // Calculate totals by area
  const areaTotals = Object.entries(itemsByArea).map(([area, items]) => {
    const planned = items.reduce((sum, item) => sum + item.plannedAmount, 0);
    const actual = items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
    return { area, planned, actual, items };
  });

  if (budgetItems.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">No budget items yet. Add your first budget item to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {areaTotals.map(({ area, planned, actual, items }) => (
        <div key={area} className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Area Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{area}</h3>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-500">Planned: </span>
                <span className="font-semibold text-gray-900">{formatCurrency(planned)}</span>
              </div>
              <div>
                <span className="text-gray-500">Actual: </span>
                <span className="font-semibold text-green-600">{formatCurrency(actual)}</span>
              </div>
            </div>
          </div>

          {/* Budget Items */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {formatCurrency(item.plannedAmount)}
                    </div>
                    {item.actualAmount !== null && (
                      <div className="text-xs text-green-600">
                        {formatCurrency(item.actualAmount)} actual
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
