"use client";

import { format, parse } from "date-fns";
import { Input } from "../../../../components";
import type { InputChange } from "../../../../components/Core/Input";
import type {
  FieldAnswer,
  FormFieldDef,
  FormSection,
} from "../../../../types/form";
import styles from "./styles/Preview.module.scss";

/** Older forms may carry an explicit placeholder alongside the field. */
type LiveField = FormFieldDef & { placeholder?: string };

/**
 * A field's options. Admins type them as "A, B, C", so each is trimmed —
 * untrimmed, every answer after the first was saved with a leading space
 * (" Marketing"), which broke filtering the registrations sheet by domain.
 */
const optionsOf = (field: FormFieldDef) =>
  String(field.value ?? "")
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);

const getFieldPlaceholder = (field: LiveField) => {
  if (field.type === "select") return `Choose ${field.name}`;
  if (field.placeholder) return field.placeholder;

  const nameLower = (field.name || "").toLowerCase();
  if (nameLower.includes("roll")) {
    return "Enter Roll Number";
  }
  if (nameLower.includes("whatsapp") || nameLower.includes("phone") || nameLower.includes("contact")) {
    return "Enter WhatsApp Number";
  }
  if (nameLower.includes("email")) {
    return "Enter Email Address";
  }
  if (
    field.value &&
    typeof field.value === "string" &&
    !field.value.toLowerCase().includes("whatsapp")
  ) {
    return field.value;
  }
  return `Enter ${field.name || "detail"}`;
};

/** How a date answer is stored: plain text, in the participant's own day. */
const DATE_ANSWER = "yyyy-MM-dd";

/**
 * What an Input shows for a field: the uploaded file's name, the picked date
 * (read back in local time, so it never shifts a day), else the answer.
 */
const displayValue = (field: FormFieldDef) => {
  if (field.type === "file" || field.type === "image") {
    return (field.onChangeValue as File | undefined)?.name;
  }
  if (field.type === "date") {
    const answer = field.onChangeValue as string | undefined;
    return answer ? parse(answer, DATE_ANSWER, new Date()) : null;
  }
  return field.onChangeValue as string | undefined;
};

/**
 * The answer an Input change carries. A select hands over the chosen option
 * and the date picker a Date (null once cleared); every other type passes an
 * event-like object whose target holds the value.
 *
 * Dates used to go through the `target.value` branch too, which threw on the
 * Date and replaced the whole page with an error the moment a participant
 * typed a date. They are now stored as YYYY-MM-DD text, which also passes the
 * length rule the form builder puts on every field.
 */
const answerFrom = (field: FormFieldDef, change: InputChange<string>): FieldAnswer => {
  if (field.type === "select") return change as string;
  if (field.type === "date") {
    const picked = change as Date | null;
    return picked ? format(picked, DATE_ANSWER) : "";
  }
  return (change as { target: { value: FieldAnswer } }).target.value;
};

type SectionModalProps = {
  section: FormSection;
  handleChange: (field: FormFieldDef, value: FieldAnswer) => void;
};

const Section = ({ section, handleChange }: SectionModalProps) => {
  const getInputFields = (field: FormFieldDef) => {
    const validTypes = ["checkbox", "radio"];
    if (validTypes.includes(field.type)) {
      const valueToArray = optionsOf(field);
      return valueToArray.map((value, index) => (
        <div
          key={index}
          style={{
            marginTop: index === 0 ? ".5em" : "0",
          }}
        >
          <Input
            placeholder={value}
            label={value}
            showLabel={false}
            // Only reached for the two types in validTypes.
            type={field.type as "checkbox" | "radio"}
            value={value}
            name={field.name}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        </div>
      ));
    }
  };

  const getTeamFields = () => {
    const data: FormFieldDef[][] = [];
    if (section.name === "Team Members") {
      section.fields.forEach((field, index) => {
        if (index % 3 === 0) {
          const team = section.fields.slice(index, index + 3);
          data.push(team);
        }
      });
      return data;
    }
  };

  const renderTeamFields = () => {
    return getTeamFields()!.map((team, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {team.map((field, idx) => (
          <div
            key={idx}
            style={{
              flex: "1 1 30%",
              minWidth: "200px",
            }}
          >
            <Input
              placeholder={getFieldPlaceholder(field)}
              label={`${field.name} ${field.isRequired ? "*" : ""}`}
              type={field.type}
              name={field.name}
              style={{ width: "100%" }}
              value={displayValue(field)}
              onChange={(e) => {
                const val = answerFrom(field, e);
                handleChange(field, val);
              }}
              options={
                field.type === "select"
                  ? optionsOf(field).map((option) => ({
                      value: option,
                      label: option,
                    }))
                  : []
              }
            />
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div key={section._id} className={styles.formFieldContainer}>
      {section.name === "Team Members" && renderTeamFields()}
      {section.name !== "Team Members" &&
        section.fields.length > 0 &&
        section.fields.map(
          (field) =>
            field !== undefined && (
              <div key={field._id}>
                {field.type !== "checkbox" && field.type !== "radio" ? (
                  <Input
                    placeholder={getFieldPlaceholder(field)}
                    label={`${field.name} ${field.isRequired ? "*" : ""}`}
                    type={field.type}
                    name={field.name}
                    value={displayValue(field)}
                    onChange={(e) => {
                      const val = answerFrom(field, e);
                      handleChange(field, val);
                    }}
                    options={
                      field.type === "select"
                        ? optionsOf(field).map((option) => ({
                            value: option,
                            label: option,
                          }))
                        : []
                    }
                  />
                ) : (
                  <label
                    style={{
                      color: "#fff",
                      fontSize: ".8em",
                    }}
                  >
                    {field.name}
                  </label>
                )}
                {getInputFields(field)}
              </div>
            )
        )}
    </div>
  );
};

export default Section;
