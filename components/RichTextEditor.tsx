import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
      editorRef.current.innerHTML = initialValue;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput(); // Trigger update
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-2 items-center">
        <button onClick={() => execCmd('bold')} className="p-1.5 hover:bg-slate-200 rounded font-bold" title="מודגש">B</button>
        <button onClick={() => execCmd('italic')} className="p-1.5 hover:bg-slate-200 rounded italic" title="נטוי">I</button>
        <button onClick={() => execCmd('underline')} className="p-1.5 hover:bg-slate-200 rounded underline" title="קו תחתון">U</button>
        
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        
        <select onChange={(e) => execCmd('formatBlock', e.target.value)} className="p-1 border rounded text-sm bg-white">
          <option value="p">פסקה</option>
          <option value="h2">כותרת בינונית</option>
          <option value="h3">כותרת קטנה</option>
        </select>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <button onClick={() => execCmd('justifyRight')} className="p-1.5 hover:bg-slate-200 rounded" title="יישור לימין">➡️</button>
        <button onClick={() => execCmd('justifyCenter')} className="p-1.5 hover:bg-slate-200 rounded" title="מרכוז">↔️</button>
        <button onClick={() => execCmd('justifyLeft')} className="p-1.5 hover:bg-slate-200 rounded" title="יישור לשמאל">⬅️</button>

        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        
        {/* Colors */}
        <input 
          type="color" 
          onChange={(e) => execCmd('foreColor', e.target.value)} 
          className="w-8 h-8 cursor-pointer p-0 border-0"
          title="צבע טקסט"
        />

        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        <button 
          onClick={() => {
            const url = prompt('הכנס קישור לתמונה:');
            if(url) execCmd('insertImage', url);
          }} 
          className="p-1.5 hover:bg-slate-200 rounded text-sm"
          title="הוסף תמונה מקישור"
        >
          🖼️ תמונה
        </button>
        
        <button 
          onClick={() => {
            const url = prompt('הכנס קישור (URL):');
            if(url) execCmd('createLink', url);
          }} 
          className="p-1.5 hover:bg-slate-200 rounded text-sm"
          title="הוסף קישור"
        >
          🔗 קישור
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[250px] outline-none text-right prose prose-slate max-w-none"
        dir="rtl"
        style={{ direction: 'rtl' }}
      ></div>
    </div>
  );
};