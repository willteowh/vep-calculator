# Vehicle Entry Permit (VEP) Calculator

A web-based calculator for estimating Vehicle Entry Permit fees for foreign-registered vehicles entering Singapore, with support for complex waiver rules and the 2027 rate changes.

## Overview

The VEP Calculator helps owners of Malaysian-registered cars and motorcycles calculate accurate fee estimates based on Singapore's Land Transport Authority (LTA) regulations. It handles Vehicle Entry Permit (VEP) charges, toll fees, Reciprocal Road Charge (RRC), and Electronic Road Pricing (ERP) with various waiver conditions.

## Features

### Core Calculator

- **Vehicle Types**: Support for cars and motorcycles
- **Precise Timing**: Date and time-based calculations with waiver logic
- **Checkpoints**: Woodlands and Tuas border crossing support
- **Rate Changes**: Handles pre-2027 and post-2027 pricing structures
- **Comprehensive Fees**: VEP, tolls, RRC, and ERP calculations

### Business Rules Engine

#### Rate Structure

**Pre-January 1, 2027:**

- Cars: $35/day VEP, $5/day ERP (no IU)
- Motorcycles: $4/day VEP, $0 ERP (no IU)

**From January 1, 2027:**

- Cars: $50/day VEP, $10/day ERP (no IU)
- Motorcycles: $7/day VEP, $3/day ERP (no IU)

#### Waiver Conditions

**Always Free (both periods):**

- Weekends (Saturday, Sunday)
- Public holidays

**Pre-2027 Only Waivers:**

- **Evening Entry**: Entry day free if entry ≥ 5:00 PM
- **Evening Exit**: Next day free if entry ≥ 5:00 PM and exit ≤ 2:00 AM
- **School Holiday Noon**: Entry day free if entry ≥ 12:00 PM during school holidays (June, December)
- **School Holiday Exit**: Exit day free if entry ≥ 12:00 PM, exit ≤ 2:00 AM, and during school holidays

#### Additional Charges

- **Toll Charges**: Fixed amounts based on checkpoints
  - Woodlands: Cars entry $0/exit $0.80, Motorcycles $0 both
  - Tuas: Cars entry $2.10/exit $2.10, Motorcycles $0 both
- **RRC**: $6.40 per entry for cars only
- **ERP**: Flat daily rate if no IU/OBU, otherwise based on actual gantry usage

### Test Cases Module

Includes 9 predefined test scenarios covering:

- Pre-2027 calculations with various waivers
- Post-2027 calculations
- Boundary-straddling trips (across 2027 rate change)
- Different vehicle types and checkpoint combinations
- School holiday scenarios
- Long stays with early exit waivers

Each test case displays the expected total fee and shows an error indicator (❌) if the computed result doesn't match the expected value.

---

# How to run this locally:

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd vep-calculator
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Usage

### Calculator Tab

1. Select vehicle category (Cars or Motorcycles)
2. Specify IU/OBU status
3. Enter precise entry date and time
4. Enter departure date and time
5. Select entry and departure checkpoints
6. Specify number of ERP days (if applicable)
7. Click "Calculate" to see fee breakdown

### Test Cases Tab

Run predefined test scenarios to validate calculations and understand different waiver applications.

## Technical Specifications

### Technology Stack

- **Framework**: Next.js 16.2.1
- **Frontend**: React 19.2.4
- **Language**: TypeScript
- **Styling**: CSS-in-JS
- **Build Tool**: Turbopack

### Architecture

- **Modular Structure**:
  - `/app`: Main application pages
  - `/components`: Reusable UI components
  - `/config`: Constants, messages, test cases
  - `/hooks`: Custom React hooks
  - `/utils`: Business logic, formatting, date utilities

### Key Components

- **VEPCalculator**: Main application with tab management
- **CalculatorForm**: Input form with validation
- **ResultTable**: Fee breakdown display
- **TestCaseCard**: Individual test case runner
- **useCalculatorForm**: Form state management

## Business Rules and Calculations

### VEP Day Determination

1. Calculate total calendar days of stay
2. For each calendar day, check waiver conditions:
   - Weekend/Public Holiday status
   - Pre-2027 waiver conditions
   - Entry/exit timing rules

### Rate Application

- Split chargeable days across 2027 boundary
- Apply appropriate rates (pre/post 2027)
- Calculate prorated charges for boundary-straddling trips

## Assumptions and Limitations

### Data Assumptions

- Public holidays and school holiday dates are predefined
- Toll rates are fixed and don't account for future changes
- ERP charges without IU use flat daily rates

### Functional Limitations

- Maximum stay calculation: 250 days
- Only supports cars and motorcycles
- Only Woodlands and Tuas checkpoints
- ERP calculation for IU-equipped vehicles shows informational message only

### Important Notes

- **Indicative Only**: Results are estimates and may differ from actual LTA fees
- **No Official Integration**: Not connected to official LTA systems
- **Date Accuracy**: Public holiday and school holiday dates may not reflect latest announcements
- **ERP with IU**: Actual gantry usage charges not calculated - refer to published ERP rates

## Testing

The application includes comprehensive test cases covering all major scenarios:

- Rate boundary transitions
- All waiver types
- Different vehicle categories
- Checkpoint combinations
- IU/OBU status variations

### Test Case Features

- **Expected Totals**: Each test case shows the expected total fee
- **Error Indicators**: Red ❌ icon appears when computed total doesn't match expected value
- **Run All Tests**: Button to execute all test cases simultaneously
- **Individual Execution**: Run each test case separately for detailed analysis

Run tests through the "Test Cases" tab in the application.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure the build passes
6. Submit a pull request

## License

This project is private and proprietary.

## Disclaimer

This calculator provides indicative fee estimates only. Actual fees may vary based on:

- Changes in LTA regulations
- Updated public holiday declarations
- Actual ERP gantry usage
- Other factors not accounted for in this tool

Always verify fees with official LTA sources before travel.
