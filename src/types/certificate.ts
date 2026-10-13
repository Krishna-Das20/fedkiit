/** An issued certificate row, as the certificate endpoints return it. */
export type IssuedCertificate = {
  id: string;
  email: string;
  eventId: string;
  fieldValues?: Record<string, unknown> | null;
  [key: string]: unknown;
};

/** A certificate-bearing event (not a form): `formId` links it to one. */
export type CertificateEvent = {
  id: string;
  name: string;
  formId?: string | null;
  createdAt?: string;
  [key: string]: unknown;
};

/** One entry of /api/certificate/sendCertificatesAndEvents. */
export type CertificateWithEvent = {
  cert: IssuedCertificate;
  event: CertificateEvent;
};

/** One entry of /api/certificate/myCertificates. */
export type MyCertificate = {
  certificateId: string;
  eventId: string;
  formId: string | null;
  eventTitle: string;
  /** The form's date when it has one, else when the event was created. */
  eventDate: string | null;
};

/** An issued certificate as the admin list (eventCertificates) shows it. */
export type ListedCertificate = {
  id: string;
  email: string;
  /** The recipient's name from the certificate, or their email. */
  name: string;
  mailed: boolean;
  /** In the trash: invalid on verification until restored. */
  isDeleted: boolean;
  deletedAt: string | null;
};

/** /api/certificate/eventCertificates for one event. */
export type EventCertificates = {
  event: {
    id: string;
    name: string;
    description?: string | null;
    createdAt?: string;
    formId?: string | null;
  } | null;
  template: { id: string; fields: unknown } | null;
  certificates: ListedCertificate[];
  total: number;
  totalMailed: number;
  totalTrash?: number;
};

/**
 * A field placed on a certificate template. Positions are percentages of the
 * image; a QR field's fontSize is its size. The numbers are "" while an input
 * is cleared mid-edit.
 */
export type CertificateField = {
  fieldName: string;
  x: number | "";
  y: number | "";
  fontSize: number | "";
  fontColor: string;
  /** What older templates called fontColor. */
  color?: string;
  /** Studio only: the field's card is collapsed. */
  minimized?: boolean;
};
