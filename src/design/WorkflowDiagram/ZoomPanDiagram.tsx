import { End, Start, State } from "./nodes";
import { Map, View } from "lucide-react";
import ReactFlow, {
  Background,
  Edge,
  MiniMap,
  Node,
  useNodesInitialized,
  useReactFlow,
} from "reactflow";
import { useEffect, useMemo, useState } from "react";

import Button from "../Button";
import { ButtonBar } from "../ButtonBar";
import { Toggle } from "../Toggle";

interface ZoomPanDiagramProps {
  elements: (Edge | Node)[];
  disabled: boolean;
}

const nodeTypes = {
  state: State,
  start: Start,
  end: End,
};

export function ZoomPanDiagram(props: ZoomPanDiagramProps) {
  const { elements, disabled } = props;
  const { fitView } = useReactFlow();
  const [showMinimap, setShowMinimap] = useState(true);
  const nodesInitialized = useNodesInitialized();

  const sep: [Node[], Edge[]] = useMemo(() => {
    const nodes: Node[] = elements.filter(
      (ele: Node | Edge) => !!(ele as Node).position
    ) as Node[];

    const edges: Edge[] = elements.filter(
      (ele: Node | Edge) => !!(ele as Edge).source
    ) as Edge[];
    return [nodes, edges];
  }, [elements]);

  useEffect(() => {
    if (nodesInitialized) {
      fitView();
    }
  }, [fitView, nodesInitialized]);

  return (
    <ReactFlow
      edges={sep[1]}
      nodes={sep[0]}
      nodeTypes={nodeTypes}
      nodesDraggable={!disabled}
      nodesConnectable={false}
      elementsSelectable={!disabled}
      fitView={true}
      maxZoom={1.2}
    >
      <ButtonBar className="absolute top-2 left-2 z-50 bg-white dark:bg-black">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            fitView();
          }}
        >
          <View />
        </Button>
        <Toggle
          size="sm"
          onClick={() => {
            setShowMinimap((prev) => !prev);
          }}
          pressed={showMinimap}
        >
          <Map />
        </Toggle>
      </ButtonBar>
      {showMinimap && <MiniMap />}
      <Background />
    </ReactFlow>
  );
}