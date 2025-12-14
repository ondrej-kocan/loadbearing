'use client';

import { useState, useEffect } from 'react';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';

interface Project {
  id: string;
  name: string;
  startDate: string;
}

interface BudgetItem {
  id: string;
  area: string;
  description: string;
  plannedAmount: number;
  actualAmount: number | null;
  createdAt: string;
}

interface BudgetPageProps {
  project: Project;
}

export default function BudgetPage({ project }: BudgetPageProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBudgetItems = async () => {
    try {
      const response = await fetch(`/api/budget?projectId=${project.id}`);
      const data = await response.json();
      if (response.ok) {
        setBudgetItems(data.budgetItems);
      }
    } catch (error) {
      console.error('Error fetching budget items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetItems();
  }, [project.id]);

  const handleBudgetSuccess = () => {
    setShowBudgetForm(false);
    fetchBudgetItems();
  };

  // Calculate budget totals
  const budgetPlanned = budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0);
  const budgetActual = budgetItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track planned and actual costs by area
          </p>
        </div>
        {!showBudgetForm && (
          <button
            onClick={() => setShowBudgetForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            + Add Budget Item
          </button>
        )}
      </div>

      {/* Budget Summary */}
      {budgetItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Total Planned</h2>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(budgetPlanned)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Total Spent</h2>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(budgetActual)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Remaining</h2>
            <p className={`text-3xl font-bold ${budgetPlanned - budgetActual >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              {formatCurrency(budgetPlanned - budgetActual)}
            </p>
          </div>
        </div>
      )}

      {showBudgetForm && (
        <div className="mb-6">
          <BudgetForm
            projectId={project.id}
            onSuccess={handleBudgetSuccess}
            onCancel={() => setShowBudgetForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading budget items...</p>
        </div>
      ) : budgetItems.length > 0 ? (
        <BudgetList
          budgetItems={budgetItems}
          onBudgetDeleted={fetchBudgetItems}
        />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No budget items yet</p>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Add your first budget item
          </button>
        </div>
      )}
    </div>
  );
}
