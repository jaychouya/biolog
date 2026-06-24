import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const NODE_COLORS = {
  input: { bg: '#3b82f6', border: '#60a5fa' },
  factor: { bg: '#8b5cf6', border: '#a78bfa' },
  outcome: { bg: '#ef4444', border: '#f87171' },
}

function layoutNodes(nodes) {
  const cols = { input: 0, factor: 1, outcome: 2 }
  const byCol = {}
  nodes.forEach((n) => {
    const c = cols[n.type] ?? 1
    if (!byCol[c]) byCol[c] = []
    byCol[c].push(n)
  })
  const result = []
  Object.entries(byCol).forEach(([col, list]) => {
    list.forEach((n, i) => {
      result.push({
        id: n.id,
        data: { label: n.label },
        position: { x: Number(col) * 220, y: i * 100 + 20 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: NODE_COLORS[n.type]?.bg || '#6366f1',
          border: `2px solid ${NODE_COLORS[n.type]?.border || '#818cf8'}`,
          color: '#fff',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 500,
        },
      })
    })
  })
  return result
}

export default function InferenceGraph({ graph }) {
  const flowNodes = useMemo(() => layoutNodes(graph.nodes), [graph.nodes])
  const flowEdges = useMemo(
    () =>
      graph.edges.map((e, i) => ({
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: '#6366f1' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      })),
    [graph.edges],
  )

  const onInit = useCallback((instance) => {
    setTimeout(() => instance.fitView({ padding: 0.3 }), 50)
  }, [])

  return (
    <div className="h-64 w-full rounded-lg border border-zinc-700/50 bg-zinc-900/50">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onInit={onInit}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        fitView
      >
        <Background color="#27272a" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
