import { End, Start, State } from "./nodes";
import { Map, View, ZoomIn, ZoomOut } from "lucide-react";
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
  orientation: "horizontal" | "vertical";
}

const nodeTypes = {
  state: State,
  start: Start,
  end: End,
};

const maxZoom = 1.2;

export function ZoomPanDiagram(props: ZoomPanDiagramProps) {
  const { elements, disabled, orientation } = props;
  const { fitView, zoomIn, zoomOut } = useReactFlow();
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

  useEffect(() => {
    fitView();
  }, [fitView, orientation]);

  return (
    <ReactFlow
      edges={sep[1]}
      nodes={sep[0]}
      nodeTypes={nodeTypes}
      nodesDraggable={!disabled}
      nodesConnectable={false}
      elementsSelectable={!disabled}
      fitView={true}
      maxZoom={maxZoom}
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
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            zoomIn();
          }}
        >
          <ZoomIn />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            zoomOut();
          }}
        >
          <ZoomOut />
        </Button>
        <Toggle
          size="sm"
          onClick={() => {
            setShowMinimap((prev) => !prev);
          }}
          pressed={showMinimap}
          outline
        >
          <Map />
        </Toggle>
      </ButtonBar>
      {showMinimap && <MiniMap />}
      <Background />
    </ReactFlow>
  );
}
