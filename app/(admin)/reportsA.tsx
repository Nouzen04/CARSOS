import { Href, router } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, DataTable } from "react-native-paper";
import { db } from "../../firebase";

export default function Report() {

    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([3, 5, 10]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(numberOfItemsPerPageList[0]);
    const [workshops, setWorkshops] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Fetch only verified workshops for reporting
        const q = query(
            collection(db, "users"),
            where("role", "==", "bengkel"),
            where("verified", "==", true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWorkshops(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching reports:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, workshops.length);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.DataTableWrapper}>
                    <DataTable>
                        <DataTable.Header style={styles.DataTableHeader}>
                            <DataTable.Title textStyle={styles.headerTextStyle} style={{ flex: 2 }}>Organisation</DataTable.Title>
                            <DataTable.Title textStyle={styles.headerTextStyle} style={{ flex: 3 }}>Address</DataTable.Title>
                            <DataTable.Title textStyle={styles.headerTextStyle} style={{ flex: 2 }}>Contact</DataTable.Title>
                            <DataTable.Title textStyle={styles.headerTextStyle} style={{ flex: 2.5, right: 0, justifyContent: 'center' }}>Actions</DataTable.Title>
                        </DataTable.Header>

                        {loading ? (
                            <ActivityIndicator style={{ margin: 20 }} color="#3b82f6" />
                        ) : workshops.slice(from, to).map((item) => (
                            <DataTable.Row key={item.id} style={styles.DataTableRow}>
                                <DataTable.Cell textStyle={styles.cellTextStyle} style={{ flex: 2 }}>{item.name || 'Unnamed'}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.cellTextStyle} style={{ flex: 3 }}>{item.address || 'N/A'}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.cellTextStyle} style={{ flex: 2 }}>{item.phone || 'N/A'}</DataTable.Cell>
                                <DataTable.Cell style={{ flex: 2.5, justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.btn, styles.viewBtn]}
                                            onPress={() => router.push({
                                                pathname: '/(admin)/reportDetail',
                                                params: { id: item.id, name: item.name }
                                            } as any)}
                                        >
                                            <Text style={styles.btnText}>View Detail</Text>
                                        </TouchableOpacity>
                                    </View>
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>

                    <View style={styles.paginationContainer}>
                        <DataTable.Pagination
                            page={page}
                            numberOfPages={Math.ceil(workshops.length / itemsPerPage)}
                            onPageChange={(page) => setPage(page)}
                            label={`${from + 1}-${to} of ${workshops.length}`}
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
        backgroundColor: '#f6f8fb',
    },
    scrollContainer: {
        padding: 16,
    },
    headerContainer: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    screenSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 6,
    },
    DataTableWrapper: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
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
        paddingHorizontal: 12,
        minHeight: 56,
    },
    headerTextStyle: {
        color: '#475569',
        fontWeight: 'bold',
        fontSize: 13,
    },
    DataTableRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingHorizontal: 12,
        minHeight: 70,
    },
    cellTextStyle: {
        color: '#1e293b',
        fontSize: 13,
    },
    paginationContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingVertical: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    btn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    viewBtn: {
        backgroundColor: '#3b82f6',
    },
    confirmBtn: {
        backgroundColor: '#10b981',
    },
    btnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    rejectBtn: {
        backgroundColor: '#ef4444',
    },
});