import type { EventInfo } from "@/lib/types/event";

/**
 * Registration-form builder model.
 *
 * An event's registration form is a list of sections, each holding fields. The
 * admin builder (NewForm → Section → FormField) edits this shape, the preview
 * and the live form (PreviewForm → SectionModal) render it, and it is stored as
 * JSON in `form.sections`. Names match the stored documents, so they are not
 * renamed.
 */

/** A rule checked against a field's answer, e.g. "length <= 50". */
export type FieldValidation = {
  _id: string;
  /** "length" is the only type the builder offers; "pattern" exists in old data. */
  type: string | null;
  value: string | number | null;
  /** One of ===, !==, <, >, <=, >= (or "match" for a pattern). */
  operator: string | null;
  message: string;
};

/**
 * A participant's answer. Text-like fields hold a string, a checkbox holds the
 * ticked options, and an image or file field holds the uploaded File.
 */
export type FieldAnswer = string | string[] | File;

export type FormFieldDef = {
  _id: string;
  name: string;
  /** text, number, radio, checkbox, select, date, image or file. */
  type: string;
  /** The placeholder, or a comma-separated option list for option fields. */
  value: string;
  isRequired: boolean;
  validations: FieldValidation[];
  /** Only while the form is being filled in: the participant's answer. */
  onChangeValue?: FieldAnswer;
};

/**
 * Where a section leads. The first entry has no `field_id` and is the default
 * route; the rest send the participant elsewhere when the bound field's answer
 * equals `values`.
 */
export type SectionRule = {
  _id: string;
  field_id: string | null;
  /** Section id to go to next, "submit", or null for the following section. */
  onNext: string | null;
  onBack: string | null;
  values: string | null;
};

export type FormSection = {
  _id: string;
  name: string;
  description: string;
  isDisabled: boolean;
  validations: SectionRule[];
  fields: FormFieldDef[];
};

/**
 * An event's details as the admin edits them in NewForm. Until the form is
 * saved, the event image and the payment QR may still be local Files.
 */
export type EventDraft = Omit<
  EventInfo,
  "eventImg" | "eventDate" | "receiverDetails"
> & {
  _id?: string;
  id?: string;
  eventImg?: string | File | null;
  /** Stored as a string; the date picker hands back a Date until saved. */
  eventDate?: string | Date | null;
  receiverDetails?: Omit<NonNullable<EventInfo["receiverDetails"]>, "media"> & {
    media?: string | File | null;
  };
};

/**
 * A form (event) record as the forms API returns it. `info` holds the event's
 * details and `sections` its registration form.
 */
export type FormRecord = {
  id: string;
  info: EventInfo;
  sections: FormSection[];
  /** Present on records that carry their registration count. */
  regCount?: number;
  createdAt?: string;
  updatedAt?: string;
};
