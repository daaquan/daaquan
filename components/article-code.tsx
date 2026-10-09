'use client';

import { useState } from 'react';
import type { BundledLanguage } from 'shiki';
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block';

export function ArticleCode({ code, language = 'typescript', filename, labels }: { code: string; language?: BundledLanguage; filename: string; labels: { copy: string; copied: string; failed: string } }) {
  const [status, setStatus] = useState('');
  return <div className="article-code">
    <div className="code-filename">{filename}</div>
    <CodeBlock code={code} language={language}>
      <CodeBlockCopyButton aria-label={labels.copy} onCopy={() => setStatus(labels.copied)} onError={() => setStatus(labels.failed)} />
    </CodeBlock>
    <p className="copy-status" aria-live="polite">{status}</p>
  </div>;
}
