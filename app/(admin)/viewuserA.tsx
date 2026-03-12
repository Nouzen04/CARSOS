import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { DataTable } from "react-native-paper";



export default function ViewUser() {

    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([2, 3, 4]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[0]
    );

    const [dummy] = React.useState([
        {
            key: 1,
            name: 'ali',
            email: 'ali@example.com',
            phone: 1234567890,
            address: '123 Main St',
        },
        {
            key: 2,
            name: 'Eclair',
            email: 'eclair@example.com',
            phone: 1234567890,
            address: '123 Main St',
        },
        {
            key: 3,
            name: 'Frozen yogurt',
            email: 'frozen@example.com',
            phone: 1234567890,
            address: '123 Main St',
        },
        {
            key: 4,
            name: 'Gingerbread',
            email: 'ginger@example.com',
            phone: 1234567890,
            address: '123 Main St',
        },
    ]);
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, dummy.length);

    React.useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.DataTableWrapper}>
                    <DataTable>
                        <DataTable.Header style={styles.DataTableHeader}>
                            <DataTable.Title textStyle={styles.headerTextStyle}>Name</DataTable.Title>
                            <DataTable.Title textStyle={styles.headerTextStyle}>Email</DataTable.Title>
                            <DataTable.Title textStyle={styles.headerTextStyle}>Phone</DataTable.Title>
                            <DataTable.Title textStyle={styles.headerTextStyle}>Address</DataTable.Title>
                        </DataTable.Header>
                        {dummy.slice(from, to).map((item) => (
                            <DataTable.Row key={item.key} style={styles.DataTableRow}>
                                <DataTable.Cell textStyle={styles.cellTextStyle}>{item.name}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.cellTextStyle}>{item.email}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.cellTextStyle}>{item.phone}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.cellTextStyle}>{item.address}</DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                    <View style={styles.paginationContainer}>
                        <DataTable.Pagination
                            page={page}
                            numberOfPages={Math.ceil(dummy.length / itemsPerPage)}
                            onPageChange={(page) => setPage(page)}
                            label={`${from + 1}-${to} of ${dummy.length}`}
                            numberOfItemsPerPageList={numberOfItemsPerPageList}
                            onItemsPerPageChange={onItemsPerPageChange}
                            numberOfItemsPerPage={itemsPerPage}
                            showFastPaginationControls
                            selectPageDropdownLabel={'Rows per page'}
                            theme={{ colors: { onSurface: '#000', onSurfaceVariant: '#000' } }}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f8fb', // Soft clean background
    },
    scrollContainer: {
        padding: 16,
    },
    DataTableWrapper: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        // Shadow for premium look
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    DataTableHeader: {
        backgroundColor: '#f1f5f9',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingHorizontal: 8,
    },
    headerTextStyle: {
        color: '#475569',
        fontWeight: 'bold',
        fontSize: 13,
    },
    DataTableRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingHorizontal: 8,
    },
    cellTextStyle: {
        color: '#1e293b',
        fontSize: 14,
    },
    paginationContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingVertical: 4,
    },
});

