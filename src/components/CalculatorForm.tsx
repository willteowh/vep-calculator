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
  onFieldChange: (field: keyof FormState, value: string) => void;
  onCalculate: () => void;
  onQuickFill: () => void;
  onReset: () => void;
}

export function CalculatorForm({
  form,
  errors,
  straddlesBoundary,
  onFieldChange,
  onCalculate,
  onQuickFill,
  onReset,
}: CalculatorFormProps) {
  return (
    <>
      <div style={infoStyles.info}>
        <strong>Applicable to:</strong> Cars &amp; Motorcycles registered
        in Malaysia.
        <br />
        <strong>Pre-2027:</strong> VEP Cars $35/day · Motorcycles $4/day.
        Free on: Sat/Sun/PH, weekday evenings (entry ≥5pm, exit ≤2am),
        school-holiday noons (entry ≥12pm, exit ≤2am).
        <br />
        <strong>From 1 Jan 2027:</strong> VEP Cars $50/day · Motorcycles
        $7/day. Free on: Sat/Sun/PH <em>only</em> (all other exemptions
        removed). ERP flat rate without OBU: Cars $10/day, Motorcycles
        $3/day.
      </div>

      {straddlesBoundary && (
        <div style={infoStyles.warn2027}>
          ⚠️{" "}
          <strong>
            Your trip straddles the 1 January 2027 rate change.
          </strong>{" "}
          Days before 2027 will be charged at current rates; days from 1
          Jan 2027 will be charged at the new higher rates. The breakdown
          is shown separately in the results.
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
              onChange={(e) =>
                onFieldChange("vehicleCategory", e.target.value)
              }
            >
              <option value="">Select category</option>
              <option value="cars">Cars</option>
              <option value="motorcycles">Motorcycles</option>
              <option value="vans">Vans/Light Goods Vehicles</option>
              <option value="hgv">Heavy Goods Vehicles</option>
              <option value="taxis">Taxis</option>
              <option value="buses">Buses</option>
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
              <option value="">Select</option>
              <option value="yes">Yes (IU / OBU installed)</option>
              <option value="no">No (no IU / OBU)</option>
            </select>
            {errors.hasIU && (
              <div style={formStyles.err}>{errors.hasIU}</div>
            )}
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
              onChange={(e) =>
                onFieldChange("entryDatetime", e.target.value)
              }
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
              onChange={(e) =>
                onFieldChange("departDatetime", e.target.value)
              }
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
              onChange={(e) =>
                onFieldChange("entryCheckpoint", e.target.value)
              }
            >
              <option value="">Select Entry Checkpoint</option>
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
              <option value="">Select Departure Checkpoint</option>
              <option value="woodlands">Woodlands Checkpoint</option>
              <option value="tuas">Tuas Checkpoint</option>
            </select>
            {errors.departCheckpoint && (
              <div style={formStyles.err}>{errors.departCheckpoint}</div>
            )}
          </div>
        </div>

        {/* ERP Days */}
        <div style={formStyles.row}>
          <label style={formStyles.lbl}>
            {UI_LABELS.ERP_DAYS}
            <br />
            <span style={{ fontWeight: 400, fontSize: 11, color: "#888" }}>
              {UI_LABELS.ERP_DAYS_HINT}
            </span>
          </label>
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
        <button style={buttonStyles.btnP} onClick={onCalculate}>
          {UI_LABELS.CALCULATE}
        </button>
        <button
          style={{
            ...buttonStyles.btnS,
            background: "#e3f2fd",
            color: "#1976d2",
            border: "1px solid #2196f3",
          }}
          onClick={onQuickFill}
        >
          {UI_LABELS.QUICK_FILL}
        </button>

        <button style={buttonStyles.btnS} onClick={onReset}>
          {UI_LABELS.RESET}
        </button>
      </div>
    </>
  );
}
