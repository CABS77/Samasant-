import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Brand({ className }: { className?: string }) {
  return <span className={cn('inline-flex items-center gap-2.5', className)}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
      <HeartPulse aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
    </span>
    <span className="text-xl font-semibold tracking-[-0.06em]">Sama<span className="text-primary">Santé</span><span className="ml-1 align-top text-[10px] font-bold tracking-normal text-muted-foreground">AI</span></span>
  </span>;
}
