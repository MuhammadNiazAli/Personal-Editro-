'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useCanvasStore } from '../../components/store/canvasStore';
import { DrawElement, Point } from '../../components/store/canvasStore';

interface CanvasProps {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

type TextAlign = 'left' | 'center' | 'right';

type TextToolExtraState = {
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textStrike?: boolean;
  textAlign?: TextAlign;
  textBoxWidth?: number;
};

type TextDrawElement = DrawElement & {
  text?: string;
  textColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textStrike?: boolean;
  textAlign?: TextAlign;
  textBoxWidth?: number;
  width?: number;
  fontFamily?: string;
  fontSize?: number;
};

function polygonPoints(
  cx: number,
  cy: number,
  r: number,
  sides: number,
  startAngle = -Math.PI / 2,
) {
  const pts: [number, number][] = [];

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (Math.PI * 2 * i) / sides;

    pts.push([
      cx + r * Math.cos(angle),
      cy + r * Math.sin(angle),
    ]);
  }

  return pts;
}

function starPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
) {
  const pts: [number, number][] = [];

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;

    pts.push([
      cx + radius * Math.cos(angle),
      cy + radius * Math.sin(angle),
    ]);
  }

  return pts;
}

function applyStyle(
  ctx: CanvasRenderingContext2D,
  fillMode: 'filled' | 'outline' | 'filled-outline',
  fillColor: string,
  strokeColor: string,
  strokeWidth: number,
  opacity: number,
) {
  ctx.globalAlpha = opacity;

  if (fillMode === 'filled' || fillMode === 'filled-outline') {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  if (fillMode === 'outline' || fillMode === 'filled-outline') {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function buildFont(element: TextDrawElement): string {
  const style = element.textItalic ? 'italic ' : '';
  const weight = element.textBold ? 'bold ' : '';
  const size = element.fontSize ?? 20;
  const family = element.fontFamily ?? 'Arial';

  return `${style}${weight}${size}px ${family}`;
}

function getTextStartX(
  x: number,
  width: number,
  align: TextAlign,
) {
  if (align === 'center') return x + width / 2;
  if (align === 'right') return x + width;

  return x;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const finalLines: string[] = [];
  const rawLines = text.split('\n');

  rawLines.forEach((rawLine) => {
    const words = rawLine.split(' ');
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth <= maxWidth) {
        currentLine = testLine;
        return;
      }

      if (currentLine) {
        finalLines.push(currentLine);
        currentLine = '';
      }

      if (ctx.measureText(word).width <= maxWidth) {
        currentLine = word;
        return;
      }

      let brokenWord = '';

      for (const char of word) {
        const testWord = brokenWord + char;

        if (ctx.measureText(testWord).width <= maxWidth) {
          brokenWord = testWord;
        } else {
          if (brokenWord) finalLines.push(brokenWord);
          brokenWord = char;
        }
      }

      currentLine = brokenWord;
    });

    finalLines.push(currentLine);
  });

  return finalLines;
}

function drawDecorationLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  align: TextAlign,
  color: string,
  type: 'underline' | 'strike',
) {
  const width = ctx.measureText(text).width;

  let startX = x;

  if (align === 'center') startX = x - width / 2;
  if (align === 'right') startX = x - width;

  const yPosition =
    type === 'underline'
      ? y + fontSize * 0.12
      : y - fontSize * 0.35;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, fontSize * 0.06);
  ctx.moveTo(startX, yPosition);
  ctx.lineTo(startX + width, yPosition);
  ctx.stroke();
}

function drawShapeOnCtx(
  ctx: CanvasRenderingContext2D,
  shapeType: string,
  start: Point,
  end: Point,
  fillMode: 'filled' | 'outline' | 'filled-outline',
  fillColor: string,
  strokeColor: string,
  strokeWidth: number,
  opacity: number,
) {
  const w = end.x - start.x;
  const h = end.y - start.y;

  const cx = start.x + w / 2;
  const cy = start.y + h / 2;

  const rx = Math.abs(w) / 2;
  const ry = Math.abs(h) / 2;
  const r = Math.min(rx, ry);

  ctx.beginPath();

  switch (shapeType) {
    case 'rectangle':
      ctx.rect(start.x, start.y, w, h);
      break;

    case 'square': {
      const s = Math.min(Math.abs(w), Math.abs(h));
      ctx.rect(start.x, start.y, Math.sign(w) * s, Math.sign(h) * s);
      break;
    }

    case 'circle':
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      break;

    case 'ellipse':
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      break;

    case 'triangle':
      ctx.moveTo(cx, start.y);
      ctx.lineTo(start.x, end.y);
      ctx.lineTo(end.x, end.y);
      ctx.closePath();
      break;

    case 'right-triangle':
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(start.x, end.y);
      ctx.lineTo(end.x, end.y);
      ctx.closePath();
      break;

    case 'diamond':
      ctx.moveTo(cx, start.y);
      ctx.lineTo(end.x, cy);
      ctx.lineTo(cx, end.y);
      ctx.lineTo(start.x, cy);
      ctx.closePath();
      break;

    case 'parallelogram': {
      const offset = Math.abs(w) * 0.2;
      ctx.moveTo(start.x + offset, start.y);
      ctx.lineTo(end.x, start.y);
      ctx.lineTo(end.x - offset, end.y);
      ctx.lineTo(start.x, end.y);
      ctx.closePath();
      break;
    }

    case 'trapezoid': {
      const inset = Math.abs(w) * 0.2;
      ctx.moveTo(start.x + inset, start.y);
      ctx.lineTo(end.x - inset, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(start.x, end.y);
      ctx.closePath();
      break;
    }

    case 'pentagon': {
      const points = polygonPoints(cx, cy, r, 5);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'hexagon': {
      const points = polygonPoints(cx, cy, r, 6, 0);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'heptagon': {
      const points = polygonPoints(cx, cy, r, 7);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'octagon': {
      const points = polygonPoints(cx, cy, r, 8, -Math.PI / 8);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'heart':
    case 'heart-outline':
      ctx.moveTo(cx, end.y);
      ctx.bezierCurveTo(cx, cy + ry * 0.6, start.x, cy + ry * 0.6, start.x, cy);
      ctx.bezierCurveTo(start.x, start.y, cx, start.y, cx, cy - ry * 0.3);
      ctx.bezierCurveTo(cx, start.y, end.x, start.y, end.x, cy);
      ctx.bezierCurveTo(end.x, cy + ry * 0.6, cx, cy + ry * 0.6, cx, end.y);
      ctx.closePath();
      break;

    case 'rounded-rect': {
      const borderRadius = Math.min(r * 0.2, 16);

      ctx.moveTo(start.x + borderRadius, start.y);
      ctx.lineTo(end.x - borderRadius, start.y);
      ctx.quadraticCurveTo(end.x, start.y, end.x, start.y + borderRadius);
      ctx.lineTo(end.x, end.y - borderRadius);
      ctx.quadraticCurveTo(end.x, end.y, end.x - borderRadius, end.y);
      ctx.lineTo(start.x + borderRadius, end.y);
      ctx.quadraticCurveTo(start.x, end.y, start.x, end.y - borderRadius);
      ctx.lineTo(start.x, start.y + borderRadius);
      ctx.quadraticCurveTo(start.x, start.y, start.x + borderRadius, start.y);
      ctx.closePath();
      break;
    }

    default:
      ctx.rect(start.x, start.y, w, h);
  }

  applyStyle(ctx, fillMode, fillColor, strokeColor, strokeWidth, opacity);
}

function drawElement(ctx: CanvasRenderingContext2D, element: DrawElement) {
  const fillMode = element.shapeFillMode ?? 'filled';
  const fillColor = element.shapeFillColor ?? element.color ?? '#4f46e5';
  const strokeColor = element.shapeStrokeColor ?? '#1e1b4b';
  const strokeWidth = element.shapeStrokeWidth ?? 2;
  const opacity = element.shapeOpacity ?? element.opacity ?? 1;

  switch (element.type) {
    case 'brush':
      if (element.points && element.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(element.points[0].x, element.points[0].y);

        for (let i = 1; i < element.points.length; i++) {
          ctx.lineTo(element.points[i].x, element.points[i].y);
        }

        ctx.strokeStyle = element.color ?? '#000000';
        ctx.lineWidth = element.size ?? 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = opacity;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      break;

    case 'shape':
      if (element.position && element.endPosition && element.shapeType) {
        drawShapeOnCtx(
          ctx,
          element.shapeType,
          element.position,
          element.endPosition,
          fillMode,
          fillColor,
          strokeColor,
          strokeWidth,
          opacity,
        );
      }
      break;

    case 'text': {
      const textElement = element as TextDrawElement;

      if (!textElement.position || !textElement.text) return;

      const fontSize = textElement.fontSize ?? 20;
      const lineHeight = fontSize * 1.35;
      const width = textElement.textBoxWidth ?? textElement.width ?? 260;
      const align = textElement.textAlign ?? 'left';
      const color = textElement.textColor ?? textElement.color ?? '#111827';
      const textX = getTextStartX(textElement.position.x, width, align);

      ctx.save();

      ctx.font = buildFont(textElement);
      ctx.fillStyle = color;
      ctx.textAlign = align as CanvasTextAlign;
      ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = opacity;

      const lines = wrapTextLines(ctx, textElement.text, width);

      lines.forEach((line, index) => {
        const y = textElement.position!.y + index * lineHeight;

        ctx.fillText(line, textX, y);

        if (textElement.textUnderline) {
          drawDecorationLine(
            ctx,
            line,
            textX,
            y,
            fontSize,
            align,
            color,
            'underline',
          );
        }

        if (textElement.textStrike) {
          drawDecorationLine(
            ctx,
            line,
            textX,
            y,
            fontSize,
            align,
            color,
            'strike',
          );
        }
      });

      ctx.restore();
      break;
    }

    default:
      break;
  }
}

interface TextEditor {
  x: number;
  y: number;
  value: string;
  width: number;
}

export const Canvas: React.FC<CanvasProps> = ({ onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [textEditor, setTextEditor] = useState<TextEditor | null>(null);

  const { layers, toolState, addElement } = useCanvasStore();

  const textState = toolState as typeof toolState & TextToolExtraState;

  const visibleElements = layers
    .filter((layer) => layer.visible)
    .flatMap((layer) => layer.elements);

  const getCoords = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return {
        x: 0,
        y: 0,
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const commitText = useCallback(
    (value: string, pos: { x: number; y: number; width: number }) => {
      if (value.trim()) {
        addElement({
          id: `text-${Date.now()}`,
          type: 'text',
          text: value.trimEnd(),
          position: {
            x: pos.x,
            y: pos.y,
          },
          color: textState.textColor ?? '#111827',
          textColor: textState.textColor ?? '#111827',
          fontFamily: textState.fontFamily ?? 'Arial',
          fontSize: textState.fontSize ?? 20,
          textBold: textState.textBold ?? false,
          textItalic: textState.textItalic ?? false,
          textUnderline: textState.textUnderline ?? false,
          textStrike: textState.textStrike ?? false,
          textAlign: textState.textAlign ?? 'left',
          textBoxWidth: pos.width,
          opacity: 1,
        } as any);
      }

      setTextEditor(null);
    },
    [addElement, textState],
  );

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    visibleElements.forEach((element) => {
      drawElement(ctx, element);
    });

    if (
      startPoint &&
      endPoint &&
      toolState.activeTool === 'shape' &&
      toolState.selectedShape
    ) {
      drawShapeOnCtx(
        ctx,
        toolState.selectedShape,
        startPoint,
        endPoint,
        toolState.shapeFillMode ?? 'filled',
        toolState.shapeFillColor ?? toolState.brushColor,
        toolState.shapeStrokeColor ?? '#1e1b4b',
        toolState.shapeStrokeWidth ?? 2,
        toolState.shapeOpacity ?? 1,
      );
    }

    if (currentPoints.length > 1 && toolState.activeTool === 'brush') {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }

      ctx.strokeStyle = toolState.brushColor;
      ctx.lineWidth = toolState.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }, [
    visibleElements,
    currentPoints,
    toolState,
    startPoint,
    endPoint,
  ]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoords(event);

    if (toolState.activeTool === 'text') {
      if (textEditor) {
        commitText(textEditor.value, {
          x: textEditor.x,
          y: textEditor.y,
          width: textEditor.width,
        });
      }

      setTextEditor({
        x: coords.x,
        y: coords.y,
        value: '',
        width: textState.textBoxWidth ?? 260,
      });

      return;
    }

    if (toolState.activeTool === 'brush') {
      setIsDrawing(true);
      setCurrentPoints([coords]);
      return;
    }

    if (toolState.activeTool === 'shape') {
      setStartPoint(coords);
      setEndPoint(coords);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoords(event);

    if (isDrawing && toolState.activeTool === 'brush') {
      setCurrentPoints((previous) => [...previous, coords]);
      return;
    }

    if (startPoint && toolState.activeTool === 'shape') {
      setEndPoint(coords);
    }
  };

  const handleMouseUp = () => {
    if (
      isDrawing &&
      currentPoints.length > 0 &&
      toolState.activeTool === 'brush'
    ) {
      addElement({
        id: `brush-${Date.now()}`,
        type: 'brush',
        points: currentPoints,
        size: toolState.brushSize,
        color: toolState.brushColor,
        opacity: toolState.brushOpacity,
      });

      setCurrentPoints([]);
    }

    if (
      startPoint &&
      endPoint &&
      toolState.activeTool === 'shape' &&
      toolState.selectedShape
    ) {
      addElement({
        id: `shape-${Date.now()}`,
        type: 'shape',
        shapeType: toolState.selectedShape,
        position: startPoint,
        endPosition: endPoint,
        color: toolState.shapeFillColor ?? toolState.brushColor,
        shapeFillMode: toolState.shapeFillMode ?? 'filled',
        shapeFillColor: toolState.shapeFillColor ?? toolState.brushColor,
        shapeStrokeColor: toolState.shapeStrokeColor ?? '#1e1b4b',
        shapeStrokeWidth: toolState.shapeStrokeWidth ?? 2,
        shapeOpacity: toolState.shapeOpacity ?? 1,
      });

      setStartPoint(null);
      setEndPoint(null);
    }

    setIsDrawing(false);
  };

  useEffect(() => {
    if (!textEditor) return;

    const timeoutId = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [textEditor]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [renderCanvas]);

  const cursor = toolState.activeTool === 'text' ? 'text' : 'crosshair';

  const fontSize = textState.fontSize ?? 20;

  const textareaStyle: React.CSSProperties = {
    position: 'absolute',
    left: textEditor?.x ?? 0,
    top: (textEditor?.y ?? 0) - fontSize * 0.85,
    width: textEditor?.width ?? textState.textBoxWidth ?? 260,
    maxWidth: 'calc(100% - 24px)',
    fontFamily: textState.fontFamily ?? 'Arial',
    fontSize,
    fontWeight: textState.textBold ? 'bold' : 'normal',
    fontStyle: textState.textItalic ? 'italic' : 'normal',
    textDecoration:
      [
        textState.textUnderline ? 'underline' : '',
        textState.textStrike ? 'line-through' : '',
      ]
        .filter(Boolean)
        .join(' ') || 'none',
    textAlign: (textState.textAlign ?? 'left') as React.CSSProperties['textAlign'],
    color: textState.textColor ?? '#111827',
    background: 'rgba(99, 102, 241, 0.07)',
    border: '1.5px dashed #6366f1',
    borderRadius: 8,
    outline: 'none',
    padding: '4px 8px',
    minWidth: 120,
    minHeight: fontSize * 1.5,
    maxHeight: 240,
    resize: 'horizontal',
    lineHeight: 1.35,
    zIndex: 20,
    caretColor: textState.textColor ?? '#111827',
    overflowY: 'auto',
    overflowX: 'hidden',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-gray-100"
    >
      <canvas
        ref={canvasRef}
        style={{ cursor }}
        className="absolute left-0 top-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {textEditor && (
        <textarea
          ref={textareaRef}
          value={textEditor.value}
          style={textareaStyle}
          rows={1}
          placeholder="Type here…"
          onChange={(event) => {
            const textarea = event.target;

            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;

            setTextEditor((previous) => {
              if (!previous) return null;

              return {
                ...previous,
                value: event.target.value,
                width: textarea.offsetWidth || previous.width,
              };
            });
          }}
          onMouseUp={(event) => {
            const textarea = event.currentTarget;

            setTextEditor((previous) => {
              if (!previous) return null;

              return {
                ...previous,
                width: textarea.offsetWidth || previous.width,
              };
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();

              commitText(textEditor.value, {
                x: textEditor.x,
                y: textEditor.y,
                width: textEditor.width,
              });
            }

            if (event.key === 'Escape') {
              setTextEditor(null);
            }
          }}
          onBlur={() =>
            commitText(textEditor.value, {
              x: textEditor.x,
              y: textEditor.y,
              width: textEditor.width,
            })
          }
        />
      )}
    </div>
  );
};