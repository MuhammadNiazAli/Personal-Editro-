'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  Download,
  Save,
  Printer,
  Share2,
  FolderOpen,
  Cloud,
  DownloadCloud,
  DollarSign,
  Euro,
  PoundSterling,
  Bitcoin,
  Landmark,
  TrendingUp,
  Wallet,
  Users,
  Briefcase,
  Heart,
  Star,
  Camera,
  Music,
  ChevronDown,
  Image,
  FileJson,
  FileText,
  BadgeDollarSign,
  Coins,
  CreditCard,
  Banknote,
  Receipt,
  PiggyBank,
  HandCoins,
  LineChart,
  CircleDollarSign,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Globe,
  Smile,
  Gamepad2,
  Video,
  Mic,
  Headphones,
  Check,
} from 'lucide-react';

import { PortalDropdown } from '../components/ui/PortalDropdown';
import {
  CanvasIconData,
  IconCategory,
  useCanvasStore,
} from '../components/store/canvasStore';

interface FileMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onImport?: (file: File) => void;
  onExport?: (format: string) => void;
  onSave?: () => void;
  onOpenProject?: () => void;
  onSaveCloud?: () => void;
  onDownloadBackup?: () => void;
  onIconSelect?: (icon: CanvasIconData) => void;
}

type IconItem = CanvasIconData & {
  icon: React.ElementType;
};

const SOCIAL_ICONS: IconItem[] = [
  {
    key: 'users',
    name: 'Social Media',
    icon: Users,
    category: 'social',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    category: 'social',
  },
  {
    key: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    category: 'social',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    category: 'media',
  },
  {
    key: 'twitter',
    name: 'X / Twitter',
    icon: Twitter,
    category: 'social',
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    category: 'business',
  },
  {
    key: 'message',
    name: 'Message',
    icon: MessageCircle,
    category: 'social',
  },
  {
    key: 'send',
    name: 'Send',
    icon: Send,
    category: 'social',
  },
  {
    key: 'globe',
    name: 'Website',
    icon: Globe,
    category: 'general',
  },
  {
    key: 'briefcase',
    name: 'Business',
    icon: Briefcase,
    category: 'business',
  },
  {
    key: 'heart',
    name: 'Lifestyle',
    icon: Heart,
    category: 'general',
  },
  {
    key: 'star',
    name: 'Favorites',
    icon: Star,
    category: 'general',
  },
  {
    key: 'camera',
    name: 'Photography',
    icon: Camera,
    category: 'media',
  },
  {
    key: 'music',
    name: 'Music',
    icon: Music,
    category: 'media',
  },
  {
    key: 'video',
    name: 'Video',
    icon: Video,
    category: 'media',
  },
  {
    key: 'mic',
    name: 'Microphone',
    icon: Mic,
    category: 'media',
  },
  {
    key: 'headphones',
    name: 'Headphones',
    icon: Headphones,
    category: 'media',
  },
  {
    key: 'smile',
    name: 'Community',
    icon: Smile,
    category: 'general',
  },
  {
    key: 'gamepad',
    name: 'Gaming',
    icon: Gamepad2,
    category: 'general',
  },
];

const FINANCE_ICONS: IconItem[] = [
  {
    key: 'dollar',
    name: 'Dollar',
    icon: DollarSign,
    symbol: '$',
    category: 'finance',
  },
  {
    key: 'euro',
    name: 'Euro',
    icon: Euro,
    symbol: '€',
    category: 'finance',
  },
  {
    key: 'pound',
    name: 'Pound',
    icon: PoundSterling,
    symbol: '£',
    category: 'finance',
  },
  {
    key: 'bitcoin',
    name: 'Bitcoin',
    icon: Bitcoin,
    symbol: '₿',
    category: 'finance',
  },
  {
    key: 'bank',
    name: 'Bank',
    icon: Landmark,
    symbol: '🏦',
    category: 'finance',
  },
  {
    key: 'chart',
    name: 'Chart',
    icon: TrendingUp,
    symbol: '📈',
    category: 'finance',
  },
  {
    key: 'wallet',
    name: 'Wallet',
    icon: Wallet,
    symbol: '👛',
    category: 'finance',
  },
  {
    key: 'badge-dollar',
    name: 'Price Badge',
    icon: BadgeDollarSign,
    symbol: '$',
    category: 'finance',
  },
  {
    key: 'coins',
    name: 'Coins',
    icon: Coins,
    symbol: '🪙',
    category: 'finance',
  },
  {
    key: 'credit-card',
    name: 'Credit Card',
    icon: CreditCard,
    symbol: '💳',
    category: 'finance',
  },
  {
    key: 'banknote',
    name: 'Banknote',
    icon: Banknote,
    symbol: '💵',
    category: 'finance',
  },
  {
    key: 'receipt',
    name: 'Receipt',
    icon: Receipt,
    symbol: '🧾',
    category: 'finance',
  },
  {
    key: 'piggy-bank',
    name: 'Savings',
    icon: PiggyBank,
    symbol: '🐖',
    category: 'finance',
  },
  {
    key: 'hand-coins',
    name: 'Payment',
    icon: HandCoins,
    symbol: '💰',
    category: 'finance',
  },
  {
    key: 'line-chart',
    name: 'Growth',
    icon: LineChart,
    symbol: '📈',
    category: 'finance',
  },
  {
    key: 'circle-dollar',
    name: 'Dollar Circle',
    icon: CircleDollarSign,
    symbol: '$',
    category: 'finance',
  },
];

type SectionKey = 'social' | 'finance' | null;

interface CollapsibleIconSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  items: IconItem[];
  isOpen: boolean;
  selectedKey?: string;
  onToggle: () => void;
  onSelect: (item: IconItem) => void;
}

const CollapsibleIconSection: React.FC<CollapsibleIconSectionProps> = ({
  title,
  subtitle,
  icon,
  items,
  isOpen,
  selectedKey,
  onToggle,
  onSelect,
}) => {
  return (
    <section className="rounded-xl border border-gray-100 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition hover:bg-gray-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </span>

          <span className="min-w-0">
            <span className="block truncate text-[12px] font-bold text-gray-900">
              {title}
            </span>

            <span className="block truncate text-[10px] text-gray-500">
              {subtitle}
            </span>
          </span>
        </span>

        <ChevronDown
          size={14}
          className={`shrink-0 text-gray-500 transition ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-2">
          <div className="max-h-[190px] overflow-y-auto rounded-xl bg-gray-50 p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                const selected = selectedKey === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelect(item)}
                    className={`rounded-xl border p-2 text-left transition ${
                      selected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                        : 'border-transparent bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <span className="mb-1 flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                          selected
                            ? 'bg-white/15 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Icon size={15} />
                      </span>

                      {selected ? (
                        <Check size={13} />
                      ) : (
                        item.symbol && (
                          <span className="text-[11px] font-bold text-gray-400">
                            {item.symbol}
                          </span>
                        )
                      )}
                    </span>

                    <span className="block truncate text-[12px] font-semibold">
                      {item.name}
                    </span>

                    <span
                      className={`block truncate text-[10px] ${
                        selected ? 'text-indigo-100' : 'text-gray-400'
                      }`}
                    >
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export const FileMenu: React.FC<FileMenuProps> = ({
  isOpen,
  anchorRef,
  onClose,
  onImport,
  onExport,
  onSave,
  onOpenProject,
  onSaveCloud,
  onDownloadBackup,
  onIconSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openSection, setOpenSection] = useState<SectionKey>(null);

  const { toolState, updateToolState, selectIconTool } = useCanvasStore();

  const selectedIconKey = toolState.selectedIconKey ?? '';

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onImport?.(file);
    event.target.value = '';
    onClose();
  };

  const handleExport = (format: string) => {
    onExport?.(format);
    onClose();
  };

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  const handlePrint = () => {
    window.print();
    onClose();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: 'Canvas project',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // User cancelled share dialog.
    }

    onClose();
  };

  const handleIconSelect = (item: IconItem) => {
    const iconData: CanvasIconData = {
      key: item.key,
      name: item.name,
      category: item.category as IconCategory,
      symbol: item.symbol,
    };

    selectIconTool(iconData);

    updateToolState({
      activeTool: 'icon',
      selectedIconKey: item.key,
      selectedIconName: item.name,
      selectedIconCategory: item.category as IconCategory,
      selectedIconSymbol: item.symbol ?? '',
      iconSize: toolState.iconSize ?? 44,
      iconColor: toolState.iconColor ?? toolState.brushColor ?? '#111827',
    });

    onIconSelect?.(iconData);
    onClose();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      <PortalDropdown
        isOpen={isOpen}
        anchorRef={anchorRef}
        onClose={onClose}
        width={336}
        align="left"
      >
        <div className="rounded-2xl bg-white text-sm">
          <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 px-3 py-2 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FolderOpen size={15} />
                  </span>

                  <span>File</span>
                </div>

                <p className="mt-0.5 truncate text-[11px] text-gray-500">
                  Import, export, save and icon library.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3">
            <section>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Import
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Upload size={14} />
                  Import
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenProject?.();
                    onClose();
                  }}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <FolderOpen size={14} />
                  Open
                </button>
              </div>
            </section>

            <section>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Export
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { format: 'PNG', icon: Image },
                  { format: 'JPG', icon: Image },
                  { format: 'SVG', icon: FileJson },
                  { format: 'PDF', icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.format}
                      type="button"
                      onClick={() => handleExport(item.format)}
                      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Icon size={14} />
                      {item.format}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Project
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Save size={14} />
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSaveCloud?.();
                    onClose();
                  }}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Cloud size={14} />
                  Cloud
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDownloadBackup?.();
                    onClose();
                  }}
                  className="col-span-2 flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <DownloadCloud size={14} />
                  Download Backup
                </button>
              </div>
            </section>

            <section>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Share & Print
              </label>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Printer size={14} />
                  Print
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-2 text-[12px] font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>
            </section>

            <CollapsibleIconSection
              title="Social Icons"
              subtitle={`${SOCIAL_ICONS.length} icons · click canvas to place`}
              icon={<Star size={15} />}
              items={SOCIAL_ICONS}
              selectedKey={selectedIconKey}
              isOpen={openSection === 'social'}
              onToggle={() =>
                setOpenSection((current) =>
                  current === 'social' ? null : 'social',
                )
              }
              onSelect={handleIconSelect}
            />

            <CollapsibleIconSection
              title="Finance Icons"
              subtitle={`${FINANCE_ICONS.length} icons · click canvas to place`}
              icon={<DollarSign size={15} />}
              items={FINANCE_ICONS}
              selectedKey={selectedIconKey}
              isOpen={openSection === 'finance'}
              onToggle={() =>
                setOpenSection((current) =>
                  current === 'finance' ? null : 'finance',
                )
              }
              onSelect={handleIconSelect}
            />
          </div>
        </div>
      </PortalDropdown>
    </>
  );
};