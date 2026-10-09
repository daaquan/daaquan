'use client';

import { useState } from 'react';
import type { BundledLanguage } from 'shiki';
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block';

export function ArticleCode({ code, language = 'typescript', filename }: { code: string; language?: BundledLanguage; filename: string }) {
  const [status, setStatus] = useState('');
  return <div className="article-code">
    <div className="code-filename">{filename}</div>
    <CodeBlock code={code} language={language}>
      <CodeBlockCopyButton aria-label="コードをコピー" onCopy={() => setStatus('コピーしました')} onError={() => setStatus('コピーできませんでした。コードを選択してコピーしてください。')} />
    </CodeBlock>
    <p className="copy-status" aria-live="polite">{status}</p>
  </div>;
}
