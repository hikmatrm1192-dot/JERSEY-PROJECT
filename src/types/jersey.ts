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

export type OrderStatus = 'Draft' | 'Bahan Diterima' | 'Proses Potong' | 'Proses Jahit' | 'QC Passed' | 'Selesai';

export type DivisionStatus = 'Belum Mulai' | 'Sedang Dikerjakan' | 'Selesai';

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
  productionChecklist?: {
    settingLayout: boolean;
    cutting: boolean;
    sewing: boolean;
    elastic: boolean;
    qc: boolean;
  };
}

export type WorkerRole = 'potong' | 'jahit' | 'potong_jahit';

export interface WorkerItem {
  id: number | string;
  name: string;
  role: WorkerRole;
  wagePerPiece?: number;
  active?: boolean;
}

export interface WorkerAssignment {
  workerId: number | string;
  workerName?: string;
  division: 'potong' | 'jahit';
  quantity: number;
  wagePerPiece: number;
  totalWage: number;
}

export interface OperationalCost {
  id: string;
  category: string;
  description?: string;
  amount: number;
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
  orderValue?: number;
  workerAssignments?: WorkerAssignment[];
  operationalCosts?: OperationalCost[];
  assignedWorkerIds?: (number | string)[];
  cuttingStatus?: DivisionStatus;
  sewingStatus?: DivisionStatus;
  workerNotes?: string;
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
