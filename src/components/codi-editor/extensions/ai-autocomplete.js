import { ChatCompletionModel } from '@mlc-ai/web-llm'

// Status constants
const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error'
}

// Manage model state
let aiStatus = STATUS.IDLE
let model = null
let isInitialized = false

// Event listeners to notify UI of model status changes
const statusListeners = []
const addStatusListener = (listener) => {
  statusListeners.push(listener)
}

const notifyStatusChange = (status) => {
  statusListeners.forEach(listener => listener(status))
}

/**
 * Initialize the AI model in the background
 */
export const initAIModel = async () => {
  if (isInitialized) return
  
  isInitialized = true
  aiStatus = STATUS.LOADING
  notifyStatusChange(aiStatus)
  
  try {
    model = new ChatCompletionModel({
      model_list: [{ model_url: 'Qwen2.5-Coder-3B-Instruct' }],
      chat_template: 'qwen'
    })

    // Begin loading the model
    await model.reload('Qwen2.5-Coder-3B-Instruct')
    
    aiStatus = STATUS.READY
    notifyStatusChange(aiStatus)
    console.log('AI model loaded successfully')
  } catch (error) {
    console.error('Error loading AI model:', error)
    aiStatus = STATUS.ERROR
    notifyStatusChange(aiStatus)
  }
}

/**
 * Get AI completion for the given text
 * @param {string} language - The language of the code
 * @param {string} text - The code to complete
 * @returns {Promise<string>} - The completion
 */
export const getAICompletion = async (language, text) => {
  if (aiStatus !== STATUS.READY || !model) {
    return ''
  }

  try {
    const prompt = `Complete the following ${language} code:\n\n${text}`
    
    const response = await model.generate(prompt, {
      max_tokens: 100,
      temperature: 0.2
    })
    
    return response.trim()
  } catch (error) {
    console.error('Error getting AI completion:', error)
    return ''
  }
}

/**
 * Register AI autocompletion providers for Monaco editor
 * @param {object} monaco - The Monaco editor instance
 */
export const registerAIAutoComplete = (monaco) => {
  // Initialize model loading in the background
  initAIModel()
  
  // Register for all supported languages
  const languages = ['html', 'css', 'javascript']
  
  languages.forEach(language => {
    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', ':', '<', ' ', '\n'],
      async provideCompletionItems(model, position) {
        // Only provide completions if model is ready
        if (aiStatus !== STATUS.READY) {
          return { suggestions: [] }
        }
        
        // Get the current line and text up to the cursor
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })
        
        // Get a few lines to provide context
        const lineCount = model.getLineCount()
        const startLine = Math.max(1, position.lineNumber - 5)
        const endLine = Math.min(lineCount, position.lineNumber + 5)
        
        const context = model.getValueInRange({
          startLineNumber: startLine,
          startColumn: 1,
          endLineNumber: endLine,
          endColumn: model.getLineMaxColumn(endLine)
        })
        
        // Get completion from AI
        const completion = await getAICompletion(language, context)
        
        if (!completion) {
          return { suggestions: [] }
        }
        
        // Create completion suggestion
        return {
          suggestions: [
            {
              label: completion.split('\n')[0] + '...',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: completion,
              detail: 'AI Suggestion',
              documentation: 'Suggestion from Qwen2.5-Coder-3B-Instruct model',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column
              }
            }
          ]
        }
      }
    })
  })
}

/**
 * Check if AI model is ready
 * @returns {boolean} - True if the model is ready, false otherwise
 */
export const isAIModelReady = () => aiStatus === STATUS.READY

/**
 * Get the current status of the AI model
 * @returns {string} - The current status
 */
export const getAIModelStatus = () => aiStatus

/**
 * Add a listener for AI model status changes
 * @param {function} listener - Function to call when status changes
 */
export { addStatusListener }