import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type PersonId = 'manan' | 'anushka' | undefined;

interface PersonTabsProps {
  value: PersonId;
  onChange: (value: PersonId) => void;
  className?: string;
}

const PERSONS = [
  { id: undefined, label: 'Aggregate' },
  { id: 'manan' as const, label: 'Manan' },
  { id: 'anushka' as const, label: 'Anushka' },
];

export function PersonTabs({ value, onChange, className }: PersonTabsProps) {
  return (
    <Tabs
      value={value ?? 'aggregate'}
      onValueChange={(v) => onChange(v === 'aggregate' ? undefined : (v as PersonId))}
      className={className}
    >
      <TabsList>
        {PERSONS.map(({ id, label }) => (
          <TabsTrigger key={id ?? 'aggregate'} value={id ?? 'aggregate'}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
