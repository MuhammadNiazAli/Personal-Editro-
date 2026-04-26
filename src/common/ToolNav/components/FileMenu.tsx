'use client';

import React from 'react';
import { 
  Upload, Download, Save, Printer, Share2, FolderOpen, 
  Cloud, DownloadCloud, DollarSign, Euro, PoundSterling,
  Bitcoin, Landmark, TrendingUp, Wallet, 
  Users, Briefcase, Heart, Star, Camera, Music
} from 'lucide-react';
import { PortalDropdown } from '../components/ui/PortalDropdown';
import { SubMenu } from '../components/ui/SubMenu';

interface FileMenuProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onImport?: (file: File) => void;
  onExport?: (format: string) => void;
  onSave?: () => void;
}

const SOCIAL_ICONS = [
  { id: 'users', name: 'Social Media', icon: Users },
  { id: 'briefcase', name: 'Business', icon: Briefcase },
  { id: 'heart', name: 'Lifestyle', icon: Heart },
  { id: 'star', name: 'Favorites', icon: Star },
  { id: 'camera', name: 'Photography', icon: Camera },
  { id: 'music', name: 'Music', icon: Music },
];

const FINANCE_ICONS = [
  { id: 'dollar', name: 'Dollar', icon: DollarSign, symbol: '$' },
  { id: 'euro', name: 'Euro', icon: Euro, symbol: '€' },
  { id: 'pound', name: 'Pound', icon: PoundSterling, symbol: '£' },
  { id: 'bitcoin', name: 'Bitcoin', icon: Bitcoin, symbol: '₿' },
  { id: 'bank', name: 'Bank', icon: Landmark, symbol: '🏦' },
  { id: 'chart', name: 'Chart', icon: TrendingUp, symbol: '📈' },
  { id: 'wallet', name: 'Wallet', icon: Wallet, symbol: '👛' },
];

export const FileMenu: React.FC<FileMenuProps> = ({
  isOpen, anchorRef, onClose, onImport, onExport, onSave,
}) => {
  const triggerImport = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
    onClose();
  };

  return (
    <PortalDropdown isOpen={isOpen} anchorRef={anchorRef} onClose={onClose} width={260}>
      <div className="py-2 max-h-[500px] overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Import
        </div>
        <button
          onClick={triggerImport}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Upload size={14} /> Import Image
        </button>
        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <FolderOpen size={14} /> Open Project
        </button>

        <div className="border-t my-2" />

        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Export
        </div>
        <button
          onClick={() => { onExport?.('PNG'); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Download size={14} /> Export as PNG
        </button>
        <button
          onClick={() => { onExport?.('JPG'); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Download size={14} /> Export as JPG
        </button>
        <button
          onClick={() => { onExport?.('SVG'); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Download size={14} /> Export as SVG
        </button>
        <button 
          onClick={() => { onExport?.('PDF'); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Download size={14} /> Export as PDF
        </button>

        <div className="border-t my-2" />

        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Project
        </div>
        <button
          onClick={() => { onSave?.(); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Save size={14} /> Save
        </button>
        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Cloud size={14} /> Save to Cloud
        </button>
        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <DownloadCloud size={14} /> Download Backup
        </button>

        <div className="border-t my-2" />

        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Share & Print
        </div>
        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Printer size={14} /> Print
        </button>
        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Share2 size={14} /> Share
        </button>

        <div className="border-t my-2" />

        <SubMenu label="Icon Library" icon={<Star size={14} />}>
          <div className="py-2">
            {SOCIAL_ICONS.map((IconItem) => (
              <button
                key={IconItem.id}
                onClick={onClose}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <IconItem.icon size={16} />
                <span>{IconItem.name}</span>
              </button>
            ))}
          </div>
        </SubMenu>

        <SubMenu label="Currency Icons" icon={<DollarSign size={14} />}>
          <div className="py-2">
            {FINANCE_ICONS.map((IconItem) => (
              <button
                key={IconItem.id}
                onClick={onClose}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <IconItem.icon size={16} />
                <span>{IconItem.name}</span>
              </button>
            ))}
          </div>
        </SubMenu>
      </div>
    </PortalDropdown>
  );
};