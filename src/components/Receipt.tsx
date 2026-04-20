import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#666",
  },
  value: {
    fontSize: 10,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eee",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  col1: { width: "50%" },
  col2: { width: "15%", textAlign: "right" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  tableCellText: {
    fontSize: 9,
  },
  totalSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 10,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#999",
  },
});

type ReceiptProps = {
  transactionId: string;
  receiptNumber: string;
  transactionDate: string;
  eventName: string;
  eventLocation: string;
  eventDate: string;
  customerEmail: string;
  customerPhone: string;
  ticketType: string;
  quantity: number;
  pricePerTicket: number;
  totalAmount: number;
  paymentMethod: string;
};

const ReceiptDocument = (props: ReceiptProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>RECEIPT</Text>
        <Text style={styles.subtitle}>Hizitickets - Event Ticketing System</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Receipt Number:</Text>
          <Text style={styles.value}>{props.receiptNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID:</Text>
          <Text style={styles.value}>{props.transactionId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Transaction:</Text>
          <Text style={styles.value}>{props.transactionDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{props.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendor Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Vendor Name:</Text>
          <Text style={styles.value}>Hizitickets</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>Nairobi, Kenya</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Contact:</Text>
          <Text style={styles.value}>support@hizitickets.com</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{props.customerEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{props.customerPhone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Event Name:</Text>
          <Text style={styles.value}>{props.eventName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Event Date:</Text>
          <Text style={styles.value}>{props.eventDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Event Location:</Text>
          <Text style={styles.value}>{props.eventLocation}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Itemized Description</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellText, styles.col1]}>{props.ticketType}</Text>
            <Text style={[styles.tableCellText, styles.col2]}>{props.quantity}</Text>
            <Text style={[styles.tableCellText, styles.col3]}>KES {props.pricePerTicket.toFixed(2)}</Text>
            <Text style={[styles.tableCellText, styles.col4]}>KES {props.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>KES {props.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for your purchase!</Text>
        <Text style={styles.footerText}>For support, contact support@hizitickets.com</Text>
      </View>
    </Page>
  </Document>
);

export default ReceiptDocument;