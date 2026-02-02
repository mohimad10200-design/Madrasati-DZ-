
import React from 'react';
import { DocumentState } from '../types';

interface Props {
  doc: DocumentState;
}

export const DocumentPreview: React.FC<Props> = ({ doc }) => {
  const getTemplateStyles = () => {
    switch (doc.template) {
      case 'modern':
        return {
          container: "bg-white min-h-[1056px] shadow-2xl flex flex-col font-sans",
          header: "relative h-64 bg-slate-900 overflow-hidden",
          contentArea: "p-12 -mt-16 bg-white mx-8 rounded-xl shadow-lg relative z-10 mb-8",
          title: "text-4xl font-black text-slate-800 mb-2 leading-tight",
          subtitle: "text-xl text-blue-600 font-medium mb-6",
          body: "text-slate-700 leading-relaxed text-lg whitespace-pre-wrap space-y-4",
          button: "inline-block mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-blue-200 transition-all",
          footer: "mt-auto p-8 bg-slate-50 border-t border-slate-100 flex justify-between text-slate-400 text-xs"
        };
      case 'tech':
        return {
          container: "bg-slate-950 text-slate-100 min-h-[1056px] shadow-2xl flex flex-col",
          header: "h-80 relative border-b border-slate-800",
          contentArea: "p-12 flex-grow",
          title: "text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4",
          subtitle: "text-2xl text-slate-400 font-light mb-8",
          body: "text-slate-300 leading-relaxed text-lg whitespace-pre-wrap border-l-2 border-slate-800 pl-6",
          button: "inline-block mt-10 border-2 border-cyan-500 text-cyan-400 px-8 py-3 rounded-lg font-mono uppercase tracking-widest",
          footer: "p-8 text-center text-slate-600 font-mono text-xs uppercase"
        };
      case 'creative':
        return {
          container: "bg-[#fffdf5] min-h-[1056px] shadow-2xl border-[16px] border-orange-100 flex flex-col",
          header: "p-12 text-center",
          contentArea: "px-16 py-4 flex-grow",
          title: "text-5xl font-serif text-orange-900 mb-2 italic",
          subtitle: "text-xl text-orange-600 font-medium mb-8 uppercase tracking-widest",
          body: "text-slate-800 leading-loose text-xl whitespace-pre-wrap italic",
          button: "inline-block mt-8 bg-orange-500 text-white px-10 py-4 rounded-xl font-bold rotate-1 shadow-xl",
          footer: "p-12 text-orange-200 text-sm italic text-center"
        };
      case 'professional':
      default:
        return {
          container: "bg-white min-h-[1056px] shadow-xl border-t-[20px] border-indigo-900 flex flex-col",
          header: "p-16 pb-8 border-b border-slate-100",
          contentArea: "p-16 pt-10 flex-grow",
          title: "text-4xl font-bold text-slate-900 mb-2",
          subtitle: "text-lg text-slate-500 mb-6",
          body: "text-slate-800 leading-relaxed text-lg whitespace-pre-wrap",
          button: "inline-block mt-12 bg-indigo-900 text-white px-10 py-4 font-semibold uppercase tracking-wider",
          footer: "p-10 border-t border-slate-50 text-slate-400 text-sm flex justify-between"
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div id="document-content" className={styles.container}>
      {doc.imageUrl && (
        <div className={styles.header}>
          <img src={doc.imageUrl} className="w-full h-full object-cover opacity-80" alt="header" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
      )}
      
      {!doc.imageUrl && doc.template === 'tech' && (
        <div className={styles.header}>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        </div>
      )}

      <div className={styles.contentArea}>
        <h1 className={styles.title}>{doc.title || 'عنوان المستند الاحترافي'}</h1>
        <p className={styles.subtitle}>{doc.subtitle}</p>
        
        <div className="flex gap-4 mb-8 no-print text-sm opacity-60">
           <span>✍️ {doc.author || 'اسم الكاتب'}</span>
           <span>📅 {doc.date}</span>
        </div>

        <main className={styles.body}>
          {doc.content || 'سيظهر المحتوى هنا بعد كتابة الوصف...'}
        </main>

        {doc.ctaText && (
          <div className="text-center mt-8">
            <span className={styles.button}>
              {doc.ctaText}
            </span>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <span>Smart AI PDF Generator © 2025</span>
        <span className="font-bold">{doc.author || 'Official Document'}</span>
      </footer>
    </div>
  );
};
