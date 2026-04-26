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

type BrushMode =
  | 'normal'
  | 'pencil'
  | 'pen'
  | 'marker'
  | 'calligraphy'
  | 'spray'
  | 'dotted'
  | 'square'
  | 'glow'
  | 'watercolor'
  | 'crayon'
  | 'chalk'
  | 'charcoal'
  | 'neon'
  | 'ribbon'
  | 'fur'
  | 'sketch'
  | 'ink'
  | 'shadow'
  | 'eraser';

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

type BrushToolExtraState = {
  selectedBrush?: string;
  brushMode?: BrushMode;
  brushSize?: number;
  brushColor?: string;
  brushOpacity?: number;
  brushSpacing?: number;
  brushJitter?: number;
  brushScatter?: number;
  brushSoftness?: number;
  brushAngle?: number;
  brushPressure?: number;
  brushGlow?: number;
  brushTexture?: boolean;
  brushComposite?: GlobalCompositeOperation;
};

type CanvasToolState = TextToolExtraState & BrushToolExtraState;

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

type BrushDrawElement = DrawElement & {
  brushMode?: BrushMode;
  selectedBrush?: string;
  brushSpacing?: number;
  brushJitter?: number;
  brushScatter?: number;
  brushSoftness?: number;
  brushAngle?: number;
  brushPressure?: number;
  brushGlow?: number;
  brushTexture?: boolean;
  brushComposite?: GlobalCompositeOperation;
};

interface TextEditor {
  x: number;
  y: number;
  value: string;
  width: number;
}

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

function distance(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 999.9283) * 43758.5453;
  return value - Math.floor(value);
}

function pointSeed(point: Point, index: number, salt = 1) {
  return point.x * 12.9898 + point.y * 78.233 + index * 37.719 + salt * 91.17;
}

function withAlpha(
  ctx: CanvasRenderingContext2D,
  opacity: number,
  callback: () => void,
) {
  const oldAlpha = ctx.globalAlpha;

  ctx.globalAlpha = opacity;
  callback();
  ctx.globalAlpha = oldAlpha;
}

function getBrushColor(element: BrushDrawElement) {
  return element.color ?? '#000000';
}

function getBrushSize(element: BrushDrawElement) {
  return Math.max(1, element.size ?? 4);
}

function getBrushOpacity(element: BrushDrawElement) {
  return Math.min(Math.max(element.opacity ?? 1, 0.01), 1);
}

function forEachSampledPoint(
  points: Point[],
  spacing: number,
  callback: (point: Point, index: number, angle: number) => void,
) {
  if (points.length === 0) return;

  const safeSpacing = Math.max(1, spacing);
  let sampleIndex = 0;

  callback(points[0], sampleIndex, 0);
  sampleIndex += 1;

  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const segmentDistance = distance(previous, current);

    if (segmentDistance <= 0) continue;

    const steps = Math.max(1, Math.floor(segmentDistance / safeSpacing));
    const angle = Math.atan2(current.y - previous.y, current.x - previous.x);

    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      const point = lerpPoint(previous, current, t);

      callback(point, sampleIndex, angle);
      sampleIndex += 1;
    }
  }
}

function drawSmoothStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  size: number,
  opacity: number,
  composite: GlobalCompositeOperation,
  cap: CanvasLineCap = 'round',
  join: CanvasLineJoin = 'round',
) {
  if (points.length < 2) return;

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = cap;
  ctx.lineJoin = join;
  ctx.globalAlpha = opacity;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;

      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
  }

  ctx.stroke();
  ctx.restore();
}

function drawJitterStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  size: number,
  opacity: number,
  jitter: number,
  passes: number,
  composite: GlobalCompositeOperation,
) {
  if (points.length < 2) return;

  for (let pass = 0; pass < passes; pass++) {
    const jittered = points.map((point, index) => {
      const seedA = pointSeed(point, index, pass + 1);
      const seedB = pointSeed(point, index, pass + 7);

      return {
        x: point.x + (pseudoRandom(seedA) - 0.5) * jitter,
        y: point.y + (pseudoRandom(seedB) - 0.5) * jitter,
      };
    });

    drawSmoothStroke(
      ctx,
      jittered,
      color,
      size,
      opacity / passes,
      composite,
    );
  }
}

function drawSprayStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const scatter = element.brushScatter ?? size * 1.5;
  const spacing = element.brushSpacing ?? 3;
  const composite = element.brushComposite ?? 'source-over';

  ctx.save();
  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = color;

  forEachSampledPoint(points, spacing, (point, index) => {
    const dotCount = Math.max(6, Math.floor(size * 1.4));

    for (let i = 0; i < dotCount; i++) {
      const seed = pointSeed(point, index, i + 10);
      const angle = pseudoRandom(seed) * Math.PI * 2;
      const radius = pseudoRandom(seed + 4) * scatter;
      const dotSize = Math.max(0.7, pseudoRandom(seed + 9) * Math.max(2, size * 0.16));

      ctx.globalAlpha = opacity * (0.2 + pseudoRandom(seed + 13) * 0.6);

      ctx.beginPath();
      ctx.arc(
        point.x + Math.cos(angle) * radius,
        point.y + Math.sin(angle) * radius,
        dotSize,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  });

  ctx.restore();
}

function drawDottedStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const spacing = element.brushSpacing ?? Math.max(6, size * 1.6);
  const jitter = element.brushJitter ?? 0;
  const composite = element.brushComposite ?? 'source-over';

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  forEachSampledPoint(points, spacing, (point, index) => {
    const seedA = pointSeed(point, index, 31);
    const seedB = pointSeed(point, index, 34);

    const x = point.x + (pseudoRandom(seedA) - 0.5) * jitter;
    const y = point.y + (pseudoRandom(seedB) - 0.5) * jitter;

    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawSquareStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const spacing = element.brushSpacing ?? Math.max(4, size * 0.85);
  const jitter = element.brushJitter ?? 0;
  const composite = element.brushComposite ?? 'source-over';

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  forEachSampledPoint(points, spacing, (point, index, angle) => {
    const seedA = pointSeed(point, index, 44);
    const seedB = pointSeed(point, index, 45);
    const rotation = angle + (pseudoRandom(seedA) - 0.5) * 0.8;

    ctx.save();
    ctx.translate(
      point.x + (pseudoRandom(seedA) - 0.5) * jitter,
      point.y + (pseudoRandom(seedB) - 0.5) * jitter,
    );
    ctx.rotate(rotation);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  });

  ctx.restore();
}

function drawCalligraphyStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const spacing = Math.max(1, size * 0.22);
  const angleDeg = element.brushAngle ?? -35;
  const composite = element.brushComposite ?? 'source-over';

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  forEachSampledPoint(points, spacing, (point, index) => {
    const seed = pointSeed(point, index, 51);
    const pressure = 0.8 + pseudoRandom(seed) * 0.35;

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      size * 0.62 * pressure,
      Math.max(1.2, size * 0.18),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}

function drawGlowStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
  neon = false,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const glow = element.brushGlow ?? (neon ? 18 : 22);
  const composite = element.brushComposite ?? 'source-over';

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;

  drawSmoothStroke(
    ctx,
    points,
    color,
    size + (neon ? 2 : 0),
    opacity * 0.55,
    composite,
  );

  drawSmoothStroke(
    ctx,
    points,
    color,
    Math.max(1, size * 0.45),
    Math.min(1, opacity),
    composite,
  );

  if (neon) {
    drawSmoothStroke(
      ctx,
      points,
      '#ffffff',
      Math.max(1, size * 0.16),
      Math.min(0.95, opacity),
      composite,
    );
  }

  ctx.restore();
}

function drawWatercolorStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const spacing = element.brushSpacing ?? 4;
  const softness = element.brushSoftness ?? 0.7;
  const composite = element.brushComposite ?? 'source-over';

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = color;

  forEachSampledPoint(points, spacing, (point, index) => {
    const seed = pointSeed(point, index, 61);
    const radius = size * (0.45 + pseudoRandom(seed) * 0.55);
    const alpha = opacity * (0.08 + pseudoRandom(seed + 8) * 0.16);

    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = size * softness;

    ctx.beginPath();
    ctx.arc(
      point.x + (pseudoRandom(seed + 2) - 0.5) * size * 0.5,
      point.y + (pseudoRandom(seed + 3) - 0.5) * size * 0.5,
      radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  ctx.restore();

  drawSmoothStroke(
    ctx,
    points,
    color,
    Math.max(1, size * 0.18),
    opacity * 0.35,
    composite,
  );
}

function drawCrayonLikeStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
  kind: 'crayon' | 'chalk' | 'charcoal',
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const jitter = element.brushJitter ?? 2;
  const composite = element.brushComposite ?? 'source-over';

  const passes = kind === 'charcoal' ? 7 : kind === 'chalk' ? 6 : 5;
  const baseSize = kind === 'charcoal' ? size * 0.55 : size * 0.38;
  const baseOpacity = kind === 'charcoal' ? opacity * 0.18 : opacity * 0.16;

  drawJitterStroke(
    ctx,
    points,
    color,
    baseSize,
    baseOpacity,
    jitter * 2.2,
    passes,
    composite,
  );

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = color;

  forEachSampledPoint(points, Math.max(2, size * 0.28), (point, index) => {
    const seed = pointSeed(point, index, 71);
    const particleCount = kind === 'charcoal' ? 4 : 3;

    for (let i = 0; i < particleCount; i++) {
      const dotSeed = seed + i * 9;
      const angle = pseudoRandom(dotSeed) * Math.PI * 2;
      const radius = pseudoRandom(dotSeed + 1) * size * 0.62;
      const dotSize = Math.max(0.7, pseudoRandom(dotSeed + 3) * size * 0.18);

      ctx.globalAlpha = opacity * (0.08 + pseudoRandom(dotSeed + 5) * 0.18);

      if (kind === 'chalk') {
        ctx.fillRect(
          point.x + Math.cos(angle) * radius,
          point.y + Math.sin(angle) * radius,
          dotSize,
          dotSize,
        );
      } else {
        ctx.beginPath();
        ctx.arc(
          point.x + Math.cos(angle) * radius,
          point.y + Math.sin(angle) * radius,
          dotSize,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  });

  ctx.restore();
}

function drawPencilStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
  sketch = false,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const jitter = element.brushJitter ?? (sketch ? 2.5 : 0.8);
  const composite = element.brushComposite ?? 'source-over';

  drawJitterStroke(
    ctx,
    points,
    color,
    Math.max(1, size * 0.45),
    opacity * 0.85,
    jitter,
    sketch ? 5 : 3,
    composite,
  );

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = color;

  forEachSampledPoint(points, Math.max(2, size * 0.9), (point, index) => {
    const seed = pointSeed(point, index, 82);

    ctx.globalAlpha = opacity * (0.06 + pseudoRandom(seed) * 0.11);

    ctx.beginPath();
    ctx.arc(
      point.x + (pseudoRandom(seed + 2) - 0.5) * size * 2,
      point.y + (pseudoRandom(seed + 3) - 0.5) * size * 2,
      Math.max(0.5, size * 0.16),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  ctx.restore();
}

function drawRibbonStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];

  if (points.length < 2) return;

  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const composite = element.brushComposite ?? 'source-over';

  const leftSide: Point[] = [];
  const rightSide: Point[] = [];

  points.forEach((point, index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];

    const angle = Math.atan2(next.y - previous.y, next.x - previous.x);
    const normal = angle + Math.PI / 2;
    const widthSeed = pointSeed(point, index, 91);
    const width = size * (0.35 + pseudoRandom(widthSeed) * 0.7);

    leftSide.push({
      x: point.x + Math.cos(normal) * width,
      y: point.y + Math.sin(normal) * width,
    });

    rightSide.push({
      x: point.x - Math.cos(normal) * width,
      y: point.y - Math.sin(normal) * width,
    });
  });

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  ctx.beginPath();
  ctx.moveTo(leftSide[0].x, leftSide[0].y);

  leftSide.forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });

  [...rightSide].reverse().forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });

  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = opacity * 0.35;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawFurStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const jitter = element.brushJitter ?? 6;
  const scatter = element.brushScatter ?? 10;
  const composite = element.brushComposite ?? 'source-over';

  drawSmoothStroke(
    ctx,
    points,
    color,
    Math.max(1, size * 0.25),
    opacity * 0.3,
    composite,
  );

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(0.8, size * 0.08);

  forEachSampledPoint(points, Math.max(2, size * 0.25), (point, index, angle) => {
    const hairs = 4;

    for (let i = 0; i < hairs; i++) {
      const seed = pointSeed(point, index, 101 + i);
      const hairAngle = angle + (pseudoRandom(seed) - 0.5) * 2.8;
      const length = size * 0.4 + pseudoRandom(seed + 1) * scatter;
      const startShift = (pseudoRandom(seed + 2) - 0.5) * jitter;

      ctx.globalAlpha = opacity * (0.1 + pseudoRandom(seed + 3) * 0.25);

      ctx.beginPath();
      ctx.moveTo(
        point.x + Math.cos(hairAngle + Math.PI / 2) * startShift,
        point.y + Math.sin(hairAngle + Math.PI / 2) * startShift,
      );
      ctx.lineTo(
        point.x + Math.cos(hairAngle) * length,
        point.y + Math.sin(hairAngle) * length,
      );
      ctx.stroke();
    }
  });

  ctx.restore();
}

function drawShadowStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const softness = element.brushSoftness ?? 1;
  const composite = element.brushComposite ?? 'source-over';

  ctx.save();

  ctx.globalCompositeOperation = composite;
  ctx.shadowColor = color;
  ctx.shadowBlur = size * softness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  drawSmoothStroke(
    ctx,
    points,
    color,
    size,
    opacity,
    composite,
  );

  ctx.restore();
}

function drawBrushStroke(
  ctx: CanvasRenderingContext2D,
  element: BrushDrawElement,
) {
  const points = element.points ?? [];

  if (points.length < 2) return;

  const mode = element.brushMode ?? 'normal';
  const color = getBrushColor(element);
  const size = getBrushSize(element);
  const opacity = getBrushOpacity(element);
  const composite =
    mode === 'eraser'
      ? 'destination-out'
      : element.brushComposite ?? 'source-over';

  switch (mode) {
    case 'eraser':
      drawSmoothStroke(
        ctx,
        points,
        '#000000',
        size,
        1,
        'destination-out',
      );
      break;

    case 'pencil':
      drawPencilStroke(ctx, element, false);
      break;

    case 'sketch':
      drawPencilStroke(ctx, element, true);
      break;

    case 'pen':
      drawSmoothStroke(
        ctx,
        points,
        color,
        size,
        opacity,
        composite,
      );
      break;

    case 'ink':
      drawSmoothStroke(
        ctx,
        points,
        color,
        size,
        opacity,
        composite,
      );

      withAlpha(ctx, opacity * 0.2, () => {
        drawSmoothStroke(
          ctx,
          points,
          color,
          size * 1.45,
          opacity * 0.25,
          composite,
        );
      });
      break;

    case 'marker':
      drawSmoothStroke(
        ctx,
        points,
        color,
        size,
        opacity,
        composite,
        'round',
        'round',
      );

      drawSmoothStroke(
        ctx,
        points,
        color,
        Math.max(1, size * 0.35),
        opacity * 0.35,
        composite,
      );
      break;

    case 'calligraphy':
      drawCalligraphyStroke(ctx, element);
      break;

    case 'spray':
      drawSprayStroke(ctx, element);
      break;

    case 'dotted':
      drawDottedStroke(ctx, element);
      break;

    case 'square':
      drawSquareStroke(ctx, element);
      break;

    case 'glow':
      drawGlowStroke(ctx, element, false);
      break;

    case 'neon':
      drawGlowStroke(ctx, element, true);
      break;

    case 'watercolor':
      drawWatercolorStroke(ctx, element);
      break;

    case 'crayon':
      drawCrayonLikeStroke(ctx, element, 'crayon');
      break;

    case 'chalk':
      drawCrayonLikeStroke(ctx, element, 'chalk');
      break;

    case 'charcoal':
      drawCrayonLikeStroke(ctx, element, 'charcoal');
      break;

    case 'ribbon':
      drawRibbonStroke(ctx, element);
      break;

    case 'fur':
      drawFurStroke(ctx, element);
      break;

    case 'shadow':
      drawShadowStroke(ctx, element);
      break;

    case 'normal':
    default:
      drawSmoothStroke(
        ctx,
        points,
        color,
        size,
        opacity,
        composite,
      );
      break;
  }
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

    case 'cross': {
      const thickness = r * 0.35;

      ctx.moveTo(cx - thickness, start.y);
      ctx.lineTo(cx + thickness, start.y);
      ctx.lineTo(cx + thickness, cy - thickness);
      ctx.lineTo(end.x, cy - thickness);
      ctx.lineTo(end.x, cy + thickness);
      ctx.lineTo(cx + thickness, cy + thickness);
      ctx.lineTo(cx + thickness, end.y);
      ctx.lineTo(cx - thickness, end.y);
      ctx.lineTo(cx - thickness, cy + thickness);
      ctx.lineTo(start.x, cy + thickness);
      ctx.lineTo(start.x, cy - thickness);
      ctx.lineTo(cx - thickness, cy - thickness);
      ctx.closePath();
      break;
    }

    case 'star-3': {
      const points = starPoints(cx, cy, r, r * 0.4, 3);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'star-4': {
      const points = starPoints(cx, cy, r, r * 0.35, 4);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'star-5': {
      const points = starPoints(cx, cy, r, r * 0.4, 5);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'star-6': {
      const points = starPoints(cx, cy, r, r * 0.5, 6);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'star-8': {
      const points = starPoints(cx, cy, r, r * 0.45, 8);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'star-12': {
      const points = starPoints(cx, cy, r, r * 0.6, 12);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'burst-4': {
      const points = starPoints(cx, cy, r, r * 0.2, 4);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'burst-8': {
      const points = starPoints(cx, cy, r, r * 0.3, 8);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'starburst': {
      const points = starPoints(cx, cy, r, r * 0.55, 16);
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      break;
    }

    case 'arrow-right': {
      const headWidth = Math.abs(w) * 0.35;
      const shaftHeight = Math.abs(h) * 0.35;

      ctx.moveTo(start.x, cy - shaftHeight / 2);
      ctx.lineTo(end.x - headWidth, cy - shaftHeight / 2);
      ctx.lineTo(end.x - headWidth, start.y);
      ctx.lineTo(end.x, cy);
      ctx.lineTo(end.x - headWidth, end.y);
      ctx.lineTo(end.x - headWidth, cy + shaftHeight / 2);
      ctx.lineTo(start.x, cy + shaftHeight / 2);
      ctx.closePath();
      break;
    }

    case 'arrow-left': {
      const headWidth = Math.abs(w) * 0.35;
      const shaftHeight = Math.abs(h) * 0.35;

      ctx.moveTo(end.x, cy - shaftHeight / 2);
      ctx.lineTo(start.x + headWidth, cy - shaftHeight / 2);
      ctx.lineTo(start.x + headWidth, start.y);
      ctx.lineTo(start.x, cy);
      ctx.lineTo(start.x + headWidth, end.y);
      ctx.lineTo(start.x + headWidth, cy + shaftHeight / 2);
      ctx.lineTo(end.x, cy + shaftHeight / 2);
      ctx.closePath();
      break;
    }

    case 'arrow-up': {
      const headWidth = Math.abs(w) * 0.35;
      const headHeight = Math.abs(h) * 0.35;

      ctx.moveTo(cx - headWidth / 2, end.y);
      ctx.lineTo(cx - headWidth / 2, start.y + headHeight);
      ctx.lineTo(start.x, start.y + headHeight);
      ctx.lineTo(cx, start.y);
      ctx.lineTo(end.x, start.y + headHeight);
      ctx.lineTo(cx + headWidth / 2, start.y + headHeight);
      ctx.lineTo(cx + headWidth / 2, end.y);
      ctx.closePath();
      break;
    }

    case 'arrow-down': {
      const headWidth = Math.abs(w) * 0.35;
      const headHeight = Math.abs(h) * 0.35;

      ctx.moveTo(cx - headWidth / 2, start.y);
      ctx.lineTo(cx - headWidth / 2, end.y - headHeight);
      ctx.lineTo(start.x, end.y - headHeight);
      ctx.lineTo(cx, end.y);
      ctx.lineTo(end.x, end.y - headHeight);
      ctx.lineTo(cx + headWidth / 2, end.y - headHeight);
      ctx.lineTo(cx + headWidth / 2, start.y);
      ctx.closePath();
      break;
    }

    case 'arrow-double': {
      const headWidth = Math.abs(w) * 0.25;
      const shaftHeight = Math.abs(h) * 0.3;

      ctx.moveTo(start.x, cy);
      ctx.lineTo(start.x + headWidth, start.y);
      ctx.lineTo(start.x + headWidth, cy - shaftHeight / 2);
      ctx.lineTo(end.x - headWidth, cy - shaftHeight / 2);
      ctx.lineTo(end.x - headWidth, start.y);
      ctx.lineTo(end.x, cy);
      ctx.lineTo(end.x - headWidth, end.y);
      ctx.lineTo(end.x - headWidth, cy + shaftHeight / 2);
      ctx.lineTo(start.x + headWidth, cy + shaftHeight / 2);
      ctx.lineTo(start.x + headWidth, end.y);
      ctx.closePath();
      break;
    }

    case 'arrow-chevron':
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, cy);
      ctx.lineTo(start.x, end.y);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      break;

    case 'heart':
    case 'heart-outline':
      ctx.moveTo(cx, end.y);
      ctx.bezierCurveTo(cx, cy + ry * 0.6, start.x, cy + ry * 0.6, start.x, cy);
      ctx.bezierCurveTo(start.x, start.y, cx, start.y, cx, cy - ry * 0.3);
      ctx.bezierCurveTo(cx, start.y, end.x, start.y, end.x, cy);
      ctx.bezierCurveTo(end.x, cy + ry * 0.6, cx, cy + ry * 0.6, cx, end.y);
      ctx.closePath();
      break;

    case 'lightning':
      ctx.moveTo(cx + rx * 0.2, start.y);
      ctx.lineTo(cx - rx * 0.3, cy);
      ctx.lineTo(cx + rx * 0.15, cy);
      ctx.lineTo(cx - rx * 0.2, end.y);
      ctx.lineTo(cx + rx * 0.3, cy + ry * 0.1);
      ctx.lineTo(cx - rx * 0.05, cy + ry * 0.1);
      ctx.closePath();
      break;

    case 'speech-bubble': {
      const borderRadius = r * 0.15;
      const tailX = start.x + rx * 0.3;

      ctx.moveTo(start.x + borderRadius, start.y);
      ctx.lineTo(end.x - borderRadius, start.y);
      ctx.quadraticCurveTo(end.x, start.y, end.x, start.y + borderRadius);
      ctx.lineTo(end.x, end.y - ry * 0.4 - borderRadius);
      ctx.quadraticCurveTo(
        end.x,
        end.y - ry * 0.4,
        end.x - borderRadius,
        end.y - ry * 0.4,
      );
      ctx.lineTo(tailX + rx * 0.1, end.y - ry * 0.4);
      ctx.lineTo(tailX, end.y);
      ctx.lineTo(tailX - rx * 0.05, end.y - ry * 0.4);
      ctx.lineTo(start.x + borderRadius, end.y - ry * 0.4);
      ctx.quadraticCurveTo(
        start.x,
        end.y - ry * 0.4,
        start.x,
        end.y - ry * 0.4 - borderRadius,
      );
      ctx.lineTo(start.x, start.y + borderRadius);
      ctx.quadraticCurveTo(start.x, start.y, start.x + borderRadius, start.y);
      ctx.closePath();
      break;
    }

    case 'cloud': {
      const cloudRadius = r * 0.35;

      ctx.arc(cx - cloudRadius * 0.9, cy + cloudRadius * 0.2, cloudRadius, Math.PI, 0);
      ctx.arc(cx + cloudRadius * 0.9, cy + cloudRadius * 0.2, cloudRadius * 0.8, Math.PI, 0);
      ctx.arc(cx, cy - cloudRadius * 0.4, cloudRadius * 1.2, Math.PI, 0);
      ctx.arc(
        cx + cloudRadius * 2,
        cy + cloudRadius * 0.4,
        cloudRadius * 0.6,
        Math.PI * 1.5,
        Math.PI * 0.5,
      );
      ctx.arc(
        cx - cloudRadius * 2,
        cy + cloudRadius * 0.4,
        cloudRadius * 0.6,
        Math.PI * 0.5,
        Math.PI * 1.5,
      );
      ctx.closePath();
      break;
    }

    case 'moon':
      ctx.arc(cx, cy, r, Math.PI * 0.35, Math.PI * 1.65);
      ctx.arc(cx - r * 0.3, cy, r * 0.75, Math.PI * 1.65, Math.PI * 0.35, true);
      ctx.closePath();
      break;

    case 'sun':
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      ctx.closePath();

      applyStyle(ctx, fillMode, fillColor, strokeColor, strokeWidth, opacity);

      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;

        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(angle) * r * 0.6,
          cy + Math.sin(angle) * r * 0.6,
        );
        ctx.lineTo(
          cx + Math.cos(angle) * r,
          cy + Math.sin(angle) * r,
        );

        ctx.strokeStyle = strokeColor || fillColor;
        ctx.lineWidth = strokeWidth;
        ctx.globalAlpha = opacity;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      return;

    case 'donut':
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2, true);
      break;

    case 'crescent':
      ctx.arc(cx, cy, r, Math.PI * 0.2, Math.PI * 1.8);
      ctx.arc(cx + r * 0.3, cy, r * 0.7, Math.PI * 1.8, Math.PI * 0.2, true);
      ctx.closePath();
      break;

    case 'pac-man':
      ctx.arc(cx, cy, r, Math.PI * 0.25, Math.PI * 1.75);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      break;

    case 'half-circle':
      ctx.arc(cx, cy, r, Math.PI, 0);
      ctx.closePath();
      break;

    case 'quarter-circle':
      ctx.arc(cx, cy, r, -Math.PI / 2, 0);
      ctx.lineTo(cx, cy);
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

    case 'pill': {
      const pillRadius = Math.min(Math.abs(h), Math.abs(w)) / 2;

      ctx.moveTo(start.x + pillRadius, start.y);
      ctx.lineTo(end.x - pillRadius, start.y);
      ctx.arc(end.x - pillRadius, cy, pillRadius, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(start.x + pillRadius, end.y);
      ctx.arc(start.x + pillRadius, cy, pillRadius, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      break;
    }

    case 'ring':
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      applyStyle(ctx, 'outline', fillColor, strokeColor, strokeWidth * 4, opacity);
      return;

    case 'flag':
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, start.y + ry * 0.3);
      ctx.lineTo(start.x + rx * 1.2, start.y + ry * 0.6);
      ctx.lineTo(start.x, start.y + ry * 0.6);
      ctx.closePath();

      applyStyle(ctx, fillMode, fillColor, strokeColor, strokeWidth, opacity);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(start.x, end.y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = opacity;
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;

    case 'badge':
      ctx.arc(cx, cy - ry * 0.2, r * 0.75, 0, Math.PI * 2);
      ctx.closePath();

      applyStyle(ctx, fillMode, fillColor, strokeColor, strokeWidth, opacity);

      ctx.beginPath();
      ctx.moveTo(cx - rx * 0.3, cy + ry * 0.4);
      ctx.lineTo(cx, end.y);
      ctx.lineTo(cx + rx * 0.3, cy + ry * 0.4);
      ctx.closePath();
      break;

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
      drawBrushStroke(ctx, element as BrushDrawElement);
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

  const canvasToolState = toolState as typeof toolState & CanvasToolState;

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
          color: canvasToolState.textColor ?? '#111827',
          textColor: canvasToolState.textColor ?? '#111827',
          fontFamily: canvasToolState.fontFamily ?? 'Arial',
          fontSize: canvasToolState.fontSize ?? 20,
          textBold: canvasToolState.textBold ?? false,
          textItalic: canvasToolState.textItalic ?? false,
          textUnderline: canvasToolState.textUnderline ?? false,
          textStrike: canvasToolState.textStrike ?? false,
          textAlign: canvasToolState.textAlign ?? 'left',
          textBoxWidth: pos.width,
          opacity: 1,
        } as any);
      }

      setTextEditor(null);
    },
    [addElement, canvasToolState],
  );

  const buildLiveBrushElement = useCallback(
    (points: Point[]): BrushDrawElement => {
      const isEraser = toolState.activeTool === 'eraser';

      return {
        id: `live-brush-${Date.now()}`,
        type: 'brush',
        points,
        size: canvasToolState.brushSize ?? 4,
        color: isEraser
          ? '#000000'
          : canvasToolState.brushColor ?? '#000000',
        opacity: isEraser
          ? 1
          : canvasToolState.brushOpacity ?? 1,
        selectedBrush: canvasToolState.selectedBrush ?? 'smooth-pen',
        brushMode: isEraser
          ? 'eraser'
          : canvasToolState.brushMode ?? 'normal',
        brushSpacing: canvasToolState.brushSpacing ?? 1,
        brushJitter: canvasToolState.brushJitter ?? 0,
        brushScatter: canvasToolState.brushScatter ?? 0,
        brushSoftness: canvasToolState.brushSoftness ?? 0,
        brushAngle: canvasToolState.brushAngle ?? 0,
        brushPressure: canvasToolState.brushPressure ?? 0,
        brushGlow: canvasToolState.brushGlow ?? 0,
        brushTexture: canvasToolState.brushTexture ?? false,
        brushComposite: isEraser
          ? 'destination-out'
          : canvasToolState.brushComposite ?? 'source-over',
      } as BrushDrawElement;
    },
    [canvasToolState, toolState.activeTool],
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

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

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

    if (
      currentPoints.length > 1 &&
      (toolState.activeTool === 'brush' || toolState.activeTool === 'eraser')
    ) {
      drawBrushStroke(ctx, buildLiveBrushElement(currentPoints));
    }
  }, [
    visibleElements,
    currentPoints,
    toolState,
    startPoint,
    endPoint,
    buildLiveBrushElement,
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
        width: canvasToolState.textBoxWidth ?? 260,
      });

      return;
    }

    if (toolState.activeTool === 'brush' || toolState.activeTool === 'eraser') {
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

    if (
      isDrawing &&
      (toolState.activeTool === 'brush' || toolState.activeTool === 'eraser')
    ) {
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
      (toolState.activeTool === 'brush' || toolState.activeTool === 'eraser')
    ) {
      const brushElement = buildLiveBrushElement(currentPoints);

      addElement({
        ...brushElement,
        id: `brush-${Date.now()}`,
      } as any);

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

  const cursor =
    toolState.activeTool === 'text'
      ? 'text'
      : toolState.activeTool === 'eraser'
        ? 'grab'
        : 'crosshair';

  const fontSize = canvasToolState.fontSize ?? 20;

  const textareaStyle: React.CSSProperties = {
    position: 'absolute',
    left: textEditor?.x ?? 0,
    top: (textEditor?.y ?? 0) - fontSize * 0.85,
    width: textEditor?.width ?? canvasToolState.textBoxWidth ?? 260,
    maxWidth: 'calc(100% - 24px)',
    fontFamily: canvasToolState.fontFamily ?? 'Arial',
    fontSize,
    fontWeight: canvasToolState.textBold ? 'bold' : 'normal',
    fontStyle: canvasToolState.textItalic ? 'italic' : 'normal',
    textDecoration:
      [
        canvasToolState.textUnderline ? 'underline' : '',
        canvasToolState.textStrike ? 'line-through' : '',
      ]
        .filter(Boolean)
        .join(' ') || 'none',
    textAlign: (canvasToolState.textAlign ?? 'left') as React.CSSProperties['textAlign'],
    color: canvasToolState.textColor ?? '#111827',
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
    caretColor: canvasToolState.textColor ?? '#111827',
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