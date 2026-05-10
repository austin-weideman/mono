export function AuthOrSeparator() {
  return (
    <div className="relative my-1 h-5 text-[13px]">
      <div className="border-chalk absolute inset-0 top-1/2 border-t" />
      <span className="bg-eggshell text-gravel relative mx-auto block w-fit px-3 tracking-[0.1em] uppercase">
        or
      </span>
    </div>
  );
}
