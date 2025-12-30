interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-muted/50 p-4">
      <div className="flex items-center gap-2 font-medium text-sm">
        <span className="text-base">{icon}</span>
        <span>{title}</span>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </div>
  );
}

