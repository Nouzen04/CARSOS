import React from "react";
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import { DataTable, IconButton } from "react-native-paper";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function ViewUser() {
    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([5, 10, 20]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[0]
    );

    const [users, setUsers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Real-time listener for users collection
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const userList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, "users", userId));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const headers = [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
        { label: 'Role', key: 'role' },
    ];

    const handleExportCSV = async () => {
        try {
            // 1. Generate CSV string
            const headerRow = headers.map(h => h.label).join(',');
            const bodyRows = users.map(user => 
                headers.map(h => `"${user[h.key] || ''}"`).join(',')
            ).join('\n');
            const csvString = `${headerRow}\n${bodyRows}`;

            if (Platform.OS === 'web') {
                // 2a. Web: Trigger browser download
                const blob = new Blob([csvString], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', 'users.csv');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                // 2b. Mobile: Use FileSystem and Sharing
                const fileUri = FileSystem.cacheDirectory + 'users.csv';
                await FileSystem.writeAsStringAsync(fileUri, csvString);
                
                const isSharingAvailable = await Sharing.isAvailableAsync();
                if (isSharingAvailable) {
                    await Sharing.shareAsync(fileUri);
                } else {
                    Alert.alert("Sharing is not available on this device");
                }
            }
        } catch (error) {
            console.error("Export error:", error);
            Alert.alert("Error", "Failed to export CSV.");
        }
    };

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, users.length);

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
                            <DataTable.Title textStyle={styles.headerTextStyle}>Role</DataTable.Title>
                            <DataTable.Title numeric textStyle={styles.headerTextStyle}>Actions</DataTable.Title>
                        </DataTable.Header>
                        {users.slice(from, to).map((item) => (
                            <DataTable.Row key={item.id} style={styles.DataTableRow}>
                                <DataTable.Cell textStyle={styles.cellTextStyle}>{item.name}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.cellTextStyle}>{item.email}</DataTable.Cell>
                                <DataTable.Cell textStyle={styles.cellTextStyle}>{item.role}</DataTable.Cell>
                                <DataTable.Cell numeric>
                                    <IconButton
                                        icon="delete"
                                        iconColor="#ff4444"
                                        size={20}
                                        onPress={() => handleDeleteUser(item.id)}
                                    />
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                        <DataTable.Pagination
                            page={page}
                            numberOfPages={Math.ceil(users.length / itemsPerPage)}
                            onPageChange={(page) => setPage(page)}
                            label={`${from + 1}-${to} of ${users.length}`}
                            numberOfItemsPerPageList={numberOfItemsPerPageList}
                            onItemsPerPageChange={onItemsPerPageChange}
                            numberOfItemsPerPage={itemsPerPage}
                            showFastPaginationControls
                            selectPageDropdownLabel={'Rows per page'}
                        />
                    </DataTable>
                </View>
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity 
                        style={styles.csvLink} 
                        onPress={handleExportCSV}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.csvLinkText}>Export to CSV</Text>
                    </TouchableOpacity>
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
    csvLink: {
        backgroundColor: '#007bff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    csvLinkText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
