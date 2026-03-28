'use client'

import { useStore } from '@/store'
import { 
  File, 
  Folder, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  ExternalLink,
  Code2,
  Layout,
  FileCode,
  Terminal,
  FolderOpen,
  MessageSquare,
  Save,
  Send,
  Edit2,
  Check
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Canvas() {
  const { 
    canvasFiles, 
    currentCanvasPath, 
    selectCanvasFile, 
    showCanvas, 
    toggleCanvas,
    upsertCanvasFile,
    theme 
  } = useStore()

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState('')
  const [showInternalChat, setShowInternalChat] = useState(false)
  const [internalChatInput, setInternalChatInput] = useState('')

  const activeFile = useMemo(() => 
    canvasFiles.find(f => f.path === currentCanvasPath) || null
  , [canvasFiles, currentCanvasPath])

  // Sync local content when file changes
  useMemo(() => {
    if (activeFile) {
      setLocalContent(activeFile.content)
      setIsEditing(false)
    }
  }, [activeFile])

  const handleSave = () => {
    if (activeFile) {
      upsertCanvasFile(activeFile.path, localContent, activeFile.language)
      setIsEditing(false)
    }
  }

  // Simple tree builder from flat paths
  const fileTree = useMemo(() => {
    const root: any = { name: 'project', type: 'folder', children: {}, path: 'root' }
    
    canvasFiles.forEach(file => {
      const parts = file.path.split('/')
      let current = root
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current.children[part] = { ...file, name: part, type: 'file' }
        } else {
          if (!current.children[part]) {
            current.children[part] = { 
              name: part, 
              type: 'folder', 
              children: {}, 
              path: parts.slice(0, index + 1).join('/') 
            }
          }
          current = current.children[part]
        }
      })
    })
    return root
  }, [canvasFiles])

  if (!showCanvas) return null

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    setExpandedFolders(next)
  }

  const renderTree = (node: any, depth = 0) => {
    const isFolder = node.type === 'folder'
    const isExpanded = expandedFolders.has(node.path)

    return (
      <div key={node.path || node.name}>
        <div 
          className={`
            flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm transition-colors
            ${currentCanvasPath === node.path ? 'bg-theme-accent border-l-2 border-theme-primary' : 'hover:bg-theme-accent/30'}
          `}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => isFolder ? toggleFolder(node.path) : selectCanvasFile(node.path)}
        >
          {isFolder ? (
            <>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              {isExpanded ? <FolderOpen className="w-4 h-4 theme-primary" /> : <Folder className="w-4 h-4 theme-primary" />}
            </>
          ) : (
            <>
              <FileCode className="w-4 h-4 theme-secondary" />
            </>
          )}
          <span className={`truncate ${isFolder ? 'font-medium' : 'opacity-80'}`}>
            {node.name}
          </span>
        </div>
        
        {isFolder && isExpanded && (
          <div>
            {Object.values(node.children).map((child: any) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="relative flex-shrink-0 h-full w-full lg:w-[500px] xl:w-[700px] 
        bg-theme-bg border-l border-theme-primary flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 border-b border-theme-primary flex items-center justify-between px-4 bg-theme-dim">
        <div className="flex items-center gap-3">
          <Layout className="w-5 h-5 theme-primary" />
          <div>
            <h2 className="text-sm font-bold theme-primary tracking-wider uppercase">Canvas Engine</h2>
            <p className="text-[10px] theme-secondary opacity-60">Interactive Artifact Viewer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInternalChat(!showInternalChat)}
            className={`p-1.5 rounded-lg transition-colors \${showInternalChat ? 'bg-theme-accent theme-primary' : 'hover:bg-theme-accent theme-secondary'}`}
            title="Chat about these files"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-theme-accent rounded-lg transition-colors theme-secondary"
            title="Export Project"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => toggleCanvas(false)}
            className="p-1.5 hover:bg-theme-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Sidebar */}
        <div className="w-64 border-r border-theme-primary flex flex-col bg-theme-dim/50">
          <div className="p-3 border-b border-theme-primary flex items-center justify-between">
            <span className="text-[10px] font-bold theme-secondary uppercase tracking-widest">Explorer</span>
            <Code2 className="w-3 h-3 opacity-40" />
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {Object.values(fileTree.children).length === 0 ? (
              <div className="p-4 text-center">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs theme-secondary opacity-50 italic">No files generated yet</p>
              </div>
            ) : (
              Object.values(fileTree.children).map(node => renderTree(node))
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-black/20">
          {activeFile ? (
            <>
              <div className="h-9 border-b border-theme-primary flex items-center justify-between px-4 bg-theme-dim/80">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 px-3 py-1 bg-theme-bg border border-theme-primary rounded-t-md text-xs">
                    <FileCode className="w-3 h-3 theme-primary" />
                    <span className="theme-primary whitespace-nowrap">{activeFile.path}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={handleSave} className="p-1 hover:text-green-400 transition-colors" title="Save Changes">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setIsEditing(false); setLocalContent(activeFile.content) }} className="p-1 hover:text-red-400 transition-colors" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="p-1 hover:theme-primary transition-colors" title="Edit File">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-black/40">
                {isEditing ? (
                  <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    className="w-full h-full p-4 bg-transparent outline-none font-mono text-sm leading-relaxed resize-none theme-primary caret-cyan-400"
                    spellCheck={false}
                  />
                ) : (
                  <pre className="p-4 font-mono text-sm leading-relaxed text-theme-primary tab-size-4 opacity-90">
                    <code>{activeFile.content}</code>
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 opacity-40">
              <Layout className="w-16 h-16" />
              <div className="text-center">
                <p className="text-lg font-bold">Select a file to view</p>
                <p className="text-xs">Generated artifacts will appear in the explorer</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Internal Chat Panel */}
      <AnimatePresence>
        {showInternalChat && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-8 inset-x-0 h-48 bg-theme-dim border-t border-theme-primary z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-theme-primary bg-black/20">
              <span className="text-[10px] font-bold theme-primary">CANVAS CHAT</span>
              <button onClick={() => setShowInternalChat(false)}>
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 text-[11px] theme-secondary italic">
              Use this chat to brainstorm project-wide changes. All messages are integrated with the main G0DM0D3 engine.
            </div>
            <div className="p-2 flex gap-2">
              <input 
                value={internalChatInput}
                onChange={(e) => setInternalChatInput(e.target.value)}
                placeholder="Talk to Canvas Agent..."
                className="flex-1 bg-theme-bg border border-theme-primary rounded px-3 py-1.5 text-xs outline-none focus:glow-box"
                onKeyDown={(e) => e.key === 'Enter' && setShowInternalChat(false)} // Prototype: closes and you can continue in main chat
              />
              <button className="p-2 bg-theme-accent border border-theme-primary rounded hover:glow-box">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="h-8 border-t border-theme-primary bg-theme-dim px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] theme-secondary uppercase">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>Live Engine</span>
          </div>
          <span>Files: {canvasFiles.length}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] theme-secondary">
          <span>{activeFile?.language || 'plain text'}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </motion.div>
  )
}
