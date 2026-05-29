/**
 * Date picker field type definitions.
 *
 * Two patterns exist in the Amis schemas:
 *
 * 1. PairedDatetime — two input-datetime fields grouped together (start + end)
 *    with minDate cross-validation. Used for registration period, mission period,
 *    skin effective period, stay period.
 *
 * 2. SingleDate — a single input-date field. Used for countdown day.
 */

/* ======================================================================== */
/*  Pattern 1: Paired Datetime (start + end)                               */
/* ======================================================================== */

/**
 * Schema-level definition for a paired datetime group.
 * In the Amis schema, this is represented as a `type: "group"` containing
 * two `input-datetime` fields with cross-validation (minDate).
 */
export interface PairedDatetimeSchema {
  /** Amis schema type for the group wrapper */
  type: 'group';
  body: [
    PairedDatetimeFieldSchema<'start'>,
    PairedDatetimeFieldSchema<'end'>,
  ];
}

export interface PairedDatetimeFieldSchema<Role extends 'start' | 'end'> {
  type: 'input-datetime';
  name: string;
  label: string;
  required?: boolean;
  timeFormat?: string;   // e.g. "HH:mm:ss"
  format?: string;       // e.g. "YYYY-MM-DD HH:mm:ss"
  inputFormat?: string;  // e.g. "YYYY-MM-DD HH:mm:ss"
  clearable?: boolean;
  /** End field references start field via minDate expression */
  minDate?: Role extends 'end' ? string : never;
  validations?: Role extends 'end' ? { isAfter: string } : never;
  validationErrors?: Role extends 'end' ? { isAfter: string } : never;
}

/**
 * Runtime value for a paired datetime — stored as two ISO-like strings.
 * In the config JSON, this is nested: { startTime, endTime }.
 * After flattening via schema sourcePath, these become `${prefix}Start` and `${prefix}End`.
 */
export interface PairedDatetimeValue {
  startTime: string;
  endTime: string;
}

/**
 * Flattened form data keys for a paired datetime.
 * Naming convention: `${prefix}Start` / `${prefix}End`
 *
 * Examples:
 *   registrationPeriod → regStartTime / regEndTime
 *   missionPeriod      → missionStartTime / missionEndTime
 *   skin effective     → skinStartTime / skinEndTime
 *   stayPeriod         → subStayStart / subStayEnd
 */
export interface PairedDatetimeFormKeys {
  startKey: string;
  endKey: string;
}

/* ======================================================================== */
/*  Pattern 2: Single Date                                                  */
/* ======================================================================== */

/**
 * Schema-level definition for a single date picker.
 * In the Amis schema, this is a `type: "input-date"` field.
 */
export interface SingleDateSchema {
  type: 'input-date';
  name: string;
  label: string;
  required?: boolean;
  format?: string;       // e.g. "YYYY-MM-DD"
  inputFormat?: string;  // e.g. "YYYY-MM-DD"
  clearable?: boolean;
}

/**
 * Runtime value for a single date — stored as an ISO-like date string.
 */
export type SingleDateValue = string;

/* ======================================================================== */
/*  Union type for all date field types                                     */
/* ======================================================================== */

export type DateFieldType = 'pairedDatetime' | 'singleDate';

/**
 * Metadata describing a date field in the schema.
 */
export interface DateFieldMeta {
  type: DateFieldType;
  /** Label shown in the UI */
  label: string;
  /** For paired: prefix used to derive start/end keys */
  configPath?: string;
  /** For paired: the keys after flatt (e.g. ["regStartTime", "regEndTime"]) */
  formKeys?: PairedDatetimeFormKeys;
}

/* ======================================================================== */
/*  Known date fields in the mission schema                                 */
/* ======================================================================== */

export const MISSION_DATE_FIELDS: ReadonlyArray<DateFieldMeta> = [
  {
    type: 'pairedDatetime',
    label: 'Registration Period',
    configPath: 'missionRule.ruleSetup.registrationPeriod',
    formKeys: { startKey: 'regStartTime', endKey: 'regEndTime' },
  },
  {
    type: 'pairedDatetime',
    label: 'Mission Period',
    configPath: 'missionRule.ruleSetup.missionPeriod',
    formKeys: { startKey: 'missionStartTime', endKey: 'missionEndTime' },
  },
  {
    type: 'pairedDatetime',
    label: 'Skin Effective Period',
    configPath: 'missionRule.displayConfig.skinSetting.effectivePeriod',
    formKeys: { startKey: 'skinStartTime', endKey: 'skinEndTime' },
  },
  {
    type: 'pairedDatetime',
    label: 'Stay Period',
    configPath: 'subMissionRules[0].ruleSetup.stayPeriod',
    formKeys: { startKey: 'subStayStart', endKey: 'subStayEnd' },
  },
  {
    type: 'singleDate',
    label: 'Countdown Day',
    configPath: 'missionRule.displayConfig.countdownAppPush.countdownDay',
    formKeys: undefined,
  },
];
