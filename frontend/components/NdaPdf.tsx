import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Block, Inline, NdaDocument } from "@/lib/nda/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 60,
    paddingHorizontal: 64,
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.45,
  },
  h1: { fontSize: 18, fontFamily: "Times-Bold", textAlign: "center", marginBottom: 12 },
  h2: { fontSize: 11, fontFamily: "Times-Bold", marginTop: 10, marginBottom: 4 },
  h3: { fontSize: 12, fontFamily: "Times-Bold", marginTop: 12, marginBottom: 2 },
  paragraph: { marginVertical: 4 },
  clause: { marginVertical: 5, textAlign: "justify" },
  bold: { fontFamily: "Times-Bold" },
  link: { color: "#3730a3" },
  table: { marginTop: 10, marginBottom: 12, borderTopWidth: 1, borderLeftWidth: 1, borderColor: "#a1a1aa" },
  row: { flexDirection: "row" },
  cell: { flex: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#a1a1aa", padding: 6, minHeight: 26 },
  labelCell: { fontFamily: "Times-Bold" },
  headerCell: { fontFamily: "Times-Bold", textAlign: "center" },
});

function renderInline(inline: Inline, index: number) {
  switch (inline.kind) {
    case "text":
      return inline.bold ? (
        <Text key={index} style={styles.bold}>
          {inline.text}
        </Text>
      ) : (
        inline.text
      );
    case "link":
      return (
        <Link key={index} src={inline.href} style={styles.link}>
          {inline.text}
        </Link>
      );
    case "term":
    case "field":
      return inline.text;
  }
}

function renderBlock(block: Block, index: number) {
  switch (block.kind) {
    case "heading":
      return (
        <Text key={index} style={styles[`h${block.level}`]} minPresenceAhead={40}>
          {block.text}
        </Text>
      );
    case "paragraph":
      return (
        <Text key={index} style={styles.paragraph}>
          {block.content.map(renderInline)}
        </Text>
      );
    case "clause":
      return (
        <Text key={index} style={styles.clause}>
          {`${block.number}. `}
          {block.content.map(renderInline)}
        </Text>
      );
    case "table":
      return (
        <View key={index} style={styles.table} wrap={false}>
          <View style={styles.row}>
            {block.header.map((cell, cellIndex) => (
              <Text key={cellIndex} style={[styles.cell, styles.headerCell]}>
                {cell}
              </Text>
            ))}
          </View>
          {block.rows.map(([label, ...values]) => (
            <View key={label} style={styles.row}>
              <Text style={[styles.cell, styles.labelCell]}>{label}</Text>
              {values.map((value, cellIndex) => (
                <Text key={cellIndex} style={styles.cell}>
                  {value}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
  }
}

/** The filled-in NDA as a react-pdf document: cover page, then Standard Terms. */
export function NdaPdf({ nda }: { nda: NdaDocument }) {
  return (
    <Document title="Mutual Non-Disclosure Agreement" creator="Prelegal" producer="Prelegal">
      <Page size="LETTER" style={styles.page}>
        {nda.coverPage.map(renderBlock)}
      </Page>
      <Page size="LETTER" style={styles.page}>
        {nda.standardTerms.map(renderBlock)}
      </Page>
    </Document>
  );
}
