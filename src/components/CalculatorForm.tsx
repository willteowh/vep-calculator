import { UI_LABELS } from "@/config/messages";
import {
  formStyles,
  infoStyles,
  buttonStyles,
  utilityStyles,
  baseStyles,
} from "@/utils/styles";
import { FormState, FormErrors } from "@/hooks/useCalculatorForm";

interface CalculatorFormProps {
  form: FormState;
  errors: FormErrors;
  straddlesBoundary: boolean;
  loading?: boolean;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onCalculate: () => void;
  onQuickFill: () => void;
  onReset: () => void;
}

export function CalculatorForm({
  form,
  errors,
  straddlesBoundary,
  loading = false,
  onFieldChange,
  onCalculate,
  onQuickFill,
  onReset,
}: CalculatorFormProps) {
  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .infoBox > * {
          margin-bottom: 20px;
        }
      `}</style>
      <div className="infoBox" style={infoStyles.infoBox}>
        <h1 style={infoStyles.pageHeader}>
          Calculate Fees and Charges for Foreign Vehicles in Singapore&nbsp;
        </h1>
        <p>
          You can check your entry and exit toll charges, VEP fees and
          Reciprocal Road Charge to prepare for your next visit to Singapore.
          The values from the calculator are indicative. The actual fees and
          charges may be different depending on any changes that are determined
          by the authorities.
        </p>
        <p>
          As announced on 6 February 2026, the revised daily VEP fee, cessation
          of free VEP days and hours for cars and motorcycles and daily
          flat-rate ERP fee on ERP operational days for foreign-registered
          vehicles without OBUs, will apply from 1 January 2027.&nbsp;
        </p>
        <p>
          Refer to the&nbsp;
          <a
            style={baseStyles.link}
            href="https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/updates-foreign-registered-vehicles-entering-singapore.html"
          >
            news release
          </a>
          &nbsp;and LTA OneMotoring website for more information.
          <br />
          <br />
          &nbsp;
        </p>
      </div>

      {straddlesBoundary && (
        <div style={infoStyles.warn2027}>
          ⚠️{" "}
          <strong>Your trip straddles the 1 January 2027 rate change.</strong>{" "}
          Days before 2027 will be charged at current rates; days from 1 Jan
          2027 will be charged at the new higher rates. The breakdown is shown
          separately in the results.
        </div>
      )}

      {errors._g && <div style={infoStyles.errBanner}>{errors._g}</div>}

      <div className="vep-grid">
        {/* Vehicle Category */}
        <div style={formStyles.row}>
          <label style={formStyles.lbl}>{UI_LABELS.VEHICLE_CATEGORY}</label>
          <div style={formStyles.ctrl}>
            <select
              style={formStyles.sel(!!errors.vehicleCategory)}
              value={form.vehicleCategory}
              onChange={(e) => onFieldChange("vehicleCategory", e.target.value)}
            >
              <option disabled value="">
                Select category
              </option>
              <option value="cars">Cars</option>
              <option value="motorcycles">Motorcycles</option>
            </select>
            {errors.vehicleCategory && (
              <div style={formStyles.err}>{errors.vehicleCategory}</div>
            )}
          </div>
        </div>

        {/* IU / OBU */}
        <div style={formStyles.row}>
          <label style={formStyles.lbl}>{UI_LABELS.HAS_IU}</label>
          <div style={formStyles.ctrl}>
            <select
              style={formStyles.sel(!!errors.hasIU)}
              value={form.hasIU}
              onChange={(e) => onFieldChange("hasIU", e.target.value)}
            >
              <option disabled value="">
                Select
              </option>
              <option value="yes">Yes (IU / OBU installed)</option>
              <option value="no">No (no IU / OBU)</option>
            </select>
            {errors.hasIU && <div style={formStyles.err}>{errors.hasIU}</div>}
          </div>
        </div>

        {/* Entry Date & Time */}
        <div style={formStyles.row}>
          <label style={formStyles.lbl}>{UI_LABELS.ENTRY_DATETIME}</label>
          <div style={formStyles.ctrl}>
            <input
              type="datetime-local"
              style={formStyles.inp(!!errors.entryDatetime)}
              value={form.entryDatetime}
              onChange={(e) => onFieldChange("entryDatetime", e.target.value)}
            />
            {errors.entryDatetime && (
              <div style={formStyles.err}>{errors.entryDatetime}</div>
            )}
          </div>
        </div>

        {/* Departure Date & Time */}
        <div style={formStyles.row}>
          <label style={formStyles.lbl}>{UI_LABELS.DEPART_DATETIME}</label>
          <div style={formStyles.ctrl}>
            <input
              type="datetime-local"
              style={formStyles.inp(!!errors.departDatetime)}
              value={form.departDatetime}
              min={form.entryDatetime || undefined}
              onChange={(e) => onFieldChange("departDatetime", e.target.value)}
            />
            {errors.departDatetime && (
              <div style={formStyles.err}>{errors.departDatetime}</div>
            )}
          </div>
        </div>

        {/* Entry Checkpoint */}
        <div style={formStyles.row}>
          <label style={formStyles.lbl}>{UI_LABELS.ENTRY_CHECKPOINT}</label>
          <div style={formStyles.ctrl}>
            <select
              style={formStyles.sel(!!errors.entryCheckpoint)}
              value={form.entryCheckpoint}
              onChange={(e) => onFieldChange("entryCheckpoint", e.target.value)}
            >
              <option disabled value="">
                Select Entry Checkpoint
              </option>
              <option value="woodlands">Woodlands Checkpoint</option>
              <option value="tuas">Tuas Checkpoint</option>
            </select>
            {errors.entryCheckpoint && (
              <div style={formStyles.err}>{errors.entryCheckpoint}</div>
            )}
          </div>
        </div>

        {/* Departure Checkpoint */}
        <div style={formStyles.row}>
          <label style={formStyles.lbl}>{UI_LABELS.DEPART_CHECKPOINT}</label>
          <div style={formStyles.ctrl}>
            <select
              style={formStyles.sel(!!errors.departCheckpoint)}
              value={form.departCheckpoint}
              onChange={(e) =>
                onFieldChange("departCheckpoint", e.target.value)
              }
            >
              <option disabled value="">
                Select Departure Checkpoint
              </option>
              <option value="woodlands">Woodlands Checkpoint</option>
              <option value="tuas">Tuas Checkpoint</option>
            </select>
            {errors.departCheckpoint && (
              <div style={formStyles.err}>{errors.departCheckpoint}</div>
            )}
          </div>
        </div>

        {/* ERP Days */}
        <div className="full-width" style={formStyles.row}>
          <label style={formStyles.lbl}>{UI_LABELS.ERP_DAYS}</label>
          <div style={formStyles.ctrl}>
            <input
              type="number"
              min="0"
              style={formStyles.inp(false)}
              value={form.erpDays}
              onChange={(e) => onFieldChange("erpDays", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div style={utilityStyles.emptyFlex} />
      </div>

      <div style={buttonStyles.btnGroup}>
        <button
          style={buttonStyles.btn}
          onClick={onCalculate}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  border: "2px solid #ffffff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginRight: "8px",
                }}
              ></span>
              Calculating...
            </>
          ) : (
            UI_LABELS.CALCULATE
          )}
        </button>
        <button style={buttonStyles.btn} onClick={onReset}>
          {UI_LABELS.RESET}
        </button>
        <button
          style={{
            ...buttonStyles.btn,
            background: "#e3f2fd",
            color: "#1976d2",
          }}
          onClick={onQuickFill}
        >
          {UI_LABELS.QUICK_FILL}
        </button>
      </div>
    </>
  );
}
