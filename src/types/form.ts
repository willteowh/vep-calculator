export interface FormState {
  vehicleCategory: string;
  hasIU: string;
  entryDatetime: string;
  departDatetime: string;
  entryCheckpoint: string;
  departCheckpoint: string;
  erpDays2026: string;
  erpDays2027: string;
}

export interface FormErrors {
  vehicleCategory?: string;
  hasIU?: string;
  entryDatetime?: string;
  departDatetime?: string;
  entryCheckpoint?: string;
  departCheckpoint?: string;
  erpDays2026?: string;
  erpDays2027?: string;
  _g?: string;
}

export const INITIAL_FORM_STATE: FormState = {
  vehicleCategory: "",
  hasIU: "",
  entryDatetime: "",
  departDatetime: "",
  entryCheckpoint: "",
  departCheckpoint: "",
  erpDays2026: "",
  erpDays2027: "",
};
