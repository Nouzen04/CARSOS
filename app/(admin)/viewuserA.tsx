import React from "react";
import { CSVLink } from "react-csv";
import { ScrollView, StyleSheet, View } from "react-native";
import { DataTable, IconButton } from "react-native-paper";
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
                <View>
                    <CSVLink data={users} headers={headers} filename={'users.csv'} style={styles.csvLink}>
                        Export to CSV
                    </CSVLink>
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
        color: '#fff',
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
        textAlign: 'center',
        marginTop: 20,
        textDecorationLine: 'none',
        fontWeight: 'bold',
        overflow: 'hidden',
    },
});
