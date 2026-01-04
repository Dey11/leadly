export type IcpFormState = {
  name: string;
  summary: string;
  targetPersona: string;
  pains: string;
  valueProposition: string;
  qualifyingSignals: string;
  disqualifyingSignals: string;
  platform: string;
};

export type IcpFieldProps = {
  values: IcpFormState;
  onChange: (
    field: keyof IcpFormState,
  ) => (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  error: string | null;
  disabled?: boolean;
};
