import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { expensesApi } from '@/lib/api';
import { usePeople, useTags } from '@/hooks/useSheetData';
import { useSettings } from '@/contexts/SettingsContext';
import { TagMultiSelect } from '@/components/shared/TagMultiSelect';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CURRENCY_LABELS,
  PAYMENT_METHOD_LABELS,
  REIMBURSEMENT_STATUS_LABELS,
} from '@/constants';
import type { ExpenseCategory, ExpenseCurrency, PaymentMethod, ReimbursementStatus, Tag } from '@/types';
import { Loader2 } from 'lucide-react';

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddExpenseModal({ open, onOpenChange, onSuccess }: AddExpenseModalProps) {
  const { data: people } = usePeople();
  const { tags: availableTags, createTag } = useTags();
  const { settings } = useSettings();

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food_dining');
  const [currency, setCurrency] = useState<ExpenseCurrency>('INR');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentSpecifics, setPaymentSpecifics] = useState('');
  const [personId, setPersonId] = useState('manan');
  const [reimbursementStatus, setReimbursementStatus] = useState<ReimbursementStatus>('none');
  const [remarks, setRemarks] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate INR amount when currency or amount changes
  const getInrAmount = (): number => {
    const parsedAmount = parseFloat(amount) || 0;
    if (currency === 'INR') {
      return parsedAmount;
    }
    // Use exchange rate from settings (USD to INR) as base
    // For other currencies, use approximate conversion rates
    const rates: Record<ExpenseCurrency, number> = {
      INR: 1,
      USD: settings.exchangeRate,
      AED: settings.exchangeRate / 3.67, // AED is pegged to USD
      EUR: settings.exchangeRate * 1.08, // Approximate EUR to USD
      GBP: settings.exchangeRate * 1.27, // Approximate GBP to USD
    };
    return parsedAmount * rates[currency];
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setCategory('food_dining');
    setCurrency('INR');
    setAmount('');
    setPaymentMethod('upi');
    setPaymentSpecifics('');
    setPersonId('manan');
    setReimbursementStatus('none');
    setRemarks('');
    setSelectedTags([]);
    setError(null);
  };

  const handleCreateTag = async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
    const result = await createTag(tag);
    return result.data as Tag;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const inrAmount = getInrAmount();
      await expensesApi.create({
        date,
        description: description.trim(),
        category,
        currency,
        currency_amount: parseFloat(amount),
        inr_amount: inrAmount,
        payment_method: paymentMethod,
        payment_specifics: paymentSpecifics.trim(),
        person_id: personId,
        reimbursement_status: reimbursementStatus,
        remarks: remarks.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Show converted amount hint for non-INR currencies
  const showConversionHint = currency !== 'INR' && amount && parseFloat(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record a new transaction. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Date - full width on mobile */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Description - full width */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., Swiggy dinner"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Currency + Amount - side by side */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as ExpenseCurrency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPENSE_CURRENCY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Conversion hint */}
            {showConversionHint && (
              <p className="text-xs text-muted-foreground -mt-2">
                ≈ ₹{getInrAmount().toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR
              </p>
            )}

            {/* Category - full width on mobile, side by side on larger */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method + Payment Specifics - side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentSpecifics">Payment Specifics</Label>
                <Input
                  id="paymentSpecifics"
                  placeholder="e.g., Axis Ace, GPay"
                  value={paymentSpecifics}
                  onChange={(e) => setPaymentSpecifics(e.target.value)}
                />
              </div>
            </div>

            {/* Person + Reimbursement Status - side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="person">Person</Label>
                <Select value={personId} onValueChange={setPersonId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {people.length > 0 ? (
                      people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="manan">Manan</SelectItem>
                        <SelectItem value="anushka">Anushka</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reimbursement">Reimbursement</Label>
                <Select value={reimbursementStatus} onValueChange={(v) => setReimbursementStatus(v as ReimbursementStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REIMBURSEMENT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Remarks - full width */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Any additional notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
              />
            </div>

            {/* Tags - full width */}
            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <TagMultiSelect
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                onCreateTag={handleCreateTag}
                placeholder="Add tags..."
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Expense'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
