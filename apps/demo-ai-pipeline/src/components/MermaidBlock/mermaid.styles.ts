import { MERMAID_COLORS } from 'components/MermaidBlock/mermaid.theme';

export const styles = `
    <style>
      .node rect,
      .node polygon,
      .node circle,
      .node ellipse,
      .node path {
        fill: ${MERMAID_COLORS.nodeFill} !important;
        stroke: ${MERMAID_COLORS.nodeStroke} !important;
        stroke-width: 1.5px !important;
      }

      .node .label,
      .nodeLabel,
      .label,
      .loopText,
      .labelText,
      text {
        color: ${MERMAID_COLORS.nodeText} !important;
        fill: ${MERMAID_COLORS.nodeText} !important;
        font-weight: 500 !important;
      }

      foreignObject {
        overflow: visible !important;
      }

      foreignObject > div,
      foreignObject span,
      foreignObject p {
        overflow: visible !important;
        text-align: center !important;
      }

      .node foreignObject > div {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 100% !important;
      }

      .node foreignObject span,
      .node foreignObject p {
        color: ${MERMAID_COLORS.nodeText} !important;
        font-size: ${MERMAID_COLORS.nodeLabelFontSize} !important;
      }

      .edgeLabel,
      .edgeLabel p,
      .messageText {
        color: ${MERMAID_COLORS.edgeText} !important;
        fill: ${MERMAID_COLORS.edgeText} !important;
        font-size: ${MERMAID_COLORS.edgeLabelFontSize} !important;
        font-weight: 500 !important;
      }

      .edgePath path,
      .flowchart-link,
      .messageLine0,
      .messageLine1,
      .actor-line,
      .loopLine {
        stroke: ${MERMAID_COLORS.line} !important;
        stroke-width: 1.4px !important;
      }

      marker path {
        fill: ${MERMAID_COLORS.line} !important;
        stroke: ${MERMAID_COLORS.line} !important;
      }

      .actor,
      .actor-man line,
      .actor-man circle {
        fill: ${MERMAID_COLORS.actorFill} !important;
        stroke: ${MERMAID_COLORS.actorStroke} !important;
      }

      .actor > rect,
      .sequenceNumber {
        fill: ${MERMAID_COLORS.actorFill} !important;
        stroke: ${MERMAID_COLORS.actorStroke} !important;
      }

      .actor > text,
      .actor tspan {
        fill: ${MERMAID_COLORS.nodeText} !important;
      }
    </style>
  `;
