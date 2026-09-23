export type PlayerRole = 'PEMAIN' | 'KIPER' | 'COACH' | 'OFFICIAL' | 'LAINNYA';

export interface PlayerItem {
  id: string;
  name: string;
  size: string;
  pantsSize?: string;
  number: string;
  sleeve?: 'pendek' | 'panjang';
  note: string;
}

export type OrderStatus = 'Draft' | 'Proses Potong' | 'Proses Jahit' | 'QC Passed' | 'Selesai';

export interface WorkflowProgress {
  cutting: {
    patternCut: boolean;
    pantsCollarCut: boolean;
    specialItemsSeparated: boolean;
  };
  sewing: {
    bodySleeveJoined: boolean;
    collarElasticSewed: boolean;
    overdeckFinished: boolean;
  };
}

export interface WorkerItem {
  id: number | string;
  name: string;
  role: 'potong' | 'jahit';
  active?: boolean;
}

export interface OrderDetails {
  id: string;
  spkNumber: string;
  teamName: string;
  clientContact: string;
  orderDate: string;
  deadlineDate: string;
  fabricType: string;
  collarType: string;
  printingType: string;
  pantsColor: string;
  cuttingTeam?: string;
  sewingTeam?: string;
  assignedWorkerIds?: (number | string)[];
  specialNotes: string;
  status: OrderStatus;
  players: PlayerItem[];
  workflow?: WorkflowProgress;
  photos?: string[];
  updatedAt: string;
}

export interface ProductionRecap {
  totalJersey: number;
  totalCelana: number;
  totalPlayers: number;
  sizeJerseyCounts: Record<string, number>;
  sizeCelanaCounts: Record<string, number>;
  kiperCount: number;
  tanpaCelanaCount: number;
  lenganPanjangCount: number;
  duplicateNumbers: string[];
}
