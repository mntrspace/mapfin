import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type {
  ExpenseCategory,
  PaymentMethod,
  ReimbursementStatus,
  Tag,
  ExpenseFilterState,
} from '@/types';
import {
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  REIMBURSEMENT_STATUS_LABELS,
} from '@/constants';

interface ExpenseFiltersProps {
  filters: ExpenseFilterState;
  onFiltersChange: (filters: ExpenseFilterState) => void;
  paymentSpecifics: string[];
  availableTags: Tag[];
  onClearFilters: () => void;
}

// Multi-select dropdown component
function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
  getLabel,
}: {
  label: string;
  options: T[];
  selected: T[];
  onChange: (values: T[]) => void;
  getLabel: (value: T) => string;
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="relative">
        <Button
          variant="outline"
          className="w-full justify-between h-9 text-left font-normal"
          onClick={() => setOpen(!open)}
        >
          <span className="truncate">
            {selected.length === 0
              ? 'All'
              : selected.length === 1
              ? getLabel(selected[0])
              : `${selected.length} selected`}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 shrink-0 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-accent ${
                  selected.includes(option) ? 'bg-accent' : ''
                }`}
                onClick={() => toggleOption(option)}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => {}}
                  className="h-4 w-4"
                />
                <span>{getLabel(option)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExpenseFilters({
  filters,
  onFiltersChange,
  paymentSpecifics,
  availableTags,
  onClearFilters,
}: ExpenseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active filters
  const activeFilterCount =
    filters.categories.length +
    filters.paymentMethods.length +
    filters.paymentSpecifics.length +
    filters.tags.length +
    filters.reimbursementStatus.length +
    (filters.amountMin !== undefined ? 1 : 0) +
    (filters.amountMax !== undefined ? 1 : 0);

  const updateFilter = <K extends keyof ExpenseFilterState>(
    key: K,
    value: ExpenseFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const expenseCategories = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];
  const paymentMethods = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];
  const reimbursementStatuses = Object.keys(
    REIMBURSEMENT_STATUS_LABELS
  ) as ReimbursementStatus[];

  return (
    <div className="space-y-3">
      {/* Filter toggle button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Expanded filter panel */}
      {isExpanded && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category filter */}
            <MultiSelect
              label="Category"
              options={expenseCategories}
              selected={filters.categories}
              onChange={(values) => updateFilter('categories', values)}
              getLabel={(v) => EXPENSE_CATEGORY_LABELS[v]}
            />

            {/* Payment Method filter */}
            <MultiSelect
              label="Payment Method"
              options={paymentMethods}
              selected={filters.paymentMethods}
              onChange={(values) => updateFilter('paymentMethods', values)}
              getLabel={(v) => PAYMENT_METHOD_LABELS[v]}
            />

            {/* Payment Specifics filter */}
            <MultiSelect
              label="Payment Specifics"
              options={paymentSpecifics}
              selected={filters.paymentSpecifics}
              onChange={(values) => updateFilter('paymentSpecifics', values)}
              getLabel={(v) => v || '(empty)'}
            />

            {/* Tags filter */}
            <MultiSelect
              label="Tags"
              options={availableTags.map((t) => t.id)}
              selected={filters.tags}
              onChange={(values) => updateFilter('tags', values)}
              getLabel={(id) => availableTags.find((t) => t.id === id)?.name || id}
            />

            {/* Amount range */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Amount Range (INR)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="h-9"
                  value={filters.amountMin ?? ''}
                  onChange={(e) =>
                    updateFilter(
                      'amountMin',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="h-9"
                  value={filters.amountMax ?? ''}
                  onChange={(e) =>
                    updateFilter(
                      'amountMax',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            {/* Reimbursement Status filter */}
            <MultiSelect
              label="Reimbursement Status"
              options={reimbursementStatuses}
              selected={filters.reimbursementStatus}
              onChange={(values) => updateFilter('reimbursementStatus', values)}
              getLabel={(v) => REIMBURSEMENT_STATUS_LABELS[v]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
