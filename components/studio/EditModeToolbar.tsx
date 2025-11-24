'use client'

import { MousePointer2, Eraser, Wand2, Move, Box, Scissors, Undo2, Redo2, Plus, Minus, Highlighter, Layers, Sparkles } from 'lucide-react'

interface EditModeToolbarProps {
  isEditMode: boolean
  onToggleEditMode: () => void
  selectedTool: string
  onToolChange: (tool: string) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  selectedCount: number
  onDelete: () => void
  onSmooth: () => void
  onExtrude: () => void
  onHighlightParts?: () => void
}

interface BooleanOpsProps {
  onUnion: () => void
  onSubtract: () => void
  onIntersect: () => void
  canPerform: boolean
}

export default function EditModeToolbar({
  isEditMode,
  onToggleEditMode,
  selectedTool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedCount,
  onDelete,
  onSmooth,
  onExtrude,
  onHighlightParts,
  booleanOps,
}: EditModeToolbarProps & { booleanOps?: BooleanOpsProps }) {
  return (
    <div className="absolute top-4 left-4 z-10">
      {/* Edit Mode Toggle */}
      <div className="bg-black/80 border border-white/10 backdrop-blur-sm p-2 mb-2">
        <button
          onClick={onToggleEditMode}
          className={`px-4 py-2 text-xs font-light tracking-wide uppercase transition-all ${
            isEditMode
              ? 'bg-white text-black'
              : 'bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
        </button>
      </div>

      {isEditMode && (
        <>
          {/* Selection Tools */}
          <div className="bg-black/80 border border-white/10 backdrop-blur-sm p-2 mb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-1 font-light">
              Selection Tools
            </p>
            <div className="flex gap-1">
              <ToolButton
                icon={<MousePointer2 size={14} />}
                label="Click Select"
                active={selectedTool === 'select'}
                onClick={() => onToolChange('select')}
              />
              <ToolButton
                icon={<Layers size={14} />}
                label="Part Select"
                active={selectedTool === 'parts'}
                onClick={() => onToolChange('parts')}
              />
              <ToolButton
                icon={<Sparkles size={14} />}
                label="AI Select"
                active={selectedTool === 'sam'}
                onClick={() => onToolChange('sam')}
              />
              <ToolButton
                icon={<Box size={14} />}
                label="Box Select"
                active={selectedTool === 'box'}
                onClick={() => onToolChange('box')}
              />
            </div>
          </div>
          {/* Edit Operations */}
          <div className="bg-black/80 border border-white/10 backdrop-blur-sm p-2 mb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-1 font-light">
              Mesh Operations
            </p>
            <div className="flex gap-1">
              <ToolButton
                icon={<Eraser size={14} />}
                label="Delete"
                onClick={onDelete}
                disabled={selectedCount === 0}
              />
              <ToolButton
                icon={<Wand2 size={14} />}
                label="Smooth"
                onClick={onSmooth}
                disabled={selectedCount === 0}
              />
              <ToolButton
                icon={<Move size={14} />}
                label="Extrude"
                onClick={onExtrude}
                disabled={selectedCount === 0}
              />
              {onHighlightParts && (
                <ToolButton
                  icon={<Highlighter size={14} />}
                  label="Highlight Parts"
                  onClick={onHighlightParts}
                />
              )}
            </div>
          </div>

          {/* History */}
          <div className="bg-black/80 border border-white/10 backdrop-blur-sm p-2 mb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-1 font-light">
              History
            </p>
            <div className="flex gap-1">
              <ToolButton
                icon={<Undo2 size={14} />}
                label="Undo"
                onClick={onUndo}
                disabled={!canUndo}
              />
              <ToolButton
                icon={<Redo2 size={14} />}
                label="Redo"
                onClick={onRedo}
                disabled={!canRedo}
              />
            </div>
          </div>

          {/* Boolean Operations */}
          {booleanOps && (
            <div className="bg-black/80 border border-white/10 backdrop-blur-sm p-2 mb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-1 font-light">
                Boolean Operations
              </p>
              <div className="flex gap-1">
                <ToolButton
                  icon={<Plus size={14} />}
                  label="Union"
                  onClick={booleanOps.onUnion}
                  disabled={!booleanOps.canPerform}
                />
                <ToolButton
                  icon={<Minus size={14} />}
                  label="Subtract"
                  onClick={booleanOps.onSubtract}
                  disabled={!booleanOps.canPerform}
                />
                <ToolButton
                  icon={<Scissors size={14} />}
                  label="Intersect"
                  onClick={booleanOps.onIntersect}
                  disabled={!booleanOps.canPerform}
                />
              </div>
            </div>
          )}

          {/* Selection Info */}
          {selectedCount > 0 && (
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-3">
              <p className="text-xs text-white font-light">
                {selectedCount} face{selectedCount !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

function ToolButton({ icon, label, active, disabled, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative p-2 transition-all ${
        active
          ? 'bg-white text-black'
          : disabled
          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
          : 'bg-white/5 text-white hover:bg-white/10'
      }`}
    >
      {icon}
      {/* Hover Tooltip */}
      <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-white text-black text-[10px] font-light uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {label}
      </span>
    </button>
  )
}
