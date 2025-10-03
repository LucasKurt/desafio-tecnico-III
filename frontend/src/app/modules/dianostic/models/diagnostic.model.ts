export interface Diagnostic {
  id: string;
  patientName: string;
  modalityLabel: (typeof ImagingModalityPtLabel)[ImagingModality];
}

export interface CreateDiagnostic {
  patientId: string;
  modality: ImagingModality;
}

export enum ImagingModality {
  CR = 'CR',
  CT = 'CT',
  DX = 'DX',
  MG = 'MG',
  MR = 'MR',
  NM = 'NM',
  OT = 'OT',
  PT = 'PT',
  RF = 'RF',
  US = 'US',
  XA = 'XA'
}

export const ImagingModalityPtLabel: Record<ImagingModality, string> = {
  [ImagingModality.CR]: 'Radiografia Computadorizada (CR)',
  [ImagingModality.CT]: 'Tomografia Computadorizada (CT)',
  [ImagingModality.DX]: 'Radiografia Digital (DX)',
  [ImagingModality.MG]: 'Mamografia (MG)',
  [ImagingModality.MR]: 'Ressonância Magnética (MR)',
  [ImagingModality.NM]: 'Medicina Nuclear (NM)',
  [ImagingModality.OT]: 'Outros',
  [ImagingModality.PT]: 'Tomografia por Emissão de Pósitrons (PT)',
  [ImagingModality.RF]: 'Fluoroscopia (RF)',
  [ImagingModality.US]: 'Ultrassonografia (US)',
  [ImagingModality.XA]: 'Angiografia por Raios X (XA)'
};

export const imagingModalityOptions = Object.values(ImagingModality).map((value) => ({
  value,
  label: ImagingModalityPtLabel[value]
}));
