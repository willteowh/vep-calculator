export const resultStyles = {
  wrapper: {
    paddingTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tableContainer: {
    border: "1px solid #E1E4E8",
    borderRadius: "8px",
    mt: 0,
    mb: 0,
    p: 0,
    overflow: "hidden",
    backgroundColor: "#fff",
    "& .MuiTableCell-root": { fontSize: "1rem" },
  },
  tableStyle: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  tableHead: {
    backgroundColor: "#F5F5FF",
    borderBottom: "1px solid #E1E4E8",
  },
  tableHeaderCell: {
    fontWeight: 700,
    color: "#333",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
  },
  tableCell: {
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
  },
  tableFooterCell: {
    padding: "12px 16px",
    borderBottom: "none",
  },
  itemCell: {
    color: "#333",
  },
  totalCell: {
    backgroundColor: "#f5f5ff",
  },
  amountCell: {
    textAlign: "right" as const,
    color: "#333",
  },
  subTextCell: {},
  warningCard: {
    backgroundColor: "#fff7e6",
    border: "1px solid #ed6c02",
    boxShadow: "none",
    borderRadius: "8px",
  },
  infoCard: {
    backgroundColor: "#eef5ff",
    border: "1px solid #0288d1",
    borderRadius: "8px",
    py: 0.5,
    boxShadow: "none",
  },
  noticeContent: {
    display: "flex",
    alignItems: "center",
    py: 1,
    "&:last-child": {
      pb: 1,
    },
  },
  InfoIcon: {
    color: "#2847D8",
    flexShrink: 0,
    mr: 2,
    fontSize: 18,
  },
  erpInfoText: {
    fontSize: 18,
    lineHeight: 1.4,
    fontWeight: 400,
    color: "#2C2F36",
  },
  disclaimerCard: {
    border: "1px solid #e5e7eb",
    boxShadow: "none",
    backgroundColor: "#F2F2FA",
    borderRadius: "8px",
  },
  disclaimerContent: {
    lineHeight: 1.6,
  },
} as const;
