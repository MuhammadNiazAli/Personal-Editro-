'use client';

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Settings, Brush, Type, Shapes, Eraser,
  Download, Upload, Save, Undo2, Redo2, Copy, Trash2,
  ZoomIn, ZoomOut, Maximize, Layers, Eye, Lock, Grid, Ruler,
  Crop, CopyPlus, Paintbrush, Droplet, Sparkles,
  Sun, Moon, Blend, Move, RotateCw, FlipHorizontal, FlipVertical,
  AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline,
  Highlighter, FolderOpen, Printer, Share2, Cloud,
  DownloadCloud, Zap, Wind, Activity,
  File, Code, ChevronDown,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Circle, Square, Triangle, Hexagon,
  Star as StarIcon, Heart as HeartIcon,
  Minus, Plus, CornerDownRight, CornerUpRight,
  ChevronRight, ChevronLeft, RefreshCw,
  MousePointer2, Pen, Pencil, PenLine,
  Strikethrough, AlignJustify, Subscript, Superscript,
  SlidersHorizontal, Pipette, CaseUpper, CaseLower,
} from 'lucide-react';

/* ─── Custom SVG icons ───────────────────────────────────────────────────── */
const YenIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V11M17 3l-5 8-5-8M3 11h18M3 15h18" /></svg>
);
const BitcoinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" /></svg>
);
const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
);
const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16H20L8.267 4zM4 20l6.768-6.768M20 4l-6.768 6.768" /></svg>
);
const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);
const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);
const YoutubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>
);
const FigmaIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" /><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" /><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" /><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" /><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" /></svg>
);
const BankIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>
);

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface ShapeItem { id: string; name: string; icon: React.ReactNode }
export interface ArrowItem { id: string; name: string; icon: React.ReactNode }
export interface LineItem  { id: string; name: string; icon: React.ReactNode }
export interface BrushItem { id: string; name: string; desc: string; icon: React.ReactNode }

export interface ToolbarProps {
  onImport?:       (file: File) => void;
  onExport?:       (format: string) => void;
  onSave?:         () => void;
  onUndo?:         () => void;
  onRedo?:         () => void;
  onCopy?:         () => void;
  onDelete?:       () => void;
  onZoomIn?:       () => void;
  onZoomOut?:      () => void;
  onFitScreen?:    () => void;
  onTextAdd?:      (font?: string, size?: number) => void;
  onShapeSelect?:  (shape: ShapeItem) => void;
  onArrowSelect?:  (arrow: ArrowItem) => void;
  onLineSelect?:   (line: LineItem) => void;
  onBrushSelect?:  (brush: BrushItem) => void;
  onLayerAdd?:     () => void;
  onLayerDelete?:  () => void;
  onLayerToggle?:  () => void;
  onGridToggle?:   () => void;
  onRulerToggle?:  () => void;
  onEraserToggle?: () => void;
  onCropToggle?:   () => void;
  onMoveToggle?:   () => void;
  onLaserToggle?:  () => void;
}

/* ─── Static data ────────────────────────────────────────────────────────── */
const FONTS = [
  'Georgia','Times New Roman','Garamond','Palatino',
  'Arial','Helvetica','Tahoma','Verdana',
  'Courier New','Monaco','Lucida Console',
  'Montserrat','Raleway','Oswald','Lato',
  'Dancing Script','Lobster','Pacifico','Caveat',
  'Impact','Comic Sans MS','Trebuchet MS',
];
const FONT_SIZES = [8,9,10,11,12,14,16,18,20,22,24,28,32,36,40,48,56,64,72,96];
const SWATCHES   = ['#000000','#FFFFFF','#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899','#06B6D4','#6B7280','#92400E'];

const BRUSHES: BrushItem[] = [
  { id:'pencil',     name:'Pencil',     desc:'Hard edge',      icon:<Pencil     size={14}/> },
  { id:'pen',        name:'Pen',        desc:'Smooth ink',     icon:<Pen        size={14}/> },
  { id:'marker',     name:'Marker',     desc:'Flat tip',       icon:<Paintbrush size={14}/> },
  { id:'airbrush',   name:'Airbrush',   desc:'Soft spray',     icon:<Wind       size={14}/> },
  { id:'calligraphy',name:'Calligraphy',desc:'Angle nib',      icon:<PenLine    size={14}/> },
  { id:'charcoal',   name:'Charcoal',   desc:'Rough smear',    icon:<Sparkles   size={14}/> },
  { id:'oil',        name:'Oil Brush',  desc:'Thick paint',    icon:<Droplet    size={14}/> },
  { id:'watercolor', name:'Watercolor', desc:'Transparent',    icon:<Blend      size={14}/> },
  { id:'spray',      name:'Spray',      desc:'Scattered dots', icon:<Sparkles   size={14}/> },
  { id:'glow',       name:'Glow',       desc:'Light blur',     icon:<Zap        size={14}/> },
  { id:'pattern',    name:'Pattern',    desc:'Repeat stamp',   icon:<Grid       size={14}/> },
  { id:'eraser',     name:'Eraser',     desc:'Erase pixels',   icon:<Eraser     size={14}/> },
];
const SHAPES_BASIC: ShapeItem[] = [
  { id:'rectangle',     name:'Rectangle', icon:<Square          size={15}/> },
  { id:'square',        name:'Square',    icon:<Square          size={15} className="text-blue-500"/> },
  { id:'circle',        name:'Circle',    icon:<Circle          size={15}/> },
  { id:'ellipse',       name:'Ellipse',   icon:<Circle          size={15}/> },
  { id:'triangle',      name:'Triangle',  icon:<Triangle        size={15}/> },
  { id:'right-triangle',name:'Right Tri.',icon:<CornerDownRight size={15}/> },
];
const SHAPES_POLYGON: ShapeItem[] = [
  { id:'pentagon', name:'Pentagon', icon:<StarIcon size={15}/> },
  { id:'hexagon',  name:'Hexagon',  icon:<Hexagon  size={15}/> },
  { id:'octagon',  name:'Octagon',  icon:<StarIcon size={15}/> },
  { id:'star',     name:'Star',     icon:<StarIcon size={15} className="text-yellow-500"/> },
  { id:'star5',    name:'5-Pt Star',icon:<StarIcon size={15}/> },
  { id:'star6',    name:'6-Pt Star',icon:<StarIcon size={15}/> },
];
const SHAPES_SPECIAL: ShapeItem[] = [
  { id:'heart',    name:'Heart',    icon:<HeartIcon size={15} className="text-red-400"/> },
  { id:'diamond',  name:'Diamond',  icon:<Square    size={15} style={{transform:'rotate(45deg)'}}/> },
  { id:'cross',    name:'Cross',    icon:<Plus      size={15}/> },
  { id:'cloud',    name:'Cloud',    icon:<Cloud     size={15}/> },
  { id:'lightning',name:'Lightning',icon:<Zap       size={15}/> },
  { id:'moon',     name:'Moon',     icon:<Moon      size={15}/> },
  { id:'sun',      name:'Sun',      icon:<Sun       size={15} className="text-yellow-500"/> },
  { id:'flower',   name:'Flower',   icon:<Sparkles  size={15}/> },
];
const ARROWS: ArrowItem[] = [
  { id:'arrow-right',name:'Right Arrow',      icon:<ArrowRight    size={15}/> },
  { id:'arrow-left', name:'Left Arrow',       icon:<ArrowLeft     size={15}/> },
  { id:'arrow-up',   name:'Up Arrow',         icon:<ArrowUp       size={15}/> },
  { id:'arrow-down', name:'Down Arrow',       icon:<ArrowDown     size={15}/> },
  { id:'double-h',   name:'Double Horizontal',icon:<span className="flex items-center"><ArrowLeft size={12}/><ArrowRight size={12}/></span> },
  { id:'double-v',   name:'Double Vertical',  icon:<span className="flex flex-col items-center gap-px"><ArrowUp size={12}/><ArrowDown size={12}/></span> },
  { id:'curve-right',name:'Curve Right',      icon:<CornerUpRight size={15}/> },
  { id:'curve-left', name:'Curve Left',       icon:<CornerDownRight size={15} style={{transform:'scaleX(-1)'}}/> },
  { id:'arc',        name:'Arc Arrow',        icon:<RefreshCw     size={15}/> },
  { id:'elbow',      name:'Elbow Arrow',      icon:<ChevronRight  size={15}/> },
  { id:'thick',      name:'Thick Arrow',      icon:<ArrowRight    size={15} strokeWidth={3}/> },
  { id:'outline',    name:'Outline Arrow',    icon:<ArrowRight    size={15} strokeWidth={1}/> },
];
const LINES: LineItem[] = [
  { id:'straight',   name:'Straight Line',   icon:<Minus    size={15}/> },
  { id:'dashed',     name:'Dashed Line',     icon:<span className="text-xs tracking-widest font-bold leading-none">- - -</span> },
  { id:'dotted',     name:'Dotted Line',     icon:<span className="text-xs tracking-widest leading-none">· · ·</span> },
  { id:'curved',     name:'Curved Line',     icon:<Activity size={15}/> },
  { id:'zigzag',     name:'Zigzag',          icon:<Zap      size={15}/> },
  { id:'wavy',       name:'Wavy Line',       icon:<Wind     size={15}/> },
  { id:'double',     name:'Double Line',     icon:<span className="flex flex-col gap-px"><Minus size={13}/><Minus size={13}/></span> },
  { id:'calligraphy',name:'Calligraphy Line',icon:<PenLine  size={15}/> },
  { id:'freehand',   name:'Freehand',        icon:<Pen      size={15}/> },
  { id:'spiral',     name:'Spiral',          icon:<RefreshCw size={15}/> },
];
const TEXT_STYLES = [
  { id:'bold',       name:'Bold',         icon:<Bold          size={13}/>, shortcut:'⌘B' },
  { id:'italic',     name:'Italic',       icon:<Italic        size={13}/>, shortcut:'⌘I' },
  { id:'underline',  name:'Underline',    icon:<Underline     size={13}/>, shortcut:'⌘U' },
  { id:'strike',     name:'Strikethrough',icon:<Strikethrough size={13}/>, shortcut:'' },
  { id:'highlight',  name:'Highlight',    icon:<Highlighter   size={13}/>, shortcut:'' },
  { id:'glow',       name:'Glow',         icon:<Sparkles      size={13}/>, shortcut:'' },
  { id:'subscript',  name:'Subscript',    icon:<Subscript     size={13}/>, shortcut:'' },
  { id:'superscript',name:'Superscript',  icon:<Superscript   size={13}/>, shortcut:'' },
  { id:'uppercase',  name:'UPPERCASE',    icon:<CaseUpper     size={13}/>, shortcut:'' },
  { id:'lowercase',  name:'lowercase',    icon:<CaseLower     size={13}/>, shortcut:'' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PORTAL DROPDOWN
   Mounts into document.body so NO parent overflow/z-index can clip it.
   Position calculated from the anchor button's getBoundingClientRect().
═══════════════════════════════════════════════════════════════════════════ */
interface PortalDropdownProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  width?: number;
  align?: 'left' | 'right';
  children: React.ReactNode;
  onClose: () => void;
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
  anchorRef, open, width = 224, align = 'left', children, onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  // SSR guard
  useEffect(() => { setMounted(true); }, []);

  // Recalculate position every time the dropdown opens
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const left = align === 'right'
      ? Math.max(8, r.right - width)
      : Math.min(r.left, window.innerWidth - width - 8);
    setPos({ top: r.bottom + 6, left });
  }, [open, anchorRef, width, align]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        anchorRef.current && !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    // Use a small delay so the same click that opens doesn't immediately close
    const id = setTimeout(() => document.addEventListener('mousedown', handle), 10);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handle); };
  }, [open, onClose, anchorRef]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width, zIndex: 99999 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.18)] overflow-hidden animate-tb-dropdown"
      onMouseDown={e => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
};

/* ─── Sub-menu portal (flies right of its trigger row) ───────────────────── */
interface SubMenuProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  openSub: string | null;
  setOpenSub: React.Dispatch<React.SetStateAction<string | null>>;
}

const SubMenu: React.FC<SubMenuProps> = ({ id, label, icon, children, openSub, setOpenSub }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const isOpen = openSub === id;

  const open = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.top, left: r.right + 4 });
    setOpenSub(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(t) &&
        triggerRef.current && !triggerRef.current.contains(t)
      ) {
        setOpenSub(null);
      }
    };
    const tid = setTimeout(() => document.addEventListener('mousedown', handle), 10);
    return () => { clearTimeout(tid); document.removeEventListener('mousedown', handle); };
  }, [isOpen, setOpenSub]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={open}
        className={`w-full flex items-center justify-between gap-2 px-3 py-[7px] text-[13px] transition-colors hover:bg-gray-50 ${isOpen ? 'bg-gray-50 text-blue-600' : 'text-gray-700'}`}
      >
        <span className="flex items-center gap-2.5">
          {icon && <span className="opacity-70">{icon}</span>}
          <span>{label}</span>
        </span>
        <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
      </button>

      {isOpen && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 208, zIndex: 100000 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.18)] overflow-hidden animate-tb-dropdown"
          onMouseDown={e => e.stopPropagation()}
        >
          <TbScroll>{children}</TbScroll>
        </div>,
        document.body,
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PRIMITIVE UI — all TOP-LEVEL (never defined inside Toolbar render)
═══════════════════════════════════════════════════════════════════════════ */

const Divider = () => <div className="h-px bg-gray-100 my-1" />;

const Sep = () => <div className="flex-shrink-0 w-px h-5 bg-gray-200 mx-1 self-center" />;

const TbSection = ({ title }: { title: string }) => (
  <div className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
    {title}
  </div>
);

const TbScroll = ({ children, maxH = 'max-h-72' }: { children: React.ReactNode; maxH?: string }) => (
  <div className={`${maxH} overflow-y-auto tb-scroll`}>{children}</div>
);

const TbItem = ({
  icon, label, shortcut, onClick, active = false,
}: { icon?: React.ReactNode; label: string; shortcut?: string; onClick?: () => void; active?: boolean }) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); onClick?.(); }}
    className={`w-full flex items-center justify-between gap-2 px-3 py-[7px] text-[13px] transition-colors hover:bg-gray-50 active:bg-gray-100 ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
  >
    <span className="flex items-center gap-2.5 min-w-0">
      {icon && <span className="flex-shrink-0 opacity-70">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
    {shortcut && <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">{shortcut}</span>}
  </button>
);

const ToolBtn = ({
  icon, title, onClick, active = false,
}: { icon: React.ReactNode; title: string; onClick?: () => void; active?: boolean }) => (
  <button
    type="button"
    title={title}
    onMouseDown={e => { e.preventDefault(); onClick?.(); }}
    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 hover:bg-gray-100 active:scale-95 active:bg-gray-200 ${active ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-600 hover:text-gray-800'}`}
  >
    {icon}
  </button>
);

// MenuBtn holds its own stable ref so PortalDropdown can measure it
interface MenuBtnProps {
  menuId: string;
  icon: React.ReactNode;
  title: string;
  openMenu: string | null;
  btnRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: (id: string) => void;
}
const MenuBtn: React.FC<MenuBtnProps> = ({ menuId, icon, title, openMenu, btnRef, onToggle }) => (
  <button
    ref={btnRef}
    type="button"
    title={title}
    onMouseDown={e => { e.preventDefault(); onToggle(menuId); }}
    className={`flex-shrink-0 flex items-center gap-0.5 px-1.5 h-8 rounded-lg transition-all duration-150 hover:bg-gray-100 active:scale-95 ${openMenu === menuId ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
  >
    {icon}
    <ChevronDown size={9} className="opacity-40 mt-px" />
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN TOOLBAR
═══════════════════════════════════════════════════════════════════════════ */
const Toolbar: React.FC<ToolbarProps> = ({
  onImport, onExport, onSave, onUndo, onRedo, onCopy, onDelete,
  onZoomIn, onZoomOut, onFitScreen, onTextAdd, onShapeSelect,
  onArrowSelect, onLineSelect, onBrushSelect,
  onLayerAdd, onLayerDelete,
  onEraserToggle, onCropToggle, onMoveToggle, onGridToggle, onRulerToggle,
}) => {
  const [openMenu,      setOpenMenu]      = useState<string | null>(null);
  const [openSub,       setOpenSub]       = useState<string | null>(null);
  const [fontFamily,    setFontFamily]    = useState('Georgia');
  const [fontSize,      setFontSize]      = useState(16);
  const [brushSize,     setBrushSize]     = useState(4);
  const [brushOpacity,  setBrushOpacity]  = useState(100);
  const [brushColor,    setBrushColor]    = useState('#000000');
  const [selectedBrush, setSelectedBrush] = useState('pencil');
  const [zoom,          setZoom]          = useState(100);
  const [activeTool,    setActiveTool]    = useState<string | null>(null);

  // One stable ref per MenuBtn — created at module level (inside component but NOT in render)
  const fileRef   = useRef<HTMLButtonElement>(null);
  const brushRef  = useRef<HTMLButtonElement>(null);
  const textRef   = useRef<HTMLButtonElement>(null);
  const shapesRef = useRef<HTMLButtonElement>(null);
  const arrowsRef = useRef<HTMLButtonElement>(null);
  const linesRef  = useRef<HTMLButtonElement>(null);
  const layersRef = useRef<HTMLButtonElement>(null);

  const refMap: Record<string, React.RefObject<HTMLButtonElement | null>> = {
    file: fileRef, brush: brushRef, text: textRef,
    shapes: shapesRef, arrows: arrowsRef, lines: linesRef, layers: layersRef,
  };

  const closeAll = useCallback(() => {
    setOpenMenu(null);
    setOpenSub(null);
  }, []);

  const toggleMenu = useCallback((id: string) => {
    setOpenMenu(prev => (prev === id ? null : id));
    setOpenSub(null);
  }, []);

  const handleZoomIn    = () => { setZoom(z => Math.min(500, z + 10)); onZoomIn?.(); };
  const handleZoomOut   = () => { setZoom(z => Math.max(10,  z - 10)); onZoomOut?.(); };
  const handleFitScreen = () => { setZoom(100); onFitScreen?.(); };
  const toggleTool      = (id: string, cb?: () => void) => { setActiveTool(p => p === id ? null : id); cb?.(); };

  const isOpen = (id: string) => openMenu === id;

  return (
    <>
      <style>{`
        @keyframes tb-dropdown-in {
          from { opacity:0; transform:translateY(-6px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)   scale(1);     }
        }
        .animate-tb-dropdown { animation: tb-dropdown-in 0.14s ease both; }
        .tb-scroll::-webkit-scrollbar       { width: 4px; }
        .tb-scroll::-webkit-scrollbar-track { background: transparent; }
        .tb-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .tb-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        .tb-no-scroll::-webkit-scrollbar { display: none; }
        .tb-no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-gray-200 shadow-sm select-none"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-0.5 h-12 px-2 overflow-x-auto tb-no-scroll">

          {/* ── FILE ──────────────────────────────────────────────── */}
          <MenuBtn menuId="file" icon={<Settings size={16}/>} title="File & Settings"
            openMenu={openMenu} btnRef={fileRef} onToggle={toggleMenu} />
          <PortalDropdown anchorRef={fileRef} open={isOpen('file')} width={256} onClose={closeAll}>
            <TbScroll maxH="max-h-[520px]">
              <TbSection title="Import" />
              <TbItem icon={<Upload size={14}/>}     label="Import Image"    shortcut="⌘I"
                onClick={() => { document.getElementById('tb-img-input')?.click(); closeAll(); }} />
              <TbItem icon={<Upload size={14}/>}     label="Import PDF" />
              <TbItem icon={<FolderOpen size={14}/>} label="Open Project"    shortcut="⌘O" />
              <Divider />
              <TbSection title="Export" />
              <TbItem icon={<Download size={14}/>} label="Export as PNG" onClick={() => { onExport?.('PNG'); closeAll(); }} />
              <TbItem icon={<Download size={14}/>} label="Export as JPG" onClick={() => { onExport?.('JPG'); closeAll(); }} />
              <TbItem icon={<Download size={14}/>} label="Export as SVG" onClick={() => { onExport?.('SVG'); closeAll(); }} />
              <TbItem icon={<Download size={14}/>} label="Export as PDF" onClick={() => { onExport?.('PDF'); closeAll(); }} />
              <TbItem icon={<File     size={14}/>} label="Export as JSON" />
              <Divider />
              <TbSection title="Project" />
              <TbItem icon={<Save          size={14}/>} label="Save"           shortcut="⌘S" onClick={() => { onSave?.(); closeAll(); }} />
              <TbItem icon={<Cloud         size={14}/>} label="Save to Cloud" />
              <TbItem icon={<DownloadCloud size={14}/>} label="Download Backup" />
              <Divider />
              <TbSection title="Share & Print" />
              <TbItem icon={<Printer size={14}/>} label="Print" shortcut="⌘P" />
              <TbItem icon={<Share2  size={14}/>} label="Share" />
              <Divider />
              <TbSection title="Integrations" />
              <SubMenu id="social" label="Social Media Icons" icon={<TwitterIcon size={14}/>} openSub={openSub} setOpenSub={setOpenSub}>
                <TbItem icon={<TwitterIcon   size={14}/>} label="Twitter / X" />
                <TbItem icon={<FacebookIcon  size={14}/>} label="Facebook" />
                <TbItem icon={<InstagramIcon size={14}/>} label="Instagram" />
                <TbItem icon={<LinkedinIcon  size={14}/>} label="LinkedIn" />
                <TbItem icon={<YoutubeIcon   size={14}/>} label="YouTube" />
                <TbItem icon={<GithubIcon    size={14}/>} label="GitHub" />
                <TbItem icon={<FigmaIcon     size={14}/>} label="Figma" />
              </SubMenu>
              <SubMenu id="finance" label="Finance Icons" icon={<BankIcon size={14}/>} openSub={openSub} setOpenSub={setOpenSub}>
                <TbItem icon={<span className="font-bold text-[13px]">$</span>} label="Dollar" />
                <TbItem icon={<span className="font-bold text-[13px]">€</span>} label="Euro" />
                <TbItem icon={<span className="font-bold text-[13px]">£</span>} label="Pound" />
                <TbItem icon={<YenIcon     size={14}/>} label="Yen / Yuan" />
                <TbItem icon={<BitcoinIcon size={14}/>} label="Bitcoin" />
                <TbItem icon={<BankIcon    size={14}/>} label="Bank / Finance" />
              </SubMenu>
            </TbScroll>
          </PortalDropdown>

          <Sep />

          {/* ── EDIT ──────────────────────────────────────────────── */}
          <ToolBtn icon={<Undo2  size={16}/>} title="Undo (⌘Z)"  onClick={onUndo} />
          <ToolBtn icon={<Redo2  size={16}/>} title="Redo (⌘⇧Z)" onClick={onRedo} />
          <ToolBtn icon={<Copy   size={16}/>} title="Copy (⌘C)"  onClick={onCopy} />
          <ToolBtn icon={<Trash2 size={16}/>} title="Delete"      onClick={onDelete} />

          <Sep />

          {/* ── BRUSH ─────────────────────────────────────────────── */}
          <MenuBtn menuId="brush" icon={<Brush size={16}/>} title="Brush Tools"
            openMenu={openMenu} btnRef={brushRef} onToggle={toggleMenu} />
          <PortalDropdown anchorRef={brushRef} open={isOpen('brush')} width={288} onClose={closeAll}>
            <TbScroll maxH="max-h-[540px]">
              <TbSection title="Brush Type" />
              <div className="grid grid-cols-2 gap-0.5 p-1.5">
                {BRUSHES.map(b => (
                  <button key={b.id} type="button"
                    onMouseDown={e => { e.preventDefault(); setSelectedBrush(b.id); onBrushSelect?.(b); closeAll(); }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] transition-all hover:bg-gray-50 ${selectedBrush===b.id ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-700'}`}
                  >
                    <span className="opacity-70">{b.icon}</span>
                    <div className="text-left min-w-0">
                      <div className="font-medium leading-none truncate">{b.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate">{b.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <Divider />
              <div className="p-3 space-y-3">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs text-gray-500">Size</label>
                    <span className="text-xs font-mono text-gray-700">{brushSize}px</span>
                  </div>
                  <input type="range" min={1} max={80} value={brushSize}
                    onChange={e => setBrushSize(+e.target.value)}
                    onMouseDown={e => e.stopPropagation()}
                    className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs text-gray-500">Opacity</label>
                    <span className="text-xs font-mono text-gray-700">{brushOpacity}%</span>
                  </div>
                  <input type="range" min={1} max={100} value={brushOpacity}
                    onChange={e => setBrushOpacity(+e.target.value)}
                    onMouseDown={e => e.stopPropagation()}
                    className="w-full accent-blue-500 h-1.5 rounded-full cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Color</label>
                  <input type="color" value={brushColor}
                    onChange={e => setBrushColor(e.target.value)}
                    onMouseDown={e => e.stopPropagation()}
                    className="w-full h-8 rounded-lg cursor-pointer border border-gray-200" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Quick Swatches</label>
                  <div className="grid grid-cols-6 gap-1">
                    {SWATCHES.map(c => (
                      <button key={c} type="button" title={c}
                        onMouseDown={e => { e.preventDefault(); setBrushColor(c); }}
                        className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 active:scale-95 ${brushColor===c ? 'border-blue-400 scale-110' : 'border-gray-100'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            </TbScroll>
          </PortalDropdown>

          <ToolBtn icon={<Droplet      size={16}/>} title="Fill / Paint Bucket" />
          <ToolBtn icon={<Eraser       size={16}/>} title="Eraser"
            active={activeTool==='eraser'} onClick={() => toggleTool('eraser', onEraserToggle)} />
          <ToolBtn icon={<MousePointer2 size={16}/>} title="Select / Move"
            active={activeTool==='select'} onClick={() => toggleTool('select', onMoveToggle)} />

          <Sep />

          {/* ── TEXT ──────────────────────────────────────────────── */}
          <MenuBtn menuId="text" icon={<Type size={16}/>} title="Text Tool"
            openMenu={openMenu} btnRef={textRef} onToggle={toggleMenu} />
          <PortalDropdown anchorRef={textRef} open={isOpen('text')} width={320} onClose={closeAll}>
            <TbScroll maxH="max-h-[560px]">
              <div className="p-2">
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); onTextAdd?.(fontFamily, fontSize); closeAll(); }}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
                  + Add Text Box
                </button>
              </div>
              <Divider />
              <TbSection title="Font Family" />
              <TbScroll maxH="max-h-44">
                {FONTS.map(f => (
                  <button key={f} type="button"
                    onMouseDown={e => { e.preventDefault(); setFontFamily(f); }}
                    className={`w-full px-3 py-[7px] text-left text-[13px] transition-colors hover:bg-gray-50 ${fontFamily===f ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                    style={{ fontFamily: f }}>
                    {f}
                  </button>
                ))}
              </TbScroll>
              <Divider />
              <TbSection title="Font Size" />
              <div className="grid grid-cols-5 gap-1 p-2">
                {FONT_SIZES.map(s => (
                  <button key={s} type="button"
                    onMouseDown={e => { e.preventDefault(); setFontSize(s); }}
                    className={`py-1.5 text-xs rounded-lg transition-colors hover:bg-gray-50 ${fontSize===s ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <Divider />
              <TbSection title="Style" />
              <div className="grid grid-cols-2 gap-0.5 p-1.5">
                {TEXT_STYLES.map(s => (
                  <button key={s.id} type="button" onMouseDown={e => e.preventDefault()}
                    className="flex items-center gap-2 px-2.5 py-2 text-[13px] text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="opacity-60">{s.icon}</span>
                    <span>{s.name}</span>
                    {s.shortcut && <span className="ml-auto text-[10px] text-gray-400 font-mono">{s.shortcut}</span>}
                  </button>
                ))}
              </div>
              <Divider />
              <TbSection title="Alignment" />
              <div className="flex gap-1 px-2 pb-2">
                {[
                  { icon:<AlignLeft    size={14}/>, label:'Left' },
                  { icon:<AlignCenter  size={14}/>, label:'Center' },
                  { icon:<AlignRight   size={14}/>, label:'Right' },
                  { icon:<AlignJustify size={14}/>, label:'Justify' },
                ].map(a => (
                  <button key={a.label} type="button" title={a.label}
                    onMouseDown={e => e.preventDefault()}
                    className="flex-1 flex justify-center items-center py-2 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                    {a.icon}
                  </button>
                ))}
              </div>
            </TbScroll>
          </PortalDropdown>

          <Sep />

          {/* ── SHAPES ────────────────────────────────────────────── */}
          <MenuBtn menuId="shapes" icon={<Shapes size={16}/>} title="Shapes"
            openMenu={openMenu} btnRef={shapesRef} onToggle={toggleMenu} />
          <PortalDropdown anchorRef={shapesRef} open={isOpen('shapes')} width={288} onClose={closeAll}>
            <TbScroll maxH="max-h-[520px]">
              <TbSection title="Basic Shapes" />
              <div className="grid grid-cols-3 gap-0.5 p-1.5">
                {SHAPES_BASIC.map(s => (
                  <button key={s.id} type="button"
                    onMouseDown={e => { e.preventDefault(); onShapeSelect?.(s); closeAll(); }}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-gray-50 hover:text-blue-500 text-gray-700 transition-all">
                    {s.icon}<span className="text-[11px] text-center leading-tight">{s.name}</span>
                  </button>
                ))}
              </div>
              <Divider />
              <TbSection title="Polygon & Star" />
              <div className="grid grid-cols-3 gap-0.5 p-1.5">
                {SHAPES_POLYGON.map(s => (
                  <button key={s.id} type="button"
                    onMouseDown={e => { e.preventDefault(); onShapeSelect?.(s); closeAll(); }}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-gray-50 hover:text-blue-500 text-gray-700 transition-all">
                    {s.icon}<span className="text-[11px] text-center leading-tight">{s.name}</span>
                  </button>
                ))}
              </div>
              <Divider />
              <TbSection title="Special Shapes" />
              <div className="grid grid-cols-4 gap-0.5 p-1.5">
                {SHAPES_SPECIAL.map(s => (
                  <button key={s.id} type="button"
                    onMouseDown={e => { e.preventDefault(); onShapeSelect?.(s); closeAll(); }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 hover:text-blue-500 text-gray-700 transition-all">
                    {s.icon}<span className="text-[10px] text-center leading-tight">{s.name}</span>
                  </button>
                ))}
              </div>
            </TbScroll>
          </PortalDropdown>

          {/* ── ARROWS ────────────────────────────────────────────── */}
          <MenuBtn menuId="arrows" icon={<ArrowRight size={16}/>} title="Arrows"
            openMenu={openMenu} btnRef={arrowsRef} onToggle={toggleMenu} />
          <PortalDropdown anchorRef={arrowsRef} open={isOpen('arrows')} width={224} onClose={closeAll}>
            <TbScroll maxH="max-h-[400px]">
              <TbSection title="Arrow Types" />
              {ARROWS.map(a => (
                <TbItem key={a.id} icon={a.icon} label={a.name}
                  onClick={() => { onArrowSelect?.(a); closeAll(); }} />
              ))}
            </TbScroll>
          </PortalDropdown>

          {/* ── LINES ─────────────────────────────────────────────── */}
          <MenuBtn menuId="lines" icon={<Minus size={16}/>} title="Lines"
            openMenu={openMenu} btnRef={linesRef} onToggle={toggleMenu} />
          <PortalDropdown anchorRef={linesRef} open={isOpen('lines')} width={224} onClose={closeAll}>
            <TbScroll maxH="max-h-[400px]">
              <TbSection title="Line Types" />
              {LINES.map(l => (
                <TbItem key={l.id} icon={l.icon} label={l.name}
                  onClick={() => { onLineSelect?.(l); closeAll(); }} />
              ))}
            </TbScroll>
          </PortalDropdown>

          <Sep />

          {/* ── TRANSFORM ─────────────────────────────────────────── */}
          <ToolBtn icon={<Move           size={16}/>} title="Move"
            active={activeTool==='move'} onClick={() => toggleTool('move', onMoveToggle)} />
          <ToolBtn icon={<Crop           size={16}/>} title="Crop"
            active={activeTool==='crop'} onClick={() => toggleTool('crop', onCropToggle)} />
          <ToolBtn icon={<RotateCw       size={16}/>} title="Rotate CW" />
          <ToolBtn icon={<FlipHorizontal size={16}/>} title="Flip Horizontal" />
          <ToolBtn icon={<FlipVertical   size={16}/>} title="Flip Vertical" />

          <Sep />

          {/* ── LAYERS ────────────────────────────────────────────── */}
          <MenuBtn menuId="layers" icon={<Layers size={16}/>} title="Layers"
            openMenu={openMenu} btnRef={layersRef} onToggle={toggleMenu} />
          <PortalDropdown anchorRef={layersRef} open={isOpen('layers')} width={224} onClose={closeAll}>
            <TbSection title="Layer Actions" />
            <TbItem icon={<Layers   size={14}/>} label="Add Layer"       onClick={() => { onLayerAdd?.();    closeAll(); }} />
            <TbItem icon={<Trash2   size={14}/>} label="Delete Layer"    onClick={() => { onLayerDelete?.(); closeAll(); }} />
            <TbItem icon={<CopyPlus size={14}/>} label="Duplicate Layer" />
            <Divider />
            <TbItem icon={<Eye  size={14}/>} label="Toggle Visibility" />
            <TbItem icon={<Lock size={14}/>} label="Lock Layer" />
            <Divider />
            <TbSection title="Order" />
            <TbItem icon={<ArrowUp      size={14}/>} label="Bring to Front" shortcut="⌘]" />
            <TbItem icon={<ArrowDown    size={14}/>} label="Send to Back"   shortcut="⌘[" />
            <TbItem icon={<ChevronRight size={14}/>} label="Move Forward"   shortcut="⌘." />
            <TbItem icon={<ChevronLeft  size={14}/>} label="Move Backward"  shortcut="⌘," />
            <Divider />
            <TbSection title="Group" />
            <TbItem icon={<Code size={14}/>} label="Group Selected" shortcut="⌘G" />
            <TbItem icon={<Code size={14}/>} label="Ungroup"        shortcut="⌘⇧G" />
          </PortalDropdown>

          <ToolBtn icon={<Grid              size={16}/>} title="Toggle Grid"      onClick={onGridToggle} />
          <ToolBtn icon={<Ruler             size={16}/>} title="Toggle Ruler"     onClick={onRulerToggle} />
          <ToolBtn icon={<SlidersHorizontal size={16}/>} title="Adjust / Filters" />
          <ToolBtn icon={<Pipette           size={16}/>} title="Color Picker" />

          <div className="flex-1 min-w-2" />

          {/* ── ZOOM ──────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center gap-0.5">
            <ToolBtn icon={<ZoomOut  size={15}/>} title="Zoom Out"      onClick={handleZoomOut} />
            <span className="text-[12px] font-mono text-gray-600 min-w-[42px] text-center px-1 py-1 rounded hover:bg-gray-100 cursor-default transition-colors">
              {zoom}%
            </span>
            <ToolBtn icon={<ZoomIn   size={15}/>} title="Zoom In"       onClick={handleZoomIn} />
            <ToolBtn icon={<Maximize size={15}/>} title="Fit to Screen" onClick={handleFitScreen} />
          </div>
        </div>

        <input id="tb-img-input" type="file" accept="image/*" className="hidden"
          onChange={e => {
            if (e.target.files?.[0]) { onImport?.(e.target.files[0]); (e.target as HTMLInputElement).value = ''; }
          }} />
      </div>
    </>
  );
};

export default Toolbar;