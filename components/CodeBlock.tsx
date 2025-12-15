import React from 'react';

interface CodeBlockProps {
  title: string;
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, code, language = 'sql' }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-lg my-4">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">{language}</span>
        <span className="text-xs font-medium text-slate-400">{title}</span>
      </div>
      <pre className="p-4 text-sm font-mono text-slate-50 overflow-x-auto code-scroll leading-relaxed">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;