"use client";

import React from "react";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = React.useState<string>("");

  const headings = React.useMemo(() => {
    const matches = content.match(/^#{2,3}\s.+/gm) || [];
    return matches.map((h) => {
      const level = h.startsWith("###") ? 3 : 2;
      const text = h.replace(/^#{2,3}\s/, "");
      const id = slugify(text);
      return { level, text, id };
    });
  }, [content]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" },
    );

    headings.forEach((h) => {
      const element = document.getElementById(h.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1 text-sm">
      <p className="text-foreground mb-3 pl-2 font-semibold">On this page</p>
      {headings.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`block border-l-2 py-1.5 transition-colors ${
            activeId === item.id
              ? "border-primary text-primary font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent"
          } ${item.level === 3 ? "pl-6" : "pl-3"}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({
              behavior: "smooth",
            });
            setActiveId(item.id);
          }}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
