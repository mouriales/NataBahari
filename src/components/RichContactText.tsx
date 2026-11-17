import { ArrowUpRight } from 'lucide-react';
import { parseRichContactText } from '../utils/richLinks';

interface RichContactTextProps {
  text: string;
  className?: string;
}

export function RichContactText({ text, className = '' }: RichContactTextProps) {
  const segments = parseRichContactText(text);

  return (
    <p className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'link' && seg.href) {
          return (
            <a
              key={`${seg.href}-${idx}`}
              href={seg.href}
              target={seg.isExternal ? '_blank' : undefined}
              rel={seg.isExternal ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-0.5 font-medium text-[#0F4C81] underline decoration-[#0F4C81]/35 underline-offset-4 hover:decoration-[#0F4C81] hover:text-[#0B3961] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
            >
              <span>{seg.content}</span>
              {seg.isExternal && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            </a>
          );
        }
        return <span key={idx}>{seg.content}</span>;
      })}
    </p>
  );
}
