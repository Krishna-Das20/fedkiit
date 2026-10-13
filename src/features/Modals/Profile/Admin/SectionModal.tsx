"use client";

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

/** What an Input shows for a field: the uploaded file's name, else the answer. */
const displayValue = (field: FormFieldDef) =>
  field.type === "file" || field.type === "image"
    ? (field.onChangeValue as File | undefined)?.name
    : (field.onChangeValue as string | undefined);

/**
 * The answer an Input change carries. A select hands over the chosen option;
 * every other type passes an event-like object whose target holds the value.
 */
const answerFrom = (field: FormFieldDef, change: InputChange<string>) =>
  field.type === "select"
    ? (change as string)
    : (change as { target: { value: FieldAnswer } }).target.value;

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
