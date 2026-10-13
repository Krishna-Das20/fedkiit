"use client";

import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
  type MouseEventHandler,
} from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import Select, {
  components,
  type DropdownIndicatorProps,
  type StylesConfig,
} from "react-select";
import DatePicker, { type DatePickerProps } from "react-date-picker";
import { AiOutlineDown } from "react-icons/ai";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import DatePickerWithTime from "react-datepicker";
import styles from "./styles/Core.module.scss";

type CustomInputProps = {
  value?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  placeholder?: string;
};

const CustomInput = forwardRef<HTMLDivElement, CustomInputProps>(
  ({ value, onClick, placeholder = "Select Date & Time" }, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <p
        style={{
          margin: "4px",
          fontSize: "12px !important",
          opacity: value ? 1 : 0.5,
          fontWeight: "100 !important",
        }}
      >
        {value || placeholder}
      </p>
      <FaRegCalendarAlt
        color="#fff"
        size={18}
        style={{
          position: "absolute",
          top: "20%",
          right: "8px",
        }}
      />
    </div>
  )
);

CustomInput.displayName = "CustomInput";

export type SelectOption = {
  value: string;
  label: string;
};

type ChangeFor<T extends string> = T extends "select"
  ? SelectOption["value"]
  : T extends "date"
    ? Parameters<NonNullable<DatePickerProps["onChange"]>>[0]
    : T extends "datetime-local"
      ? Date | null
      : T extends "file" | "image"
        ? { target: { value: File } }
        : ChangeEvent<HTMLInputElement & HTMLTextAreaElement>;

/**
 * What `onChange` receives for each `type`. When the type is only known at
 * runtime (a plain `string`), it can be any of them.
 */
export type InputChange<T extends string> = string extends T
  ? ChangeFor<"select" | "date" | "datetime-local" | "file" | "text">
  : ChangeFor<T>;

export type InputValue = string | number | Date | null | undefined;

export type InputProps<T extends string = "text"> = {
  type?: T;
  containerStyle?: CSSProperties;
  style?: CSSProperties;
  placeholder?: string;
  value?: InputValue;
  onChange: (change: InputChange<T>) => void;
  label?: string;
  options?: SelectOption[];
  name?: string;
  showLabel?: boolean;
  className?: string;
  containerClassName?: string;
  id?: string;
  maxLength?: number;
  max?: number | string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  // Anything else is forwarded untouched to the underlying control.
  [key: string]: unknown;
};

const customStyles: StylesConfig<SelectOption, false> = {
  control: (provided) => ({
    ...provided,
    display: "flex",
    outline: "none",
    width: "99.5%",
    fontSize: "12px",
    backgroundColor: "transparent",
    borderRadius: "4px",
    color: "#fff",
    marginBottom: "0",
    maxHeight: "40px",
    marginLeft: "8px",
    marginRight: "8px",
    marginTop: "4px",
    position: "relative",
    border: "1px solid rgba(211, 211, 211, 0.5)",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#fff !important",
    },
  }),
  menu: (provided) => ({
    ...provided,
    width: "99.5%",
    marginLeft: "8px",
  }),
  menuPortal: (provided) => ({ ...provided, zIndex: 111 }),
  placeholder: (provided) => ({
    ...provided,
    display: "flex",
    alignItems: "center",
    marginTop: "-7px",
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? "#FF8A00" : "#2D2D2D",
    backgroundColor: state.isSelected ? "#2D2D2D" : "#fff",
    cursor: "pointer",
    width: "99%",
    border: "none",
    margin: "0 auto",
    borderRadius: "4px",
    "&:hover": {
      transition: "ease-in-out 0.3s",
      backgroundColor: "#2D2D2D",
      color: "#FF8A00",
      margin: "2px auto",
    },
    "&:active": {
      backgroundColor: "#2D2D2D",
      color: "#FF8A00",
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: "none",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    marginTop: "-7px",
    fontSize:"larger"
  }),
};

const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <AiOutlineDown
        color="#fff"
        size={20}
        style={{
          position: "absolute",
          right: "12px",
          top: "25%",
        }}
      />
    </components.DropdownIndicator>
  );
};

function Input<T extends string = "text">(props: InputProps<T>) {
  const {
    type = "text",
    containerStyle,
    style,
    placeholder,
    value,
    onChange,
    label,
    options,
    name,
    showLabel = true,
    // Defaults to "" because it is interpolated into a template literal below.
    // Without it, every caller that omits the prop rendered a literal
    // "undefined" in the class list.
    className = "",
    containerClassName = "",
    ...rest
  } = props;
  // The public signature narrows the argument per `type`; each branch below
  // hands over exactly what its `type` produces, so it is called untyped here.
  const emitChange = onChange as (change: unknown) => void;
  const dateRef = useRef(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const [showPassword, setshowPassword] = useState(false);
  const [previewFile, setpreviewFile] = useState<string | null>(null);

  // When callers pass only `onChange` (no `value`), keep the field uncontrolled.
  // Defaulting `value` to "" used to force every input controlled at "" — typing
  // never appeared because React kept resetting the DOM value.
  const isControlled = Object.prototype.hasOwnProperty.call(props, "value");
  const controlledValue = isControlled ? (value ?? "") : undefined;
  // A controlled text-like field only ever holds a string or number.
  const valueProps = isControlled
    ? { value: controlledValue as string | number }
    : {};

  const filterPassedTime = (time: Date) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    return currentDate.getTime() < selectedDate.getTime();
  };

  const getInputTypes = () => {
    switch (type) {
      case "text":
        return (
          <input
            name={name}
            className={`${styles.input} ${className}`}
            type={type}
            style={style || {}}
            placeholder={placeholder}
            {...valueProps}
            onChange={emitChange}
            {...rest}
          />
        );

      case "number":
        return (
          <input
            name={name}
            className={`${styles.input} ${className}`}
            type={type}
            style={style || {}}
            placeholder={placeholder}
            {...valueProps}
            onChange={emitChange}
            {...rest}
          />
        );

      case "textArea":
        return (
          <textarea
            name={name}
            className={`${styles.input} ${styles.inputTxtArea} ${className}`}
            style={style || {}}
            placeholder={placeholder}
            {...valueProps}
            onChange={emitChange}
            {...rest}
          />
        );

      case "select":
        return (
          <div>
            <Select
              name={name}
              placeholder={placeholder}
              value={
                isControlled
                  ? options!.find((option) => option.value === value) || null
                  : undefined
              }
              options={options}
              onChange={(selectedOption) => emitChange(selectedOption!.value)}
              styles={customStyles}
              components={{ DropdownIndicator }}
              isSearchable={false}
              className={className}
              // react-select only distinguishes "fixed"; the "auto" this
              // passed before was handled exactly like the "absolute" default.
              menuPosition="absolute"
              {...rest}
            />
          </div>
        );

      case "date":
        // react-date-picker ignores ref, placeholder and style (only its own
        // props and event handlers are read), so none are passed to it.
        return (
          <div>
            <DatePicker
              name={name}
              className={`${styles.input} ${styles.inputDate} ${className}`}
              value={value as DatePickerProps["value"]}
              onChange={emitChange}
              clearIcon={null}
              calendarIcon={
                <FaRegCalendarAlt
                  color="#fff"
                  size={18}
                  style={{
                    position: "absolute",
                    top: "25%",
                    right: "12px",
                  }}
                />
              }
              {...rest}
            />
          </div>
        );
      case "datetime-local":
        return (
          <div className={`${styles.input} ${styles.inputDate} ${className}`}>
            <DatePickerWithTime
              name={name}
              ref={dateRef}
              value={value as string | undefined}
              onChange={emitChange}
              // react-datepicker has no clearIcon prop (that is
              // react-date-picker's), so it is not passed here.
              showTimeSelect
              filterTime={filterPassedTime}
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm"
              customInput={<CustomInput placeholder={placeholder} />}
              {...rest}
            />
          </div>
        );
      case "radio":
        return (
          <div className={styles.checkboxWrapper}>
            <input
              name={name}
              className={styles.checkboxInput}
              type="radio"
              placeholder={placeholder}
              value={value as string | number | undefined}
              onChange={emitChange}
              id={rest.id || `${name}-${value}`}
              {...rest}
            />
            <label
              className={styles.checkboxLabel}
              htmlFor={rest.id || `${name}-${value}`}
            >
              {label}
            </label>
          </div>
        );
      case "checkbox":
        return (
          <div className={styles.checkboxWrapper}>
            <input
              name={name}
              className={styles.checkboxInput}
              type="checkbox"
              placeholder={placeholder}
              value={value as string | number | undefined}
              onChange={emitChange}
              id={rest.id || `${name}-${value}`}
              {...rest}
            />
            <label
              className={styles.checkboxLabel}
              htmlFor={rest.id || `${name}-${value}`}
            >
              {label}
            </label>
          </div>
        );

      case "password":
        return (
          <div>
            <div
              style={{
                position: "relative",
              }}
            >
              <input
                name={name}
                maxLength={rest.maxLength || 20}
                max={rest.max || 20}
                className={styles.input}
                type={showPassword ? "text" : "password"}
                style={style || {}}
                placeholder={placeholder}
                {...valueProps}
                onChange={emitChange}
                {...rest}
              />
              {showPassword ? (
                <FaEyeSlash
                  onClick={() => setshowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "25%",
                    cursor: "pointer",
                  }}
                  color="#fff"
                  size={18}
                />
              ) : (
                <FaEye
                  onClick={() => setshowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "25%",
                    cursor: "pointer",
                  }}
                  color="#fff"
                  size={18}
                />
              )}
            </div>
          </div>
        );
      case "file":
        return (
          <div
            className={styles.input}
            onClick={() => fileRef.current?.click()}
            style={{
              height: "40px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            <input
              ref={fileRef}
              name={name}
              type={type}
              style={{
                display: "none",
              }}
              placeholder={placeholder}
              onChange={() => {
                const e = {
                  target: {
                    value: fileRef.current!.files![0],
                  },
                };
                setpreviewFile(URL.createObjectURL(fileRef.current!.files![0]));
                emitChange(e);
              }}
              {...rest}
            />
            {previewFile && (
              <img
                src={previewFile}
                style={{
                  height: "24px",
                  width: "24px",
                  borderRadius: "8px",
                  marginRight: "8px",
                }}
              />
            )}
            <span
              style={{
                color: "#fff",
                opacity: value ? 1 : 0.5,
                width: "100%",
                overflow: "hidden",
              }}
            >
              {(value as string | undefined) || "No file selected"}
            </span>
          </div>
        );
      case "image":
        return (
          <div
            className={styles.input}
            onClick={() => {
              imgRef.current?.click();
            }}
            style={{
              height: "40px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            <input
              ref={imgRef}
              name={name}
              type={"file"}
              accept="image/png, image/jpeg, image/jpg"
              style={{
                display: "none",
              }}
              placeholder={placeholder}
              onChange={() => {
                const e = {
                  target: {
                    value: imgRef.current!.files![0],
                  },
                };
                setpreviewFile(URL.createObjectURL(imgRef.current!.files![0]));
                emitChange(e);
              }}
              {...rest}
            />
            {previewFile && (
              <img
                src={previewFile}
                style={{
                  height: "24px",
                  width: "24px",
                  borderRadius: "8px",
                  marginRight: "8px",
                }}
              />
            )}
            <span
              style={{
                color: "#fff",
                opacity: value ? 1 : 0.5,
                width: "100%",
                overflow: "hidden",
              }}
            >
              {(value as string | undefined) || "No images selected"}
            </span>
          </div>
        );
      default:
        return (
          <input
            name={name}
            className={styles.input}
            type={type}
            style={style || {}}
            placeholder={placeholder}
            {...valueProps}
            onChange={emitChange}
            {...rest}
          />
        );
    }
  };

  return (
    <div
      className={`${styles.containerInput} ${containerClassName}`}
      style={
        containerStyle || {
          marginTop: type === "select" ? "0" : "8px",
        }
      }
    >
      {showLabel && (
        <label
          style={{
            color: "#fff",
            marginBottom: "4px",
            fontSize: ".8em",
            marginLeft: "8px",
          }}
          htmlFor={label}
        >
          {label}
        </label>
      )}
      {getInputTypes()}
    </div>
  );
}

export default Input;
