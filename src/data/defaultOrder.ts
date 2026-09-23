import { OrderDetails, WorkerItem } from '../types/jersey';

export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

export const SIZE_CHART_DATA = [
  { size: 'XS', chest: '46 cm', length: '66 cm', pantsLength: '42 cm' },
  { size: 'S', chest: '48 cm', length: '68 cm', pantsLength: '44 cm' },
  { size: 'M', chest: '50 cm', length: '70 cm', pantsLength: '46 cm' },
  { size: 'L', chest: '52 cm', length: '72 cm', pantsLength: '48 cm' },
  { size: 'XL', chest: '54 cm', length: '74 cm', pantsLength: '50 cm' },
  { size: 'XXL', chest: '56 cm', length: '76 cm', pantsLength: '52 cm' },
  { size: '3XL', chest: '58 cm', length: '78 cm', pantsLength: '54 cm' },
  { size: '4XL', chest: '60 cm', length: '80 cm', pantsLength: '56 cm' },
];

export const FABRIC_OPTIONS = [
  'Dryfit Milano',
  'Dryfit Benzema',
  'Dryfit Serena',
  'Dryfit Brazil / Dot Drop'
];

export const COLLAR_OPTIONS = [
  'V-Neck Variasi',
  'O-Neck (Bulat)',
  'Polo / Wangky',
  'Kerah Mandarin / Sanghai'
];

export const PRINTING_OPTIONS = [
  'Full Print Sublimasi',
  'Sublimasi Depan Saja',
  'Sablon DTF Plastisol',
  'Polyflex PU'
];

export const DEFAULT_WORKERS: WorkerItem[] = [
  { id: 1, name: 'APLES', role: 'potong', active: true },
  { id: 2, name: 'HILMI', role: 'potong', active: false },
  { id: 3, name: 'AKOK', role: 'jahit', active: true },
  { id: 4, name: 'OPHY', role: 'jahit', active: false }
];

export const DEFAULT_INITIAL_ORDER: OrderDetails = {
  id: 'order-fusixto-2-0',
  spkNumber: 'SPK-2026/09/001',
  teamName: 'FUSIXTO 2.0',
  clientContact: 'Budi (0812-3456-7890)',
  orderDate: new Date().toISOString().split('T')[0],
  deadlineDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  fabricType: 'Dryfit Milano',
  collarType: 'V-Neck Variasi',
  printingType: 'Full Print Sublimasi',
  pantsColor: 'Polos Non-Print + Nomor Polyflex',
  cuttingTeam: 'Tim Potong A',
  sewingTeam: 'Tim Jahit 1',
  assignedWorkerIds: [1, 3],
  specialNotes: '',
  status: 'Proses Jahit',
  workflow: {
    cutting: {
      patternCut: true,
      pantsCollarCut: true,
      specialItemsSeparated: true,
    },
    sewing: {
      bodySleeveJoined: true,
      collarElasticSewed: false,
      overdeckFinished: false,
    }
  },
  photos: [],
  players: [
    { id: 'p1', name: 'SAFFANA', size: 'S', number: '15', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p2', name: 'KIBOY', size: 'M', number: '30', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p3', name: 'ZLATAN IBRAHIMOVIK', size: 'M', number: '23', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p4', name: 'ALLY', size: 'M', number: '12', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p5', name: 'PAEL', size: 'M', number: '8', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p6', name: 'RRRR', size: 'M', number: '11', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p7', name: 'FAHRI', size: 'M', number: '6', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p8', name: 'PAULO HERRI', size: 'M', number: '29', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p9', name: 'IBNU', size: 'M', number: '14', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p10', name: 'RAJA', size: 'M', number: '33', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p11', name: 'PAKII', size: 'M', number: '66', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p12', name: 'LATHIF', size: 'M', number: '20', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p13', name: 'MIKE', size: 'M', number: '16', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p14', name: 'DESNITO', size: 'L', number: '10', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p15', name: 'MUHAMAD HOLIK', size: 'L', number: '5', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p16', name: 'JUAN', size: 'L', number: '14', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p17', name: 'ALIP', size: 'L', number: '80', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p18', name: 'YAMAL', size: 'XL', number: '19', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p19', name: 'ARMAN', size: 'XXL', number: '26', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p20', name: 'ARCA', size: 'XXL', number: '38', sleeve: 'pendek', note: 'PEMAIN' },
    { id: 'p21', name: 'XAVIER', size: 'XXL', number: '23', sleeve: 'pendek', note: 'PEMAIN TANPA CELANA' },
    { id: 'p22', name: 'BINUS', size: 'L', number: '1', sleeve: 'pendek', note: 'KIEPR' },
    { id: 'p23', name: 'NUGROHO', size: 'M', number: '99', sleeve: 'pendek', note: 'KIPER' },
    { id: 'p24', name: 'COACH', size: 'XXL', number: '', sleeve: 'pendek', note: 'COACH' }
  ],
  updatedAt: new Date().toISOString()
};
