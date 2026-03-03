import { useRef, type FC } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const RichTextEditor: FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '내용을 입력하세요...',
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${disabled ? 'opacity-60' : ''}`}>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={(content) => {
          onChange(content);
        }}
        disabled={disabled}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            'lists', 'link', 'image', 'charmap',
            'preview', 'searchreplace', 'fullscreen',
            'media', 'table', 'code',
          ],
          toolbar:
            'undo redo | blocks | ' +
            'bold italic underline | alignleft aligncenter alignright | ' +
            'bullist numlist | link image | ' +
            'removeformat',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }',
          placeholder,
          branding: false,
          statusbar: false,
          language: 'ko_KR',
          // 한국어 없을 수 있으므로 fallback
          language_url: '',
        }}
      />
    </div>
  );
};
