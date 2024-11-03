import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const GeneratePDF = (csvPDFData, pdfHeadings) => {
  const DocumentComponent = (
    <Document>
      <Page size="A4" wrap={false}>
        <View style={styles.page}>
          {splitIntoTables(csvPDFData).map((tableData, tableIndex) => {
            return (
              <View key={tableIndex}>
                <Text style={{ marginBottom: 10 }}>
                  {pdfHeadings[tableIndex]}
                </Text>
                <View style={styles.table}>
                  <View
                    style={{
                      ...styles.tableRow,
                      color: '#ffffff',
                      backgroundColor: '#636363',
                    }}
                  >
                    <Text style={{ ...styles.tableCell, flex: 5 }}>
                      Module Sub Module
                    </Text>
                    <Text style={styles.tableCellPerm}>Read</Text>
                    <Text style={styles.tableCellPerm}>Write</Text>
                    <Text style={styles.tableCellPerm}>Archive</Text>
                  </View>
                  {tableData.map((row, rowIndex) => {
                    const [module, read, write, archive] = row.split(',');
                    return (
                      <View
                        key={rowIndex}
                        style={{ ...styles.tableRow, display: 'flex' }}
                      >
                        <View
                          style={{
                            ...styles.tableCell,
                            flex: 5,
                            backgroundColor:
                              module.search(/\S/) === 1
                                ? '#E6ECF5'
                                : module.search(/\S/) === 12
                                ? '#EFEFEF'
                                : '#ffffff',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              paddingLeft: module.search(/\S/) * 3,
                            }}
                          >
                            {module}
                          </Text>
                        </View>
                        {[read, write, archive].map((perm, i) => (
                          <Text
                            key={i}
                            style={[
                              styles.tableCellPerm,
                              {
                                color: perm === 'Yes' ? '#89BA78' : '#FF2D2C',
                                backgroundColor: perm ? '#ffffff' : '#EFEFEF',
                              },
                            ]}
                          >
                            {perm}
                          </Text>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );

  return DocumentComponent;
};

export default GeneratePDF;

const splitIntoTables = (data, heading) => {
  const tables = [];
  let currentTable = [];

  data.forEach((row) => {
    if (row.trim() === '') {
      return;
    }
    const leadingSpaces = row.search(/\S/);
    if (leadingSpaces === 0) {
      tables.push([...currentTable]);
      currentTable = [];
    } else currentTable.push(row);
  });

  if (currentTable.length > 1) {
    tables.push(currentTable);
  }
  tables.shift();
  return tables;
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 0.1,
    borderCollapse: 'collapse',
    marginBottom: 30,
  },
  tableRow: {
    width: '100%',
    flexDirection: 'row',
    borderBottomWidth: 0.1,
    borderStyle: 'solid',
  },
  tableCell: {
    padding: 5,
    flex: 1,
    fontSize: 10,
  },
  tableCellPerm: {
    padding: 5,
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
    color: '#ffffff',
  },
});
