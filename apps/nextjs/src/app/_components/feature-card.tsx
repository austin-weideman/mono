interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="font-semibold text-sm">
        {icon} {title}
      </div>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  );
}

