import Image from "next/image";

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] w-full flex-col items-center justify-center py-10">
      <Image
        src="/skeletonHorse.gif"
        alt="Đang tải..."
        width={200}
        height={200}
        unoptimized
        className="object-contain"
      />
      <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
        Đang tải...
      </p>
    </main>
  );
}
