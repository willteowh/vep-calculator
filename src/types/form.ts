export interface FormState {
  vehicleCategory: string;
  hasIU: string;
  entryDatetime: string;
  departDatetime: string;
  entryCheckpoint: string;
  departCheckpoint: string;
}

export interface FormErrors {
  vehicleCategory?: string;
  hasIU?: string;
  entryDatetime?: string;
  departDatetime?: string;
  entryCheckpoint?: string;
  departCheckpoint?: string;
  _g?: string;
}

export const INITIAL_FORM_STATE: FormState = {
  vehicleCategory: "",
  hasIU: "",
  entryDatetime: "",
  departDatetime: "",
  entryCheckpoint: "",
  departCheckpoint: "",
};
