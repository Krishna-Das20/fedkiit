"use client";

import styles from "./styles/Form.module.scss";
import Input from "../Core/Input";
import { MdOutlineClose } from "react-icons/md";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useState } from "react";
import PopField from "./PopField";
import Switch from "react-switch";
import { getOutboundList } from "../../sections/Profile/Admin/Form/NewForm/NewForm";
import { nanoid } from "nanoid";
import type {
  FieldValidation,
  FormFieldDef,
  FormSection,
  SectionRule,
} from "../../types/form";

const hasOptions = ["radio", "checkbox", "select"];

const fieldTypes = [
  {
    label: "Text",
    value: "text",
  },
  {
    label: "Number",
    value: "number",
  },
  {
    label: "Radio",
    value: "radio",
  },
  {
    label: "Checkbox",
    value: "checkbox",
  },
  {
    label: "List",
    value: "select",
  },
  {
    label: "Date",
    value: "date",
  },
  {
    label: "Image",
    value: "image",
  },
  {
    label: "File",
    value: "file",
  },
  // {
  //   label: "Email",
  //   value: "email",
  // },
  // {
  //   label: "URL",
  //   value: "url",
  // },
  // {
  //   label: "Phone",
  //   value: "tel",
  // },
];

/** The field properties the builder edits from this row. */
type EditableProperty = "name" | "type" | "value" | "isRequired";

type FormFieldProps = {
  field: FormFieldDef;
  section: FormSection;
  sections: FormSection[];
  setformFields: (fields: FormFieldDef[], property: EditableProperty) => void;
  onRemoveField: () => void;
  onFieldValidationChange: (
    value: string,
    property: keyof FieldValidation,
    field: FormFieldDef,
    validationId: string,
  ) => void;
  addNewValidation: (field: FormFieldDef) => void;
  onRemoveValidation: (field: FormFieldDef, validationId: string) => void;
};

function FormField(props: FormFieldProps) {
  const {
    field,
    section,
    setformFields,
    onRemoveField,
    sections,
    onFieldValidationChange,
    addNewValidation,
    onRemoveValidation,
  } = props;
  const [showPopMenu, setshowPopMenu] = useState(false);
  const showMenu = field.type && field.value;

  const handleChangeValue = (
    // A File only arrives from the (disabled) file picker of the value input.
    value: string | boolean | File,
    property: EditableProperty,
  ) => {
    const newFields = [...section.fields];
    const fieldIndex = newFields.findIndex((fld) => fld._id === field?._id);

    if (fieldIndex === -1) {
      console.error("Field not found");
      return;
    }

    Object.assign(newFields[fieldIndex], { [property]: value });

    if (property === "value") {
      // Only a "value" edit reads the option list, and its value is a string.
      const values = String(value)
        .split(",")
        .map((val) => val.trim())
        .filter(Boolean);

      const fieldValidation: FieldValidation = {
        _id: nanoid(),
        type: "length",
        value: values.length > 1 ? 1 : 50,
        operator: "<=",
        message: `${field.name} should be less than ${
          values.length > 1 ? 1 : 200
        } characters long`,
      };

      newFields[fieldIndex].validations = [fieldValidation];

      if (values.length > 1) {
        const { backSection, nextSection } = getOutboundList(
          sections,
          section._id
        );

        let secValidations: SectionRule[] = [...section.validations];

        if (hasOptions.includes(field.type)) {
          secValidations = secValidations.filter(
            (val) => val.field_id !== field._id
          );

          values.forEach((val) => {
            secValidations.push({
              _id: nanoid(),
              field_id: field._id,
              onNext: nextSection?._id || null,
              onBack: backSection?._id || null,
              values: val,
            });
          });
        }
        section.validations = secValidations;
      }
    }

    if (property === "type") {
      newFields[fieldIndex].value = "";
      const secValidations = {
        _id: nanoid(),
        field_id: null,
        onNext: null,
        onBack: null,
        values: null,
      };
      section.validations =
        section?.validations[0] === undefined
          ? [secValidations]
          : [section.validations[0]];
    }

    setformFields(newFields, property);
  };

  return (
    <>
      <div className={styles.mainFieldForm}>
        <Input
          value={field.name}
          placeholder="Enter Name"
          label="Field Name"
          name="Field_Name"
          className={styles.fieldInput}
          containerClassName={styles.containerInput}
          onChange={(e) => handleChangeValue(e.target.value, "name")}
        />
        <Input
          value={field.type}
          placeholder="Select Type"
          label="Field Type"
          name="Field_Type"
          type="select"
          className={styles.fieldInput}
          containerClassName={styles.containerInput}
          options={fieldTypes}
          onChange={(value) => handleChangeValue(value, "type")}
        />
        <Input
          value={
            // An uploaded File shows its name; the builder otherwise holds text.
            typeof field.value === "object"
              ? (field.value as File | null)?.name
              : field.value
          }
          name="Field_Value"
          placeholder="Enter Value"
          label="Field Value"
          type={
            field.type === "file" || field.type === "image" ? "file" : "text"
          }
          disabled={field.type === "file" || field.type === "image"}
          style={{
            cursor:
              field.type === "file" || field.type === "image"
                ? "not-allowed"
                : "text",
          }}
          className={styles.fieldInput}
          containerClassName={styles.containerInput}
          onChange={(e) => {
            handleChangeValue(e.target.value, "value");
          }}
        />
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            marginRight: "auto",
          }}
        >
          <Switch
            checked={field.isRequired}
            width={36}
            height={18}
            onColor="#FF8A00"
            checkedIcon={false}
            uncheckedIcon={false}
            title="Is this field required?"
            onChange={(value) => {
              handleChangeValue(value, "isRequired");
            }}
          />
        </div>
        {section.fields?.length > 1 && (
          <MdOutlineClose
            size={22}
            onClick={onRemoveField}
            color="#FF8A00"
            style={{
              cursor: "pointer",
              marginTop: "12px",
              zIndex: 10,
            }}
          />
        )}
        {showMenu && (
          <HiOutlineDotsVertical
            onClick={() => {
              setshowPopMenu(!showPopMenu);
            }}
            size={20}
            color="#FF8A00"
            style={{
              cursor: "pointer",
              marginTop: "10px",
              marginLeft: !["text", "number", "date"].includes(field.type)
                ? "8px"
                : "auto",
              zIndex: 10,
            }}
          />
        )}
        {showPopMenu && (
          <PopField
            field={field}
            onFieldValidationChange={onFieldValidationChange}
            handleClose={() => setshowPopMenu(false)}
            sections={sections.filter((sec) => sec._id !== section._id)}
            onAddValidation={addNewValidation}
            onRemoveValidation={onRemoveValidation}
          />
        )}
      </div>
    </>
  );
}

export default FormField;
