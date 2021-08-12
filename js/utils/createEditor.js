import { editor } from "monaco-editor";

const COMMON_EDITOR_OPTIONS = {
  automaticLayout: true,
  fontSize: 18,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16,
  },
  lineNumbers: false,
  minimap: {
    enabled: false,
  },
  theme: "vs-dark",
};

export default function createEditor(element, language, value) {
  return editor.create(element, {
    value,
    language,
    ...COMMON_EDITOR_OPTIONS,
  });
}
