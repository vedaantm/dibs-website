"use client";

import clsx from "clsx";
import { Upload } from "lucide-react";
import { useEffect, useId, useState } from "react";

/** Student ID photo: local preview only, the file never leaves the browser. */
export function IdDropzone({ onFile, done }: { onFile: (ok: boolean) => void; done: boolean }) {
  const id = useId();
  const [url, setUrl] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  const take = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    onFile(true);
  };

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files[0]);
        }}
        className={clsx(
          "flex min-h-28 cursor-pointer items-center gap-4 border border-dashed p-4 transition-colors duration-200",
          over ? "border-ink bg-bone" : "border-stone hover:border-ink",
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, never uploaded
          <img src={url} alt="Preview of your student ID" className="h-20 w-32 object-cover" />
        ) : (
          <Upload size={20} strokeWidth={1.25} aria-hidden className="shrink-0" />
        )}
        <span className="flex flex-col">
          <span className="label">{url ? "ID added" : done ? "Skipped for the demo" : "Photo of your NYU ID — front only"}</span>
          <span className="text-[12px] text-stone-deep">
            Drop an image or click to choose. Preview only: the file never leaves this browser.
          </span>
        </span>
        <input id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => take(e.target.files?.[0])} />
      </label>
    </div>
  );
}
