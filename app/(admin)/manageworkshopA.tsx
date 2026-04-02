import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DataTable } from "react-native-paper";

export default function ManageWorkshop() {
    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([3, 5, 10]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(numberOfItemsPerPageList[0]);

    const [workshops, setWorkshops] = React.useState([
        {
            key: 1,
            orgName: 'AutoFix Mechanics',
            address: '123 Engine Blvd, Motor City',
            contact: '012-3456789',
            status: 'Pending',
        },
        {
            key: 2,
            orgName: 'Speedy Tyres & Services',
            address: '45 Wheel Array, Auto Town',
            contact: '019-8765432',
            status: 'Pending',
        },
        {
            key: 3,
            orgName: 'Pro Care Auto',
            address: '78 Spark Plug Street, Gear City',
            contact: '011-2345678',
            status: 'Pending',
        },
        {
            key: 4,
            orgName: 'Elite Motors Bengkel',
            address: '99 Turbo Ave, Central Dist',
            contact: '016-5554443',
            status: 'Pending',
        },
    ]);

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, workshops.length);

    React.useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);

    const handleViewFiles = (orgName: string) => {
        console.log(`Viewing forms and files for ${orgName}`);
        alert(`Opening verification documents for ${orgName}...`);
    };

    const handleConfirm = (key: number, orgName: string) => {
        setWorkshops(workshops.filter(w => w.key !== key));
        console.log(`Confirmed workshop: ${orgName}`);
        alert(`${orgName} has been verified and confirmed!`);
    };

    const handleReject = (key: number, orgName: string) => {
        setWorkshops(workshops.filter(w => w.key !== key));
        console.log(`Rejected workshop: ${orgName}`);
        alert(`${orgName} has been rejected!`);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                <View style={styles.headerContainer}>
                    <Text style={styles.screenTitle}>Pending Registrations</Text>
                    <Text style={styles.screenSubtitle}>Review submitted forms and files to verify workshop credibility.</Text>
                </View>

                <View style={styles.DataTableWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <DataTable>
                            <DataTable.Header style={styles.DataTableHeader}>
                                <DataTable.Title textStyle={styles.headerTextStyle} style={{ flex: 2 }}>Organisation</DataTable.Title>
                                <DataTable.Title textStyle={styles.headerTextStyle} style={{ flex: 3 }}>Address</DataTable.Title>
                                <DataTable.Title textStyle={styles.headerTextStyle} style={{ flex: 2 }}>Contact</DataTable.Title>
                                <DataTable.Title textStyle={styles.headerTextStyle} style={{ flex: 2.5, right: 0, justifyContent: 'center' }}>Actions</DataTable.Title>
                            </DataTable.Header>

                            {workshops.slice(from, to).map((item) => (
                                <DataTable.Row key={item.key} style={styles.DataTableRow}>
                                    <DataTable.Cell textStyle={styles.cellTextStyle} style={{ flex: 2 }}>{item.orgName}</DataTable.Cell>
                                    <DataTable.Cell textStyle={styles.cellTextStyle} style={{ flex: 3 }}>{item.address}</DataTable.Cell>
                                    <DataTable.Cell textStyle={styles.cellTextStyle} style={{ flex: 2 }}>{item.contact}</DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 2.5, justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={[styles.btn, styles.viewBtn]}
                                                onPress={() => handleViewFiles(item.orgName)}
                                            >
                                                <Text style={styles.btnText}>Files</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.btn, styles.confirmBtn]}
                                                onPress={() => handleConfirm(item.key, item.orgName)}
                                            >
                                                <Text style={styles.btnText}>Confirm</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.btn, styles.rejectBtn]}
                                                onPress={() => handleReject(item.key, item.orgName)}
                                            >
                                                <Text style={styles.btnText}>Reject</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </ScrollView>

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
